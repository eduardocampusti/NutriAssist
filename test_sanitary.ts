import { sanitaryService } from './services/sanitaryService';
import { supabase } from './services/supabase';
import { SanitaryAnswer } from './types';

async function testSanitary() {
    console.log('--- Iniciando Teste de Controle Sanitário ---');

    // 1. Buscar uma escola e um responsável
    const { data: schools } = await supabase.from('schools').select('id, nome').limit(1);
    const { data: profiles } = await supabase.from('profiles').select('id, nome').limit(1);

    if (!schools?.[0] || !profiles?.[0]) {
        console.error('Dados insuficientes para o teste.');
        return;
    }

    const school = schools[0];
    const profile = profiles[0];

    console.log(`Testando para: ${school.nome} por ${profile.nome}`);

    // 2. Criar um checklist
    try {
        const now = new Date();
        const checklist = await sanitaryService.saveChecklist({
            escola_id: school.id,
            responsavel_id: profile.id,
            mes_referencia: now.getMonth() + 1,
            ano_referencia: now.getFullYear(),
            data_realizacao: now.toISOString(),
            respostas: [
                { pergunta: 'Limpeza do local', resposta: SanitaryAnswer.SIM },
                { pergunta: 'Validade de produtos', resposta: SanitaryAnswer.SIM },
                { pergunta: 'Organização', resposta: SanitaryAnswer.NAO, observacao: 'Prateleira superior desorganizada.' }
            ],
            observacoes_gerais: 'Teste de sistema automatizado.'
        });

        console.log('Checklist salvo com sucesso! ID:', checklist.id);
        console.log('Taxa de Conformidade:', sanitaryService.calculateCompliance(checklist).toFixed(1) + '%');

        // 3. Buscar histórico
        const history = await sanitaryService.getHistory(school.id);
        console.log(`Registros no histórico para esta escola: ${history.length}`);

    } catch (err) {
        console.error('Erro no teste:', err);
    }

    console.log('--- Teste Concluído ---');
}

testSanitary().catch(console.error);
