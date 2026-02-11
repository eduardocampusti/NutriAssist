import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function testModel(genAI, modelName) {
    try {
        console.log(`\n--- Testando Modelo: ${modelName} ---`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Diga 'OK'");
        const response = await result.response;
        console.log(`✅ SUCESSO com ${modelName}:`, response.text());
        return true;
    } catch (error) {
        console.error(`❌ FALHA com ${modelName}:`);
        console.error(`   Status: ${error.status || "N/A"}`);
        console.error(`   Mensagem: ${error.message}`);
        return false;
    }
}

async function runTests() {
    if (!GEMINI_API_KEY) {
        console.error("ERRO: API Key não encontrada no .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.0-pro"];

    for (const m of models) {
        await testModel(genAI, m);
    }
}

runTests().catch(console.error);
