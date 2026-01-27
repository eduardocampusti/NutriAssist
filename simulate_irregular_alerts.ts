
import fs from 'fs';
import path from 'path';
import { alertService } from './services/alertService';
import { supabase } from './services/supabase';
import { AlertType, AlertCategory } from './types';

// Manual env loader
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log('Carregando .env.local manualmente...');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim();
                process.env[key.trim()] = val;
            }
        });
    } else {
        console.warn('.env.local não encontrado em:', envPath);
    }
} catch (e) {
    console.error('Erro ao ler .env.local', e);
}

async function simulateIrregularities() {
    console.log('--- Simulação de Alertas de Irregularidade ---');

    // 1. Obter uma escola
    const { data: schools } = await supabase.from('escolas').select('id, nome').limit(1);
    if (!schools || schools.length === 0) {
        console.error('Nenhuma escola encontrada.');
        return;
    }
    const schoolId = schools[0].id;
    console.log(`Escola alvo: ${schools[0].nome}`);

    // 2. Simular Inserção de Dados Irregulares (Mocking via lógica ou dados falsos)
    // Para este teste, vamos assumir que os dados já existem ou vamos contar com o estado atual.
    // Mas para garantir, vamos criar um alerta manual para testar a persistência
    console.log('Gerando alertas de teste...');

    await alertService.createAlertIfNotExist({
        escola_id: schoolId,
        tipo_alerta: AlertType.CRITICO,
        categoria: AlertCategory.CONSUMO_EXCESSIVO,
        titulo: 'Teste Simulado: Consumo Excessivo',
        descricao: 'Este é um alerta de teste gerado automaticamente para validar o módulo.',
        data_geracao: new Date().toISOString()
    });

    await alertService.createAlertIfNotExist({
        escola_id: schoolId,
        tipo_alerta: AlertType.ATENCAO,
        categoria: AlertCategory.INATIVIDADE_USUARIO,
        titulo: 'Teste Simulado: Inatividade',
        descricao: 'Usuário teste inativo há > 15 dias.',
        data_geracao: new Date().toISOString()
    });

    // 3. Executar Lógica de Detecção Real
    console.log('Executando varredura oficial...');
    await alertService.generateSchoolAlerts(schoolId);

    // 4. Listar
    const alerts = await alertService.getAlerts(schoolId);
    console.log(`\nTotal de Alertas Ativos: ${alerts.length}`);
    alerts.forEach(a => {
        console.log(`- [${a.tipo_alerta}] ${a.categoria}: ${a.titulo} (Auditado: ${a.encaminhado_auditoria ? 'SIM' : 'NÃO'})`);
    });

    console.log('--- Fim da Simulação ---');
}

simulateIrregularities();
