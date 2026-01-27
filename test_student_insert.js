
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

async function testInsert() {
    console.log('Testing direct insert into students table...');

    const dummyStudent = {
        nome: "TESTE DEBUG " + new Date().toISOString(),
        data_nascimento: "2015-01-01",
        dados_complementares: { test: "data" },
        foto_url: "http://example.com/photo.jpg",
        ativo: true
        // Note: Skipping escola_id to see if it allows null or if we need a valid one
    };

    console.log('Payload:', dummyStudent);

    const { data, error } = await supabase
        .from('students')
        .insert(dummyStudent)
        .select();

    if (error) {
        console.error('❌ Insert FAILED:', error);
        console.error('Message:', error.message);
        console.error('Hint:', error.hint);
        console.error('Details:', error.details);
    } else {
        console.log('✅ Insert SUCCESS:', data);
    }
}

testInsert();
