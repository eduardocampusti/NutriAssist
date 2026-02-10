import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyA6L8IdSrc-tyTqD9pciWC1-_zsWnwtBEU";

export const aiService = {
    /**
     * Sugere um passo a passo para a receita baseado nos ingredientes
     */
    async generateRecipeSteps(nome: string, ingredientes: string[]): Promise<string> {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            throw new Error("API Key do Gemini não configurada.");
        }

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
        Você é um Nutricionista especializado em Alimentação Escolar (PNAE).
        Sua tarefa é escrever o "Modo de Preparo" para a seguinte preparação:
        
        NOME DA PREPARAÇÃO: ${nome}
        INGREDIENTES DISPONÍVEIS: ${ingredientes.join(", ")}
        
        REGRAS IMPORTANTES:
        1. O texto deve ser técnico, direto e profissional.
        2. Use verbos no imperativo (Ex: Lave, Corte, Refogue).
        3. Formate como uma lista numerada simples.
        4. Foque em técnicas de preparo que preservem os nutrientes.
        5. Não adicione comentários pessoais ou introduções, apenas os passos.
        6. Use no máximo 6 a 8 passos.
        
        MODO DE PREPARO:
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Erro na geração de IA:", error);
            throw new Error("Falha ao gerar sugestão de preparo. Verifique sua conexão e chave de API.");
        }
    }
};
