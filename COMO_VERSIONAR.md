# Guia de Versionamento - NutriAssist

Este guia explica como atualizar a versão do sistema NutriAssist a cada nova entrega. Siga estes passos para garantir que o sistema, a inteligência artificial e a documentação estejam sempre em sincronia.

## 1. Entendendo os Números (vX.Y.Z)

O NutriAssist usa o padrão **Versionamento Semântico**:
- **X (MAJOR)**: Mudanças grandes que alteram como o sistema funciona (ex: 1.0.0 para 2.0.0).
- **Y (MINOR)**: Novas funcionalidades (ex: uma nova tela ou relatório) sem quebrar o que já existe (ex: 1.0.0 para 1.1.0).
- **Z (PATCH)**: Correções de erros pequenos ou ajustes visuais (ex: 1.0.0 para 1.0.1).

---

## 2. Passo a Passo para Atualização

Sempre que terminar uma nova tarefa e for entregar para o usuário, siga esta ordem:

### Passo A: Atualizar as Constantes (`constants.ts`)
Este é o arquivo mais importante, pois ele controla o que a IA e a interface exibem.

1.  Abra o arquivo `constants.ts`.
2.  Altere a linha `export const APP_VERSION = '1.0.0';` para a nova versão.
3.  Altere a linha `export const RELEASE_DATE = 'YYYY-MM-DD';` para a data de hoje.
4.  No campo `RELEASE_NOTES`, adicione um novo bloco no topo da lista com o que foi feito. Exemplo:
    ```typescript
    {
      version: '1.1.0',
      date: '2026-06-15',
      description: 'Adição de novos relatórios nutricionais.',
      changes: [
        'Novo relatório de Vitaminas.',
        'Correção no cálculo de Zinco.'
      ]
    }
    ```

### Passo B: Atualizar o arquivo do Projeto (`package.json`)
Isso é importante para as ferramentas de desenvolvimento.

1.  Abra o arquivo `package.json`.
2.  Mude a linha `"version": "1.0.0"` para a nova versão.

### Passo C: Registrar no Diário de Mudanças (`CHANGELOG.md`)
Este arquivo é o histórico oficial legível por humanos.

1.  Abra o `CHANGELOG.md`.
2.  Adicione a nova versão no topo, seguindo o modelo que já está lá:
    - `### Added` (Para o que foi adicionado)
    - `### Changed` (Para o que foi alterado)
    - `### Fixed` (Para o que foi corrigido)

---

## 3. Resumo dos Arquivos

| Arquivo | O que faz? |
| :--- | :--- |
| `constants.ts` | **Cérebro da Versão**. Atualiza a IA e a tela "Sobre o Sistema". |
| `package.json` | **Identidade Técnica**. Identifica o sistema para a internet/servidor. |
| `CHANGELOG.md` | **Histórico de Lançamentos**. Lista detalhada para auditoria. |

---

## Dicas Importantes
- **Nunca pule uma versão**: Se está na 1.0.0, a próxima correção é 1.0.1.
- **Data no padrão Ano-Mês-Dia**: Use sempre `2026-05-09` para evitar confusão.
- **Seja direto**: Nas notas de lançamento, use frases curtas como "Corrigido erro no login" ou "Adicionado botão de exportar PDF".
