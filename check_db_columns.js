import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
    console.log('Checking fnde_preparacoes table...');
    const { data: prepData, error: prepError } = await supabase
        .from('fnde_preparacoes')
        .select('*')
        .limit(1);

    if (prepError) {
        console.error('Error fetching fnde_preparacoes:', prepError);
    } else {
        console.log('fnde_preparacoes columns:', Object.keys(prepData[0] || {}));
    }

    console.log('\nChecking fnde_preparacao_ingredientes table...');
    const { data: ingData, error: ingError } = await supabase
        .from('fnde_preparacao_ingredientes')
        .select('*')
        .limit(1);

    if (ingError) {
        console.error('Error fetching fnde_preparacao_ingredientes:', ingError);
    } else {
        console.log('fnde_preparacao_ingredientes columns:', Object.keys(ingData[0] || {}));
    }
}

checkColumns();
