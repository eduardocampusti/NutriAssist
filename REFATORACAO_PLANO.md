# Plano de Refatoração Arquitetural - NutriAssist

Este plano visa descentralizar o `App.tsx`, implementar roteamento robusto e preparar o sistema para persistência em nuvem (Supabase).

## Fase 1: Modularização do Estado (Context API)
- [ ] **Criar `AppContext`**: Para estados globais simples (Sidebar, Letterhead/Configurações).
- [ ] **Criar `SchoolContext`**: Gerenciar Escolas, Merendeiras e Alunos com Necessidades Especiais.
- [ ] **Criar `InventoryContext`**: Gerenciar Itens, Lotes, Movimentações e Fornecedores.
- [ ] **Criar `DocumentContext`**: Gerenciar Documentos Oficiais, Arquivo e Logs.
- [ ] **Criar `MenuContext`**: Gerenciar Planos de Cardápio e Execuções.

## Fase 2: Implementação de Roteamento Real
- [ ] Configurar rotas dinâmicas no `App.tsx` usando `react-router-dom`.
- [ ] Mapear URLs para cada módulo (ex: `/dashboard`, `/estoque`, `/escolas`).
- [ ] Atualizar o `Sidebar.tsx` para usar `Link` ou `useNavigate` em vez de callbacks de estado.

## Fase 3: Persistência Híbrida (Supabase)
- [ ] Configurar o cliente Supabase.
- [ ] Implementar hooks de sincronização (leitura do Supabase com fallback para LocalStorage).
- [ ] Migrar funções de escrita (`handleAdd...`) para persistir no banco de dados.

## Fase 4: Limpeza do `App.tsx`
- [ ] Remover estados redundantes.
- [ ] Manter apenas o Provider principal e a definição das rotas.
