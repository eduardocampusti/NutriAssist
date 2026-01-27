# Guia de Configuração: Acesso à API do Google Gemini

Este erro (404 Not Found) geralmente significa que a **Chave de API** que você está usando foi criada em um projeto que não tem a API Generativa habilitada ou está restrito por região (ex: Europa).

Siga estes passos para gerar uma chave universal que funciona com `gemini-1.5-flash` e outros modelos:

## Opção 1: Google AI Studio (Mais Rápido e Gratuito)

1. Aceda a [Google AI Studio](https://aistudio.google.com/).
2. Faça login com sua conta Google.
3. No canto superior esquerdo, clique em **Get API key**.
4. Clique em **Create API key**.
5. Se solicitado, selecione um projeto existente ou clique em "Create API key in new project".
6. Copie a chave gerada (começa com `AIza...`).
7. Cole essa chave no seu arquivo `.env.local` na variável `VITE_GEMINI_API_KEY`.

## Opção 2: Google Cloud Console (Para Projetos Corporativos)

Se você precisa usar um projeto específico do Google Cloud:

1. Aceda ao [Google Cloud Console](https://console.cloud.google.com/).
2. Selecione o seu projeto.
3. No menu, vá em **APIs & Services** > **Library**.
4. Pesquise por "Google Generative AI API" (ou "Vertex AI API") e clique em **Enable**.
5. Vá em **Credentials** > **Create Credentials** > **API Key**.
6. **Importante**: Verifique se a chave tem restrições de API. Se tiver, certifique-se de adicionar a "Generative Language API" às permissões.

## Dicas Importantes

*   **Região**: Se você estiver na Europa, o acesso à API gratuita pode ser bloqueado.
*   **Billing**: Para alguns modelos avançados, é necessário vincular uma conta de faturamento (Billing Account), mesmo que haja uma cota gratuita.
*   **Modelos**: O modelo `gemini-1.5-flash` é o padrão atual mais estável. O `gemini-pro` antigo foi desativado em muitas contas.

Após atualizar a chave no `.env.local`, lembre-se de **reiniciar o terminal** (`npm run dev`) para que a nova chave seja carregada.
