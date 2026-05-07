
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('URL:', process.env.VITE_SUPABASE_URL);
console.log('KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'DEFINED' : 'UNDEFINED');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    try {
        const { data, error } = await supabase.from('fnde_preparacoes').select('id, nome').limit(1);
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Data:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
