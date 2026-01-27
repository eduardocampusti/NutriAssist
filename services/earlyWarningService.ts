import { supabase } from './supabase';
import { generateTechnicalDocument } from './geminiService';
import { UserRole } from '../types';

export interface EarlyWarningTrigger {
    type: 'ESTOQUE' | 'CONSUMO' | 'SIMULACAO' | 'ZONA';
    title: string;
    description: string;
    impact: string;
    data: any;
}

export const earlyWarningService = {
    async checkStockAnomalies() {
        // Fetch current stock and logic to detect anomalies
        const { data: stock } = await supabase.from('estoque').select('*, alimentos(nome)');
        const anomalies = stock?.filter(s => s.quantidade < 10) || [];

        for (const item of anomalies) {
            await this.generatePreventiveReport({
                type: 'ESTOQUE',
                title: `Ruptura Iminente: ${item.alimentos?.nome}`,
                description: `O item ${item.alimentos?.nome} atingiu o nível crítico de ${item.quantidade} unidades em unidade monitorada.`,
                impact: 'Interrupção parcial do cardápio aprovado em 48h caso não haja reposição.',
                data: item
            });
        }
    },

    async checkZoneRisks() {
        const { riskIndicatorService } = await import('./riskIndicatorService');
        const zones = await riskIndicatorService.getZoneRiskIndicators();

        const criticalZones = zones.filter(z => z.riskLevel === 'ALTO');
        for (const zone of criticalZones) {
            await this.generatePreventiveReport({
                type: 'ZONA',
                title: `Criticidade Recorrente: Zona ${zone.zoneName}`,
                description: `A Zona ${zone.zoneName} atingiu um score de risco de ${zone.riskScore}, com ${zone.factors.criticalAlerts} alertas críticos ativos.`,
                impact: 'Risco de judicialização ou interrupção logística sistêmica na região.',
                data: zone
            });
        }
    },

    async checkConsumptionTrends() {
        const { data: executions } = await supabase.from('merendeira_execucao').select('*, escolas(nome)').limit(20);

        // Logique de detecção: se houver execuções com consumo zerado repetidamente
        const anomalies = executions?.filter(e => e.consumo_real === 0) || [];
        for (const e of anomalies) {
            await this.generatePreventiveReport({
                type: 'CONSUMO',
                title: `Anomalia de Consumo: ${e.escolas?.nome}`,
                description: `Detectada execução de cardápio com registro de consumo nulo para o prato ${e.prato_nome}.`,
                impact: 'Inconsistência nos dados de prestação de contas FNDE ou possível não oferta do prato.',
                data: e
            });
        }
    },

    async generatePreventiveReport(trigger: EarlyWarningTrigger) {
        try {
            const timestamp = new Date().getTime();
            const year = new Date().getFullYear();
            const protocol = `PREV-${trigger.type}-${year}-${timestamp.toString().slice(-4)}`;

            // Use Gemini to generate technical recommendations
            const context = {
                tipo: trigger.type,
                descricao: trigger.description,
                impacto: trigger.impact,
                dados: JSON.stringify(trigger.data)
            };

            const advice = await generateTechnicalDocument(
                'PARECER',
                'PLANO_ACAO_PREVENTIVO',
                context,
                trigger.title,
                UserRole.NUTRICIONISTA
            );

            const { error } = await supabase.from('relatorios_preventivos').insert({
                tipo_risco: trigger.type,
                descricao: trigger.title + ': ' + trigger.description,
                impacto_projetado: trigger.impact,
                acoes_recomendadas: advice.corpo + '\n\nConclusão: ' + advice.conclusao,
                contexto_dados: trigger.data,
                protocolo: protocol,
                data_geracao: new Date().toISOString()
            });

            if (error) throw error;
            console.log(`Relatório Preventivo Gerado: ${protocol}`);
        } catch (err) {
            console.error("Erro ao gerar relatório preventivo:", err);
        }
    },

    async getAllReports() {
        const { data, error } = await supabase
            .from('relatorios_preventivos')
            .select('*')
            .order('data_geracao', { ascending: false });
        if (error) throw error;
        return data;
    }
};
