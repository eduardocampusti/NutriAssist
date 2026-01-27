import fs from 'fs';
import path from 'path';
import path from 'path';

// Manual env loader
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log('Carregando .env.local manualmente...');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            if (!line || line.startsWith('#')) return; // Skip empty or comments
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim();
                console.log(`Setting env: ${key.trim()}`);
                process.env[key.trim()] = val;
            }
        });
    } else {
        console.warn('.env.local não encontrado em:', envPath);
    }
} catch (e) {
    console.error('Erro ao ler .env.local', e);
}

async function seedEarlyWarning() {
    console.log("--- Iniciando Simulação de Vigilância Preventiva ---");

    // Dynamic import to ensure env vars are loaded first
    const { earlyWarningService } = await import('./services/earlyWarningService');
    const { supabase } = await import('./services/supabase');

    try {
        // 1. Simulação de Risco de Estoque
        console.log("Gerando risco de estoque...");
        await earlyWarningService.generatePreventiveReport({
            type: 'ESTOQUE',
            title: 'Ruptura Iminente: Arroz Parbolizado (Simulação)',
            description: 'O item Arroz Parbolizado atingiu o nível crítico de 50kg (Abaixo da Reserva Técnica).',
            impact: 'Risco de não cumprimento do cardápio da Semana 3.',
            data: { itemId: '123', currentQty: 50, required: 200 }
        });

        // 2. Simulação de Risco de Zona
        console.log("Gerando risco de zona...");
        await earlyWarningService.generatePreventiveReport({
            type: 'ZONA',
            title: 'Criticidade Recorrente: Zona Norte (Simulação)',
            description: 'A Zona Norte apresenta desvios de consumo > 15% por 3 meses consecutivos.',
            impact: 'Indício de falha logística ou desperdício sistêmico.',
            data: { zone: 'Norte', deviation: 15.4 }
        });

        // 3. Simulação de Risco de Consumo
        console.log("Gerando risco de consumo...");
        await earlyWarningService.generatePreventiveReport({
            type: 'CONSUMO',
            title: 'Anomalia de Aceitabilidade: Peixe ao Molho (Simulação)',
            description: 'Índice de rejeição superior a 40% em 5 escolas piloto.',
            impact: 'Desperdício de recursos e baixo impacto nutricional.',
            data: { dish: 'Peixe ao Molho', rejectionRate: 42 }
        });

        console.log("--- Simulação Concluída com Sucesso ---");
    } catch (error) {
        console.error("Erro na simulação:", error);
    }
}

seedEarlyWarning();
