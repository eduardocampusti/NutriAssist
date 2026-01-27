import { alertService } from './services/alertService';
import { supabase } from './services/supabase';

async function simulate() {
    console.log('--- Iniciando Simulação de Alertas Inteligentes ---');

    // 1. Pegar uma escola para teste
    const { data: schools } = await supabase.from('schools').select('id, nome').limit(1);
    if (!schools || schools.length === 0) {
        console.error('Nenhuma escola encontrada para simulação.');
        return;
    }

    const schoolId = schools[0].id;
    const schoolName = schools[0].nome;
    console.log(`Simulando para: ${schoolName} (${schoolId})`);

    // 2. Gerar alertas
    console.log('Processando lógica de inteligência...');
    await alertService.generateSchoolAlerts(schoolId);

    // 3. Verificar se foram criados
    const alerts = await alertService.getAlerts(schoolId);
    console.log(`Alertas Ativos Encontrados: ${alerts.length}`);

    alerts.forEach(a => {
        console.log(`[${a.tipo_alerta}] ${a.categoria}: ${a.titulo}`);
    });

    console.log('--- Simulação Concluída ---');
}

simulate().catch(console.error);
