import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const key = process.env.VITE_GEMINI_API_KEY;

async function diagnose() {
    console.log("Iniciando diagn贸stico profundo...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.models) {
            console.error("Erro na API:", JSON.stringify(data, null, 2));
            return;
        }

        const vivos = data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.split('/').pop());

        console.log("Modelos vivos encontrados:", vivos.join(", "));
        fs.writeFileSync("vivos_final.txt", vivos.join("\n"));

        // Testa o primeiro da lista
        if (vivos.length > 0) {
            const target = vivos[0];
            console.log(`Testando o primeiro modelo: ${target}`);
            const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${target}:generateContent?key=${key}`;
            const testRes = await fetch(testUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Diga OK" }] }] })
            });
            const testData = await testRes.json();
            console.log(`Resultado do teste (${target}):`, JSON.stringify(testData, null, 2));
        }

    } catch (e) {
        console.error("Erro fatal:", e.message);
    }
}

diagnose();
