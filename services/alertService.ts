import { supabase } from './supabase';
import { IntelligentAlert, AlertType, AlertCategory, InventoryItem, MenuPlan } from '../types';

export const alertService = {

    /**
     * Obtém todos os alertas ativos, opcionalmente filtrados por escola.
     */
    getAlerts: async (schoolId?: string): Promise<IntelligentAlert[]> => {
        let query = supabase
            .from('alertas_inteligentes')
            .select('*, escola:escolas(nome)')
            .eq('resolvido', false)
            .order('data_geracao', { ascending: false });

        if (schoolId) query = query.eq('escola_id', schoolId);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    /**
     * Resolve um alerta.
     */
    resolveAlert: async (alertId: string): Promise<void> => {
        const { error } = await supabase
            .from('alertas_inteligentes')
            .update({
                resolvido: true,
                data_resolucao: new Date().toISOString()
            })
            .eq('id', alertId);

        if (error) throw error;
    },

    /**
     * Gera alertas inteligentes para uma escola específica.
     * Cruza dados de estoque, cardápio e consumo planejado.
     */
    generateSchoolAlerts: async (schoolId: string): Promise<void> => {
        try {
            // 1. Buscar Estoque Atual
            const { data: inventory, error: stockError } = await supabase
                .from('inventory_items')
                .select('*')
                .eq('ativo', true);

            if (stockError) throw stockError;

            // 2. Buscar Cardápio Ativo/Aprovado
            const { data: menu, error: menuError } = await supabase
                .from('menu_plans')
                .select('*, dishes:menu_dishes(*)')
                .eq('escola_id', schoolId)
                .eq('status', 'APROVADO')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // Alertas de estoque baixo (baseado no mínimo configurado)
            await alertService.checkStockLevels(schoolId, inventory as InventoryItem[]);

            // Novas vistorias de irregularidade
            await alertService.checkUnconfirmedDeliveries(schoolId);
            await alertService.checkIrregularConsumption(schoolId);
            await alertService.checkUserInactivity();

            // Se houver cardápio, validar viabilidade
            if (menu) {
                await alertService.checkMenuFeasibility(schoolId, menu as any, inventory as InventoryItem[]);
            }

        } catch (err) {
            console.error('Erro ao gerar alertas:', err);
        }
    },

    /**
     * Verifica se os níveis de estoque estão abaixo do mínimo.
     */
    checkStockLevels: async (schoolId: string, inventory: InventoryItem[]): Promise<void> => {
        for (const item of inventory) {
            if (item.saldo_atual <= (item.estoque_minimo || 0)) {
                const severity = item.saldo_atual === 0 ? AlertType.CRITICO : AlertType.ATENCAO;
                const msg = item.saldo_atual === 0
                    ? `O item ${item.nome} acabou no estoque.`
                    : `O item ${item.nome} está abaixo do estoque mínimo (${item.saldo_atual}${item.unidade_medida}).`;

                await alertService.createAlertIfNotExist({
                    escola_id: schoolId,
                    tipo_alerta: severity,
                    categoria: AlertCategory.ESTOQUE_BAIXO,
                    titulo: `Estoque Baixo: ${item.nome}`,
                    descricao: msg,
                    referencia_id: item.id
                });
            }
        }
    },

    /**
     * Valida se o estoque é suficiente para cumprir o cardápio aprovado.
     */
    checkMenuFeasibility: async (schoolId: string, menu: any, inventory: InventoryItem[]): Promise<void> => {
        const requirements: Record<string, number> = {};

        // Consolidar necessidades do cardápio
        menu.dishes?.forEach((dish: any) => {
            const ingredientes = dish.ingredientes || [];
            ingredientes.forEach((ing: any) => {
                const qtyKg = (ing.perCapitaGrams * menu.num_alunos * menu.dias_letivos) / 1000;
                requirements[ing.itemId] = (requirements[ing.itemId] || 0) + qtyKg;
            });
        });

        for (const [itemId, needed] of Object.entries(requirements)) {
            const item = inventory.find(i => i.id === itemId);
            if (!item || item.saldo_atual < needed) {
                const faltante = needed - (item?.saldo_atual || 0);
                await alertService.createAlertIfNotExist({
                    escola_id: schoolId,
                    tipo_alerta: AlertType.CRITICO,
                    categoria: AlertCategory.CARDAPIO_INVIAVEL,
                    titulo: `Cardápio Inviável: ${item?.nome || 'Item não encontrado'}`,
                    descricao: `Estoque insuficiente para cumprir o cardápio planejado. Necessário: ${needed.toFixed(1)}kg. Disponível: ${item?.saldo_atual || 0}kg. Faltam: ${faltante.toFixed(1)}kg.`,
                    referencia_id: menu.id
                });
            }
        }
    },

    /**
     * Helper para criar alerta apenas se não existir um igual não resolvido.
     */
    createAlertIfNotExist: async (alert: Partial<IntelligentAlert>): Promise<void> => {
        const { data: existing } = await supabase
            .from('alertas_inteligentes')
            .select('id')
            .match({
                escola_id: alert.escola_id,
                categoria: alert.categoria,
                referencia_id: alert.referencia_id,
                resolvido: false
            })
            .maybeSingle();

        if (!existing) {
            await supabase.from('alertas_inteligentes').insert({
                ...alert,
                data_geracao: new Date().toISOString()
            });
        }
    },

    /**
     * Verifica inatividade prolongada de usuários (mais de 15 dias).
     */
    checkUserInactivity: async (): Promise<void> => {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const { data: users, error } = await supabase
            .from('usuarios')
            .select('id, nome, perfil, created_at')
            .eq('ativo', true);

        if (error) throw error;

        // Nota: Como não temos last_login direto na tabela usuarios, 
        // poderíamos olhar logs_auditoria para o último acesso.
        for (const user of users) {
            const { data: lastLog } = await supabase
                .from('logs_auditoria')
                .select('data_hora')
                .eq('usuario_id', user.id)
                .order('data_hora', { ascending: false })
                .limit(1)
                .maybeSingle();

            const lastAccess = lastLog ? new Date(lastLog.data_hora) : new Date(user.created_at);

            if (lastAccess < fifteenDaysAgo) {
                await alertService.createAlertIfNotExist({
                    tipo_alerta: AlertType.ATENCAO,
                    categoria: AlertCategory.INATIVIDADE_USUARIO,
                    titulo: `Inatividade: ${user.nome}`,
                    descricao: `Usuário (${user.perfil}) sem atividade registrada há mais de 15 dias.`,
                    referencia_id: user.id
                });
            }
        }
    },

    /**
     * Verifica se há mercadorias entregues mas não confirmadas há mais de 48h.
     */
    checkUnconfirmedDeliveries: async (schoolId: string): Promise<void> => {
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        const { data: pending } = await supabase
            .from('estoque_movimentacoes')
            .select('*')
            .eq('escola_id', schoolId)
            .eq('tipo', 'ENTRADA')
            .lt('data', fortyEightHoursAgo.toISOString())
            .is('justificativa', null); // Assumindo que justificativa vazia = não auditado/confirmado

        if (pending && pending.length > 0) {
            await alertService.createAlertIfNotExist({
                escola_id: schoolId,
                tipo_alerta: AlertType.ATENCAO,
                categoria: AlertCategory.RECEBIMENTO_NAO_CONFIRMADO,
                titulo: 'Recebimento Não Confirmado',
                descricao: `Existem ${pending.length} entradas de estoque pendentes de confirmação há mais de 48h.`,
                referencia_id: schoolId
            });
        }
    },

    /**
     * Verifica consumo irregular (saídas sem cardápio ou acima do planejado).
     */
    checkIrregularConsumption: async (schoolId: string): Promise<void> => {
        // Busca saídas dos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: movements } = await supabase
            .from('estoque_movimentacoes')
            .select('*, produto:estoque_produtos(nome_produto)')
            .eq('escola_id', schoolId)
            .eq('tipo', 'SAIDA')
            .gt('data', sevenDaysAgo.toISOString());

        if (!movements) return;

        // Cruza com cardápio para ver se a saída era esperada
        // (Lógica simplificada para MVP)
        for (const mov of movements) {
            if (mov.quantidade > 50) { // Threshold arbitrário para exemplo
                await alertService.createAlertIfNotExist({
                    escola_id: schoolId,
                    tipo_alerta: AlertType.CRITICO,
                    categoria: AlertCategory.CONSUMO_EXCESSIVO,
                    titulo: `Consumo Elevado: ${mov.produto?.nome_produto}`,
                    descricao: `Detectada saída de ${mov.quantidade} unidades. Volume superior à média esperada para o período.`,
                    referencia_id: mov.id
                });
            }
        }
    }
};
