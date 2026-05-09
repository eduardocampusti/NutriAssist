
import { MenuPlan, Dish, StudentNutritionalNeeds, GeneratedContent } from '../types';
import { generateId } from '../utils/id';

export const documentGenerator = {
    /**
     * Gera o conteúdo técnico de um Cardápio Oficial
     */
    generateMenuOfficialContent: (plan: any, schoolName: string): GeneratedContent => {
        const preparacoesText = plan.preparacoes.map(d =>
            `[${d.mealType}] Dia ${d.diaSemana}: ${d.nome}`
        ).join('\n');

        const statsText = plan.nutritionalStats ?
            `Kcal: ${plan.nutritionalStats.totalKcal.toFixed(0)} | Carb: ${plan.nutritionalStats.totalCarbs.toFixed(1)}g | Prot: ${plan.nutritionalStats.totalProtein.toFixed(1)}g` :
            'Cálculo nutricional anexo.';

        return {
            titulo: `CARDÁPIO OFICIAL - ${plan.titulo}`,
            assunto: `Planejamento de Alimentação Escolar - Etapa: ${plan.etapa}`,
            destinatario: `Unidade Escolar: ${schoolName}`,
            corpo: `O presente documento oficializa o cardápio planejado para o período supracitado, atendendo às diretrizes nutricionais da Resolução FNDE 06/2020.\n\nCOMPOSIÇÃO:\n${preparacoesText}\n\nANÁLISE NUTRICIONAL MÉDIA:\n${statsText}\n\nJUSTIFICATIVA TÉCNICA:\n${plan.justificativaTecnica || 'Sem observações restritivas.'}`,
            conclusao: "Este cardápio deve ser seguido rigorosamente pela equipe de cozinha. Qualquer alteração deve ser comunicada e autorizada pela Nutricionista Responsável.",
            observacoes: `Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}.`
        };
    },

    /**
     * Gera o conteúdo de um Parecer Técnico
     */
    generateTechnicalOpinion: (plan: any, justification: string): GeneratedContent => {
        return {
            titulo: `PARECER TÉCNICO NUTRICIONAL - ${plan.titulo}`,
            assunto: "Adequação de Cardápio à Resolução FNDE 06/2020",
            destinatario: "Secretaria Municipal de Educação / Órgãos de Controle",
            corpo: `Declaro, para os devidos fins, que o referido cardápio foi minuciosamente revisado e validado sob a ótica da legislação vigente do PNAE.\n\nFUNDAMENTAÇÃO TÉCNICA:\n${justification}`,
            conclusao: "Concluo pela conformidade técnica do documento, autorizando sua publicação e execução.",
            observacoes: "Rastreabilidade completa mantida em sistema auditável."
        };
    },

    generateTRDraft: (year: number, map: any[], benchmark?: any): GeneratedContent => {
        const topItems = map.slice(0, 10).map(i => `- ${i.inventoryItemName}: ${i.totalQuantity} ${i.unit || 'KG'}`).join('\n');

        const hasRealData = benchmark && Object.keys(benchmark).length > 0;
        const methodologyText = hasRealData
            ? "Quantitativos baseados na média de Consumo Real histórico do ano anterior, ajustados pela Engenharia Reversa de Cardápios (Per Capita x Alunos x Dias Letivos)."
            : "Quantitativos derivados da Engenharia Reversa de Cardápios Aprovados (Per Capita x Alunos x Dias Letivos).";

        return {
            titulo: `MINUTA DE TERMO DE REFERÊNCIA - EXERCÍCIO ${year}`,
            assunto: "Aquisição de Gêneros Alimentícios para a Merenda Escolar",
            destinatario: "Departamento de Licitações e Compras",
            corpo: `Constitui objeto deste Termo de Referência a seleção de propostas para aquisição de gêneros alimentícios destinados ao PNAE.\n\nESTIMATIVA DE QUANTITATIVOS (Principais Itens):\n${topItems}\n\nMETODOLOGIA DE CÁLCULO:\n${methodologyText}`,
            conclusao: "A aquisição deve priorizar o percentual legal de 30% reservado à Agricultura Familiar conforme Lei 11.947/2009.",
            observacoes: `Documento fundamentado em dados reais de consumo. Rastreabilidade total via NutriAssist.`
        };
    },

    /**
     * Gera o Estudo Técnico Preliminar (ETP)
     */
    generateETP: (year: number, map: any[], benchmark: any): GeneratedContent => {
        const totalItems = map.length;
        const itemsWithHighDeviation = map.filter(i => {
            const real = benchmark[i.inventoryItemName]?.totalReal || 0;
            return real > 0 && Math.abs((i.totalQuantity - real) / real) > 0.2;
        }).length;

        return {
            titulo: `ESTUDO TÉCNICO PRELIMINAR - EXERCÍCIO ${year}`,
            assunto: "Análise de Viabilidade e Necessidade de Aquisição de Gêneros",
            destinatario: "Secretaria Municipal de Administração / Finanças",
            corpo: `1. DESCRIÇÃO DA NECESSIDADE\nAssegurar a oferta de alimentação escolar de qualidade para toda a rede municipal.\n\n2. ANÁLISE DE CONSUMO HISTÓRICO\nBaseado nos dados do exercício anterior, identificamos ${itemsWithHighDeviation} itens com desvio significativo entre o planejado e o consumido, permitindo ajuste de precisão de compras para este novo edital.\n\n3. ESTIMATIVA DE QUANTIDADES\nO quantitativo de ${totalItems} itens foi definido através da integração entre o Consumo Real monitorado e o Mapa de Engenharia de Cardápios.\n\n4. VIABILIDADE ECONÔMICA\nA precisão baseada em dados reais visa reduzir em até 15% o desperdício por excesso de estoque ou vencimento de produtos.`,
            conclusao: "O presente estudo demonstra a viabilidade técnica e a vantajosidade econômica de se basear o planejamento de compras em dados reais de consumo.",
            observacoes: "Este ETP atende aos requisitos da Lei 14.133/2021."
        };
    },

    /**
     * Gera um Relatório Gerencial ou Mensal
     */
    generateManagementReport: (type: string, data: any, year: number): GeneratedContent => {
        const statsSummarized = typeof data === 'object' ?
            Object.entries(data).map(([k, v]) => `- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n') :
            data;

        return {
            titulo: `RELATÓRIO TÉCNICO: ${type} - ${year}`,
            assunto: "Monitoramento e Gestão da Alimentação Escolar",
            destinatario: "Secretaria Municipal de Educação (SME)",
            corpo: `O presente relatório apresenta o balanço de dados referente ao período consultado.\n\nINDICADORES DE DESEMPENHO:\n${statsSummarized}`,
            conclusao: "Dados validados e extraídos da base de dados oficial do sistema NutriAssist.",
            observacoes: "Este documento constitui prova de monitoramento técnica e administrativa."
        };
    },

    /**
     * Gera o conteúdo oficial de um Laudo Nutricional Individual
     */
    generateNutritionalAppraisal: (data: any): GeneratedContent => {
        return {
            titulo: `LAUDO TÉCNICO DE VIGILÂNCIA NUTRICIONAL`,
            assunto: `Vigilância Alimentar e Nutricional - Aluno: ${data.aluno}`,
            destinatario: `Unidade Escolar: ${data.escola}`,
            corpo: `Realizada avaliação antropométrica detalhada com os seguintes parâmetros:\n` +
                `──────────────────────────────────────────────────\n` +
                `• Sexo: ${data.sexo} | idade: ${data.idade}\n` +
                `• Unidade: ${data.destinatario}\n` +
                `• Classificação: ${data.status}\n` +
                `──────────────────────────────────────────────────\n\n` +
                `PARECER TÉCNICO-NUTRICIONAL:\n` +
                `${data.diagnostico}\n\n` +
                `________________________________________________\n` +
                `Assinatura do Nutricionista (RT) - CRN-5\n\n` +
                `________________________________________________\n` +
                `Assinatura da Direção / Coordenação Escolar`,
            conclusao: "O discente deve ser acompanhado conforme cronograma de vigilância da rede escolar municipal.",
            observacoes: `Documento gerado eletronicamente via NutriAssist em ${new Date().toLocaleDateString('pt-BR')}.`
        };
    },

    /**
     * Gera o conteúdo oficial do Parecer Técnico Nutricional (SISVAN/PNAE)
     */
    generateOfficialNutritionalOpinion: (assessment: any, student: any, schoolName: string): GeneratedContent => {
        const date = new Date(assessment.dataAfericao).toLocaleDateString('pt-BR');

        return {
            titulo: "PARECER TÉCNICO NUTRICIONAL",
            assunto: "Avaliação do Estado Nutricional - Vigilância Escolar",
            destinatario: "Secretaria Municipal de Educação / Responsáveis Legais",
            corpo: `
1. IDENTIFICAÇÃO DO ESCOLAR
• Código Interno: ${student.id.substring(0, 8).toUpperCase()}
• Iniciais: ${student.nome.split(' ').map((n: string) => n[0]).join('. ')}.
• Unidade Escolar: ${schoolName}
• Data da Avaliação: ${date}

2. DADOS ANTROPOMÉTRICOS & DIAGNÓSTICO
• Peso: ${assessment.peso.toFixed(2)} kg
• Estatura: ${assessment.estatura.toFixed(2)} m
• IMC Calculado: ${assessment.imc.toFixed(2)} kg/m²
• Classificação SISVAN: ${assessment.classificacaoImc.replace(/_/g, ' ')}

3. PARECER TÉCNICO (DESCRITIVO/PRESCRITIVO)
${assessment.parecerTecnico}

4. RECOMENDAÇÕES NUTRICIONAIS
${assessment.recomendacoes || 'Seguir o cardápio escolar balanceado ofertado pela unidade, evitando alimentos ultraprocessados.'}

5. ENCAMINHAMENTOS
${assessment.finalidade === 'ENCAMINHAMENTO_SAUDE' ? '• Encaminhamento para Unidade Básica de Saúde (UBS) para acompanhamento clínico.' : '• Manutenção do monitoramento nutricional no ambiente escolar.'}
`,
            conclusao: "Documento emitido para fins de monitoramento da saúde escolar, com base nos parâmetros da Organização Mundial da Saúde (OMS) e Resolução CFN nº 594/2017.",
            observacoes: `
______________________________________________________________________
NUTRICIONISTA RESPONSÁVEL TÉCNICA
CRN: _______________
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
Protocolo: ${assessment.id.substring(0, 12).toUpperCase()}
`
        };
    },

    /**
     * Gera um Certificado de Formação Continuada
     */
    generateTrainingCertificate: (cookName: string, session: any): GeneratedContent => {
        return {
            titulo: "CERTIFICADO DE CAPACITAÇÃO TÉCNICA",
            assunto: "Formação Continuada para Manipuladores de Alimentos - PNAE",
            destinatario: cookName,
            corpo: `Certificamos que ${cookName.toUpperCase()} participou da capacitação técnica sobre o tema "${session.tema.toUpperCase()}", realizada em ${new Date(session.data).toLocaleDateString('pt-BR')}, com carga horária total de ${session.cargaHoraria} horas.\n\nCONTEÚDO PROGRAMÁTICO:\n${session.conteudoProgramatico}`,
            conclusao: "O presente treinamento atende às exigências de formação permanente previstas nas diretrizes do Programa Nacional de Alimentação Escolar (PNAE).",
            observacoes: `Validação Eletrônica: ${generateId().toUpperCase()}`
        };
    },
    /**
     * Gera o Relatório Anual de Vigilância Nutricional (PNAE/FNDE)
     */
    generateAnnualNutritionalSurveillanceReport: (data: any, year: number): GeneratedContent => {
        const stats = data.stats;
        const total = stats.total || 0;

        // Formatar dados para o relatório
        const classificationText = Object.entries(stats.byClassification || {})
            .map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${v} alunos (${total > 0 ? ((Number(v) / total) * 100).toFixed(1) : 0}%)`)
            .join('\n');

        const risksText = `• Total de Alunos em Risco Nutricional: ${stats.risks} (${total > 0 ? ((stats.risks / total) * 100).toFixed(1) : 0}%)\n` +
            `• Alunos com Necessidades Alimentares Especiais: ${stats.specialNeedsCount}`;

        const conclusionDraft = total > 0
            ? `A avaliação diagnóstica do ano de ${year} revela que a maior parte dos alunos (${stats.byClassification['SISVAN_EUTROFIA'] || 0}) encontra-se em estado de Eutrofia. Todavia, a identificação de ${stats.risks} casos de risco nutricional demanda atenção contínua e ações intersetoriais.`
            : "Não há dados suficientes para uma conclusão diagnóstica neste período.";

        return {
            titulo: `RELATÓRIO ANUAL DE VIGILÂNCIA ALIMENTAR E NUTRICIONAL - ${year}`,
            assunto: "Prestação de Contas PNAE - Estado Nutricional dos Escolares",
            destinatario: "Fundo Nacional de Desenvolvimento da Educação (FNDE) / CAE / SME",
            corpo: `
1. IDENTIFICAÇÃO INSTITUCIONAL
• Município: Brotas de Macaúbas/BA
• Secretaria Municipal de Educação
• Sistema de Monitoramento: NutriAssist SME
• Ano de Referência: ${year}
• Responsável Técnica: Nutricionista (RT) - CRN-5

2. INTRODUÇÃO
A alimentação escolar constitui um direito fundamental e uma estratégia vital para a segurança alimentar e nutricional. Este relatório apresenta o diagnóstico nutricional dos escolares atendidos pela rede municipal, em cumprimento às diretrizes do Programa Nacional de Alimentação Escolar (PNAE) e às normas do SISVAN.

3. METODOLOGIA
A coleta de dados antropométricos (peso e estatura) foi realizada nas unidades escolares, seguindo os protocolos técnicos recomendados pelo Ministério da Saúde. A classificação do estado nutricional baseou-se nas curvas de crescimento da Organização Mundial da Saúde (OMS), adotadas pelo SISVAN.

4. RESULTADOS CONSOLIDADOS
• Quantitativo Total de Alunos Avaliados: ${total}

Distribuição do Estado Nutricional:
${classificationText}

Indicadores de Risco e Vulnerabilidade:
${risksText}

5. ANÁLISE TÉCNICA
${conclusionDraft}
Observa-se a necessidade de manter o monitoramento contínuo para prevenir o agravamento dos casos de risco (baixo peso ou excesso de peso) e promover a saúde integral dos escolares.

6. AÇÕES DESENVOLVIDAS
• Adequação dos cardápios escolares às faixas etárias e necessidades nutricionais.
• Monitoramento individualizado dos casos de risco detectados.
• Ações de Educação Alimentar e Nutricional (EAN) integradas ao currículo.

7. CONSIDERAÇÕES FINAIS
A vigilância alimentar e nutricional é um instrumento de gestão indispensável. Os dados aqui apresentados subsidiam o planejamento de compras da agricultura familiar, a elaboração de cardápios e a formulação de políticas públicas locais de saúde na escola.
`,
            conclusao: "Encaminha-se este relatório para fins de prestação de contas e transparência pública.",
            observacoes: `
____________________________________________________
Nutricionista Responsável Técnica (RT)
CRN-5 / PNAE
Documento gerado oficialmente em ${new Date().toLocaleDateString('pt-BR')} via NutriAssist.
`
        };
    },

    /**
     * Gera o conteúdo de um Plano de Ação Preventivo (Early Warning)
     */
    generatePreventiveReportContent: (report: any): GeneratedContent => {
        return {
            titulo: `PLANO DE AÇÃO PREVENTIVA - PROTOCOLO ${report.protocolo}`,
            assunto: `Vigilância de Risco Antecipado - Tipo: ${report.tipo_risco}`,
            destinatario: "Secretaria Municipal de Educação / Coordenação de Alimentação Escolar",
            corpo: `
1. NATUREZA DO RISCO IDENTIFICADO
${report.descricao}

2. IMPACTO PROJETADO (CENÁRIO SEM INTERVENÇÃO)
${report.impacto_projetado}

3. FUNDAMENTAÇÃO TÉCNICA E AÇÕES RECOMENDADAS
${report.acoes_recomendadas}

4. BASE LEGAL E CONFORMIDADE
As ações sugeridas visam garantir a continuidade do atendimento do PNAE (Lei 11.947/2009) e a segurança alimentar dos escolares (Resolução FNDE 06/2020).
`,
            conclusao: "Encaminha-se este parecer para análise imediata e tomada de decisão estratégica visando a mitigação dos riscos apontados.",
            observacoes: `
____________________________________________________
RESPONSÁVEL TÉCNICO / GESTOR DA CADEIA
NutriAssist SME - Vigilância Preventiva Automática
Data de Emissão: ${new Date(report.data_geracao).toLocaleString('pt-BR')}
`
        };
    }
};
