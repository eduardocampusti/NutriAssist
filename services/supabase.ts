import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidos.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
