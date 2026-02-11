import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || (import.meta.env.VITE_GEMINI_API_KEY) || "";

// Helper para retentativas internas com delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
    /**
     * Sugere um passo a passo para a receita baseado nos ingredientes
     * @param attempt Contador interno para retentativas silenciosas
     */
    async generateRecipeSteps(nome: string, ingredientes: string[], attempt: number = 0): Promise<string> {
        console.log(`[AI Service v3] Início: ${nome} (Tentativa ${attempt + 1})`);

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            throw new Error("Chave de API do Gemini não configurada corretamente.");
        }

        // Multiplexação de modelos de NOVA GERAÇÃO (Astra/2.5/3) detectados na chave do usuário
        const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro-latest", "gemini-2.0-flash-lite"];
        const currentModelName = attempt > 0 ? models[attempt % models.length] : "gemini-2.0-flash";

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            console.log(`[AI Service] Enviando para modelo moderno: ${currentModelName}`);
            const model = genAI.getGenerativeModel({ model: currentModelName });

            const prompt = `
        Role: Nutricionista PNAE.
        Tarefa: Modo de preparo técnico para: ${nome}.
        Ingredientes: ${ingredientes.join(", ")}.
        Regras: Verbos no imperativo, lista numerada (até 8 passos), sem comentários.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("Resposta vazia da IA.");

            console.log("[AI Service] Sucesso!");
            return text;
        } catch (error: any) {
            console.error(`[AI Service] Falha na tentativa ${attempt + 1}:`, error);

            const status = error?.status || error?.response?.status;
            const detail = error?.message || "";

            // ESTRATÉGIA DE RESILIÊNCIA 1: Erro de Cota (429) ou Demand High
            if ((status === 429 || detail.toLowerCase().includes("quota") || detail.toLowerCase().includes("overloaded")) && attempt < 2) {
                console.warn(`[AI Service] Limite atingido. Aguardando 5s para retentar com modelo alternativo...`);
                await sleep(5000); // Espera 5 segundos para a cota "respirar"
                return this.generateRecipeSteps(nome, ingredientes, attempt + 1);
            }

            // ESTRATÉGIA DE RESILIÊNCIA 2: Erro 404 (Modelo não existe/não habilitado)
            if (status === 404 && attempt < 2) {
                console.warn(`[AI Service] Modelo ${currentModelName} indisponível. Tentando próximo...`);
                return this.generateRecipeSteps(nome, ingredientes, attempt + 1);
            }

            // Se todas as tentativas falharem, mostramos mensagem profissional
            if (status === 429 || detail.toLowerCase().includes("quota")) {
                throw new Error("IA indisponível temporariamente (Limite do Google). Por favor, aguarde 1 minuto para que os recursos gratuitos sejam liberados.");
            }

            if (status === 403) {
                throw new Error("Sua chave de API não tem permissão para este recurso ou está restrita regionalmente.");
            }

            throw new Error(`Não foi possível gerar a sugestão agora: ${detail || 'Erro na conexão com Google AI'}`);
        }
    },

    /**
     * Gera uma imagem ilustrativa para a receita
     */
    async generateRecipeImage(nome: string, ingredientes: string[]): Promise<string> {
        console.log(`[AI Service Image] Gerando imagem para: ${nome}`);

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            throw new Error("Chave de API do Gemini não configurada.");
        }

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            // Modelo específico para geração de imagem detectado no diagnóstico
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

            const prompt = `A hyper-realistic, top-down professional food photography of a dish called "${nome}". 
            Main ingredients: ${ingredientes.slice(0, 5).join(", ")}. 
            Setting: Served in a clean school cafeteria tray or a simple rustic bowl. 
            Style: Bright, natural lighting, appetizing, high-quality culinary magazine style.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            // O modelo de imagem retorna os dados da imagem no formato inlineData
            const candidates = response.candidates;
            if (candidates && candidates[0]?.content?.parts[0]?.inlineData) {
                const imageData = candidates[0].content.parts[0].inlineData;
                return `data:${imageData.mimeType};base64,${imageData.data}`;
            }

            // Fallback se não vier imagem (às vezes o modelo retorna texto se falhar o filtro de segurança)
            const text = response.text();
            console.warn("[AI Service Image] O modelo retornou texto em vez de imagem:", text);
            throw new Error("Não foi possível gerar a imagem (Filtro de segurança ou Limite de cota).");

        } catch (error: any) {
            console.error("[AI Service Image] Falha na geração de imagem:", error);
            const status = error?.status || error?.response?.status;
            if (status === 429) {
                throw new Error("Limite de cota de imagens atingido. Tente novamente em alguns minutos.");
            }
            throw new Error(`Falha ao gerar imagem: ${error.message || 'Erro desconhecido'}`);
        }
    }
};
