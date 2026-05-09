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

async function test() {
    console.log('Testing pqtovsgneehpdxewaeal...');
    const { data, error } = await supabase.from('fnde_alimentos').select('count', { count: 'exact', head: true });
    if (error) console.error('Error:', error.message);
    else console.log('Count:', data);
}
test();
