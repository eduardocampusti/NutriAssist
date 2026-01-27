
import path from 'path';
import fs from 'fs';

// Load env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            if (!line || line.startsWith('#')) return;
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim();
                process.env[key.trim()] = val;
            }
        });
    }
} catch (e) {
    console.error(e);
}

async function verify() {
    const { supabase } = await import('./services/supabase');
    console.log("Checking 'relatorios_preventivos'...");
    const { data, error, count } = await supabase
        .from('relatorios_preventivos')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${count} records.`);
        if (data && data.length > 0) {
            console.log("First record:", data[0]);
        }
    }
}

verify();
