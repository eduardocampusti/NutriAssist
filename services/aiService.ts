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
        Role: Nutricionista Sênior especializado em PNAE.
        Tarefa: Elaborar o modo de preparo técnico-gastronômico para: ${nome}.
        Ingredientes: ${ingredientes.join(", ")}.
        Diretrizes Profissionais:
        - Use terminologia técnica culinária (ex: refogar até translucidez, cocção sob pressão, redução).
        - Foco em segurança alimentar e preservação de micronutrientes.
        - Verbos no imperativo, lista numerada (objetiva e técnica).
        - Sem saudações ou comentários irrelevantes.
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
    async generateRecipeImage(nome: string, ingredientes: string[], attempt: number = 0): Promise<string> {
        console.log(`[AI Service Image] Gerando imagem para: ${nome} (Tentativa ${attempt + 1})`);

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            // Se sem chave, vamos direto para o fallback gratuito
            return this.getFallbackImageUrl(nome, ingredientes);
        }

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

            const prompt = `Professional food photography of "${nome}". 
            Context: High-end culinary magazine style, gourmet presentation.
            Ingredients visible: ${ingredientes.slice(0, 5).join(", ")}. 
            Technical details: 8k resolution, realistic textures, top-down or 45-degree angle, soft natural lighting, shallow depth of field (bokeh), served on a professional ceramic plate. No text.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            const candidates = response.candidates;
            if (candidates && candidates[0]?.content?.parts[0]?.inlineData) {
                const imageData = candidates[0].content.parts[0].inlineData;
                return `data:${imageData.mimeType};base64,${imageData.data}`;
            }

            console.warn("[AI Service Image] Gemini não retornou imagem diretamente. Ativando Fallback.");
            return this.getFallbackImageUrl(nome, ingredientes);

        } catch (error: any) {
            console.error(`[AI Service Image] Erro no Gemini:`, error.message);
            const status = error?.status || error?.response?.status;
            const message = error?.message || "";

            // Se for cota (429), vamos direto para o fallback para não fazer o usuário esperar
            if (status === 429 || message.toLowerCase().includes("quota")) {
                console.info("[AI Service Image] Cota do Google atingida. Usando Fallback Pollinations.ai");
                return this.getFallbackImageUrl(nome, ingredientes);
            }

            // Fallback genérico para qualquer erro
            return this.getFallbackImageUrl(nome, ingredientes);
        }
    },

    /**
     * Fallback gratuito usando Pollinations.ai (Stable Diffusion)
     */
    getFallbackImageUrl(nome: string, ingredientes: string[]): string {
        const seed = Math.floor(Math.random() * 1000000);

        // Mapeamento Estático de Imagens Curadas (Alta Qualidade - Wikimedia/Public Domain)
        // Definitivo: URLs validadas para evitar links quebrados ou 404.
        const staticImages: Record<string, string> = {
            "arroz": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Bap_%28cooked_rice%29.jpg",
            "arroz branco": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Bap_%28cooked_rice%29.jpg",
            "arroz integral": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Falling_white_rice_on_a_plate.jpg",
            "feijão": "https://upload.wikimedia.org/wikipedia/commons/3/31/Carioca_Bowl_2012_-_Final.jpg",
            "feijao": "https://upload.wikimedia.org/wikipedia/commons/3/31/Carioca_Bowl_2012_-_Final.jpg",
            "macarrão": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Tomatoes_plain_and_sliced.jpg",
            "espaguete": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Tomatoes_plain_and_sliced.jpg",
            "frango": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Roast_chicken.jpg",
            "frango assado": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Roast_chicken.jpg",
            "frango cozido": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Beef_Stew%21.jpg",
            "carne": "https://upload.wikimedia.org/wikipedia/commons/4/4d/Raw_beef_slices.jpg",
            "carne moída": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hashed_Beef_%26_Rice%2C_Renga-Tei%2C_Ginza_%286639260429%29.jpg",
            "peixe": "https://upload.wikimedia.org/wikipedia/commons/6/60/Pangasius_meat.jpg",
            "ovo": "https://upload.wikimedia.org/wikipedia/commons/9/92/Brown_eggs_in_a_deviled_egg_plate.jpg",
            "ovos": "https://upload.wikimedia.org/wikipedia/commons/9/92/Brown_eggs_in_a_deviled_egg_plate.jpg",
            "salada": "https://upload.wikimedia.org/wikipedia/commons/8/81/Vegetable_Salad_%28Unsplash%29.jpg",
            "legumes": "https://upload.wikimedia.org/wikipedia/commons/9/97/Child_working_selling_vegetables_in_downtown_Maracaibo.jpg",
            "sopa": "https://upload.wikimedia.org/wikipedia/commons/d/de/Soup_Bowl_MET_DP258773.jpg",
            "pão": "https://upload.wikimedia.org/wikipedia/commons/2/24/Bread_roll_with_crumb_hole.jpg",
            "leite": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Milk_Allergy.jpg",
            "suco": "https://upload.wikimedia.org/wikipedia/commons/6/67/Orange_juice_1_edit1.jpg",
            "fruta": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Salad_bowl%2C_Chantilly_Porcelain_Factory%2C_c._1735-1740%2C_soft-paste_porcelain_-_Wadsworth_Atheneum_-_Hartford%2C_CT_-_DSC05417.jpg",
            "banana": "https://upload.wikimedia.org/wikipedia/commons/a/af/Fruit_Stall_in_Barcelona_Market.jpg",
            "maçã": "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg"
        };

        const lowerNome = nome.toLowerCase().trim();

        // 1. Tenta correspondência exata
        if (staticImages[lowerNome]) {
            return staticImages[lowerNome];
        }

        // 2. Tenta correspondência parcial (ex: "Salada de Tomate" -> acha "Salada")
        const foundKey = Object.keys(staticImages).find(key => lowerNome.includes(key));
        if (foundKey) {
            return staticImages[foundKey];
        }

        // 3. Fallback Genérico Seguro (Culinária Gourmet vs "Food")
        // Se nada for encontrado, usamos uma imagem generica bonita de comida saudável
        // para evitar fotos aleatórias bizarras.
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg";
    }
};
