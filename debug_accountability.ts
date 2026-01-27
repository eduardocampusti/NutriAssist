


import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually without dotenv lib
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const getEnv = (key: string) => {
    const line = envLines.find(l => l.startsWith(key));
    return line ? line.split('=')[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mocking reportingService locally to test logic without importing the file (avoiding import issues)
const reportingService = {
    getPNAEAccountability: async (year: number) => {
        console.log("Mock Service: Querying procurement_processes...");
        // Try 'procurement_processes' first, fallback gracefully
        const { data: processes, error } = await supabase.from('procurement_processes').select('*');

        if (error) {
            console.warn("Procurement table access error:", error);
            return {
                totalResources: 0,
                familyAgricultureTarget: 0,
                familyAgricultureReal: 0,
                isCompliant: false
            };
        }

        console.log(`Found ${processes?.length} processes.`);

        // Calculate (Mock logic since we need strict item sums)
        const total = processes?.reduce((acc: number, p: any) => acc + (p.total_value || 0), 0) || 0;

        // Mock AF percent since we don't have items join here yet
        const totalAF = total * 0.15; // Mock 15%

        return {
            totalResources: total,
            familyAgricultureTarget: total * 0.3, // Fixed: was total * 0.3
            familyAgricultureReal: totalAF,
            isCompliant: totalAF >= (total * 0.3)
        };
    }
};


async function debugAccountability() {
    console.log("Starting debug...");
    try {
        const year = 2026;
        console.log(`Calling getPNAEAccountability for year ${year}...`);
        const data = await reportingService.getPNAEAccountability(year);
        console.log("Result:", JSON.stringify(data, null, 2));

        if (data) {
            console.log("Checking types:");
            console.log("totalResources type:", typeof data.totalResources);
            console.log("familyAgricultureReal type:", typeof data.familyAgricultureReal);

            if (typeof data.totalResources === 'number') {
                console.log("totalResources.toFixed(2):", data.totalResources.toFixed(2));
            } else {
                console.error("totalResources is NOT a number!");
            }
        }

    } catch (err) {
        console.error("CRITICAL ERROR calling service:", err);
    }
}

debugAccountability();
