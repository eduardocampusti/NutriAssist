# Migrações Desativadas (NÃO APLICAR)

Este diretório contém migrações que foram isoladas para evitar aplicação acidental via Supabase CLI.

### Motivo do Isolamento:
- **20260211_complete_fnde_fix.sql**: Esta é uma migração antiga e volumosa que contém alterações estruturais que poderiam causar inconsistências se aplicadas sem revisão completa no estado atual do banco.

### Correção Aplicada:
A correção necessária para restaurar os cálculos nutricionais foi realizada através da migração mínima:
- **20260508_fix_fnde_total_rpc_only.sql** (Contendo apenas as funções RPC essenciais).

### Avisos:
- **NÃO MOVA** estes arquivos de volta para a pasta `supabase/migrations` sem uma revisão técnica profunda.
- O isolamento garante que o comando `npx supabase db push` ignore estes arquivos, mantendo apenas as correções validadas.
