
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value.trim();
        }
    });
} catch (e) { }

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('Checking tables...');

    const { data: alunos, error: errorAlunos } = await supabase.from('alunos').select('*').limit(1);
    const { data: students, error: errorStudents } = await supabase.from('students').select('*').limit(1);

    console.log(`Table 'alunos': ${errorAlunos ? 'Error: ' + errorAlunos.message : 'Exists (Rows: ' + (alunos ? alunos.length : 0) + ')'}`);
    console.log(`Table 'students': ${errorStudents ? 'Error: ' + errorStudents.message : 'Exists (Rows: ' + (students ? students.length : 0) + ')'}`);
}

checkTables();
