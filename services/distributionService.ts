import { supabase } from './supabase';
import { Distribution, DistributionItem, DistributionStatus, StockMovement } from '../types';
import { auditService } from './auditService';

export const distributionService = {
    /**
     * Lista distribuições com filtros opcionais
     */
    async listDistributions(filters?: { escola_id?: string, status?: DistributionStatus }) {
        let query = supabase
            .from('distribuicoes')
            .select('*, escola:escolas(*), itens:distribuicao_itens(*, produto:inventory_items(*))')
            .order('created_at', { ascending: false });

        if (filters?.escola_id) query = query.eq('escola_id', filters.escola_id);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data as Distribution[];
    },

    /**
     * Obtém uma distribuição específica por ID
     */
    async getDistributionById(id: string) {
        const { data, error } = await supabase
            .from('distribuicoes')
            .select('*, escola:escolas(*), itens:distribuicao_itens(*, produto:inventory_items(*))')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Distribution;
    },

    /**
     * Cria uma nova Ordem de Distribuição (Saída do Estoque Central)
     */
    async createDistribution(
        distribution: Omit<Distribution, 'id' | 'created_at' | 'updated_at' | 'status'>,
        items: Omit<DistributionItem, 'id' | 'distribuicao_id' | 'created_at'>[],
        userId: string
    ) {
        // 1. Inserir a distribuição pai
        const { data: distData, error: distError } = await supabase
            .from('distribuicoes')
            .insert({
                ...distribution,
                status: DistributionStatus.AGUARDANDO_CONFIRMACAO,
                data_envio: new Date().toISOString()
            })
            .select()
            .single();

        if (distError) throw distError;

        // 2. Inserir os itens vinculados
        const itemsToInsert = items.map(item => ({
            ...item,
            distribuicao_id: distData.id
        }));

        const { error: itemsError } = await supabase
            .from('distribuicao_itens')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // 3. Gerar Movimentações de Saída no Estoque Central
        for (const item of items) {
            const { error: movError } = await supabase
                .from('inventory_movements')
                .insert({
                    item_id: item.produto_id,
                    tipo: 'SAIDA',
                    quantidade: item.quantidade_enviada,
                    data_movimento: new Date().toISOString(),
                    author_id: userId,
                    lote: item.lote,
                    validade: item.validade,
                    finalidade: 'REPOSICAO',
                    referencia: `OD-${distData.id.slice(0, 8)}`,
                    observacao: `Distribuição para ${distData.escola_id}`
                });

            if (movError) console.error("Erro ao gerar movimento de estoque:", movError);
        }

        // AUDIT LOG
        await auditService.logAction(userId, 'EMISSAO_OD', 'distribuicoes', distData.id, { items });

        return distData as Distribution;
    },

    /**
     * Confirma o recebimento pela escola (Entrada no Estoque Setorial)
     */
    async confirmReceipt(
        distributionId: string,
        responsavelId: string,
        itemsConfirmation: { itemId: string, quantidadeRecebida: number, observacao?: string }[],
        observacoesGerais?: string,
        digitalSignature?: {
            declaracaoAceite: string;
            cargo: string;
            comprovanteFile?: File;
        }
    ) {
        // 0. Upload de comprovante se houver
        let comprovanteUrl = '';
        if (digitalSignature?.comprovanteFile) {
            comprovanteUrl = await this.uploadComprovante(distributionId, digitalSignature.comprovanteFile);
        }

        // 1. Calcular divergências antes de atualizar o status
        let totalDivergence = 0;
        for (const conf of itemsConfirmation) {
            const { data: distItem } = await supabase
                .from('distribuicao_itens')
                .select('quantidade_enviada')
                .eq('id', conf.itemId)
                .single();
            if (distItem && distItem.quantidade_enviada !== conf.quantidadeRecebida) {
                totalDivergence++;
            }
        }

        const finalStatus = totalDivergence > 0 ? DistributionStatus.ENTREGUE_COM_DIVERGENCIA : DistributionStatus.ENTREGUE;

        // 2. Atualizar a distribuição
        const { data: dist, error: updateError } = await supabase
            .from('distribuicoes')
            .update({
                status: finalStatus,
                data_recebimento: new Date().toISOString(),
                responsavel_recebimento_id: responsavelId,
                observacoes_recebimento: observacoesGerais,
                assinatura_digital_simples: !!digitalSignature,
                declaracao_aceite: digitalSignature?.declaracaoAceite,
                cargo_responsavel: digitalSignature?.cargo,
                comprovante_url: comprovanteUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', distributionId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Atualizar quantidades recebidas nos itens e gerar entrada na escola
        for (const conf of itemsConfirmation) {
            // Atualizar o item da distribuição
            const { error: itemUpdateError } = await supabase
                .from('distribuicao_itens')
                .update({
                    quantidade_recebida: conf.quantidadeRecebida,
                    observacao_item: conf.observacao
                })
                .eq('distribuicao_id', distributionId)
                .eq('id', conf.itemId);

            if (itemUpdateError) console.error("Erro ao atualizar item da distribuição:", itemUpdateError);

            // Buscar detalhes do item original para o movimento
            const { data: distItem } = await supabase
                .from('distribuicao_itens')
                .select('produto_id, lote, validade, quantidade_enviada')
                .eq('id', conf.itemId)
                .single();

            if (distItem && distItem.quantidade_enviada !== conf.quantidadeRecebida) {
                totalDivergence++;
            }

            // 3. Gerar Movimentação de ENTRADA na ESCOLA
            if (distItem) {
                const { error: movError } = await supabase
                    .from('inventory_movements')
                    .insert({
                        item_id: distItem.produto_id,
                        school_id: dist.escola_id,
                        tipo: 'ENTRADA',
                        quantidade: conf.quantidadeRecebida,
                        data_movimento: new Date().toISOString(),
                        author_id: responsavelId,
                        lote: distItem.lote,
                        validade: distItem.validade,
                        finalidade: 'RECEBIMENTO',
                        referencia: `OD-${distributionId.slice(0, 8)}`,
                        observacao: `Recebimento de carga Central. ${conf.observacao || ''}`
                    });

                if (movError) console.error("Erro ao gerar movimento de entrada na escola:", movError);
            }
        }

        // AUDIT LOG
        const actionType = totalDivergence > 0 ? 'RECEBIMENTO_COM_DIVERGENCIA' : 'RECEBIMENTO_CONFORME';
        await auditService.logAction(responsavelId, actionType, 'distribuicoes', distributionId, {
            items: itemsConfirmation,
            observacoes: observacoesGerais,
            digitalSignature: digitalSignature ? {
                cargo: digitalSignature.cargo,
                assinaturaAtiva: true,
                comprovante: !!comprovanteUrl
            } : null
        });

        return dist as Distribution;
    },

    /**
     * Cancela uma distribuição
     */
    async cancelDistribution(id: string, motivo: string, userId: string) {
        const { data, error } = await supabase
            .from('distribuicoes')
            .update({
                status: DistributionStatus.CANCELADO,
                observacoes_recebimento: `CANCELADO: ${motivo}`,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // AUDIT LOG
        await auditService.logAction(userId, 'CANCELAMENTO_OD', 'distribuicoes', id, { motivo });

        return data as Distribution;
    },

    /**
     * Faz o upload de um comprovante para o Supabase Storage
     */
    async uploadComprovante(distId: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${distId}_${Date.now()}.${fileExt}`;
        const filePath = `comprovantes/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documentos_logistica')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('documentos_logistica')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
