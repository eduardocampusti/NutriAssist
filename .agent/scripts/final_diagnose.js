import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function diagnose() {
    const results = { models: [], error: null, test: null };
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            results.error = data.error;
        } else {
            results.models = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));
        }
    } catch (e) {
        results.error = e.message;
    }

    fs.writeFileSync(path.resolve(__dirname, "diag_results.json"), JSON.stringify(results, null, 2));
    console.log("Diagnóstico concluído e salvo em diag_results.json");
}

diagnose();
