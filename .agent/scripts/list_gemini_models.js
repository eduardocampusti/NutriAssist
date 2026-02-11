import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const key = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
    console.log("Listando modelos via REST...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.models) {
            console.log("Modelos encontrados:", data.models.map(m => m.name).join(", "));
        } else {
            console.log("Nenhum modelo listado. Resposta bruta:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Erro ao listar:", e.message);
    }
}

listModels();
