import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const key = process.env.VITE_GEMINI_API_KEY;

async function testFetch() {
    console.log("Testando com Fetch...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Diga OK" }] }]
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Resposta Completa:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Erro no Fetch:", e.message);
    }
}

testFetch();
