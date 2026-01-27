
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && (key.trim() === 'VITE_GEMINI_API_KEY' || key.trim() === 'GEMINI_API_KEY')) {
            apiKey = value.trim();
        }
    });
} catch (e) {
    console.error('Error reading .env.local', e);
}

if (!apiKey) {
    console.error('MISSING API KEY');
    process.exit(1);
}

console.log('Testing with API Key ending in:', apiKey.slice(-4));
const ai = new GoogleGenAI({ apiKey });

async function testModels() {
    const models = [
        'gemini-2.0-flash-exp', // Try the newest
        'gemini-1.5-flash-001',
        'gemini-pro'
    ];

    console.log('--- STARTING MODEL CONNECTIVITY TEST ---');

    for (const model of models) {
        process.stdout.write(`Testing ${model}... `);
        try {
            // Try explicit v1beta if the SDK allows configuration, 
            // but standard usage is just model name.
            // Maybe the user's project only has access to specific models.
            const response = await ai.models.generateContent({
                model: model,
                contents: "Say OK.",
            });
            console.log(`✅ SUCCESS! (Response: ${response.text?.trim()})`);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message.split('\n')[0]}`);
        }
    }
}

testModels();
