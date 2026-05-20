# REGRAS DO AGENTE - NUTRIASSIST SME
# Este arquivo e lido automaticamente pelo AntiGravity e agentes IA

## IDENTIDADE DO PROJETO
- Nome: NutriAssist SME
- Cliente: Secretaria Municipal de Educacao de Brotas de Macaubas - BA
- Versao atual: ver constants.ts (APP_VERSION)
- Stack: React + TypeScript + Vite + Supabase + Tailwind

---

## PROTECAO DO BANCO DE DADOS (CRITICO)

BANCO AUTORIZADO: Apenas o Supabase configurado em .env.local
- Nunca conecte, teste ou execute queries em outro banco
- Antes de qualquer operacao SQL: verifique services/supabase.ts
- Operacoes destrutivas (DROP, DELETE sem WHERE, TRUNCATE) requerem "CONFIRMO" do usuario

TABELAS PROTEGIDAS (nao altere estrutura sem aprovacao):
- profiles, application_settings, fnde_preparacoes, inventory_batches

---

## VERSIONAMENTO AUTOMATICO (OBRIGATORIO)

Apos TODA alteracao de codigo, voce DEVE:

PASSO 1 - Definir tipo de mudanca:
  - Bug fix / visual: PATCH (1.2.0 -> 1.2.1)
  - Nova feature:     MINOR (1.2.0 -> 1.3.0)
  - Breaking change:  MAJOR (1.2.0 -> 2.0.0)

PASSO 2 - Atualizar constants.ts:
  export const APP_VERSION = 'X.Y.Z';
  export const RELEASE_DATE = 'YYYY-MM-DD';
  // Adicionar novo bloco no TOPO de RELEASE_NOTES

PASSO 3 - Atualizar package.json:
  "version": "X.Y.Z"

PASSO 4 - Atualizar CHANGELOG.md:
  Adicionar entrada no topo com ## [X.Y.Z] - YYYY-MM-DD

PASSO 5 - Commit:
  git commit -m "vX.Y.Z - Descricao curta"

---

## PADRAO DE CODIGO

Estilo visual obrigatorio:
- Sombra: '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)'
- Border-radius cards: 18-20px
- Topos coloridos com gradiente + icone glassmorphism
- Cabecalho tabelas: linear-gradient(135deg,#0f172a,#1e293b)

Nunca use:
- rounded-[40px] ou maiores (use rounded-2xl = 16px)
- shadow-2xl como unica sombra (use a sombra tripla acima)
- bg-white como unico estilo de card sem sombra
