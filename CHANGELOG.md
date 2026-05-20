# Changelog

## [1.2.0] - 2026-05-20

### Redesign Visual Premium — Identidade Unificada do Sistema

#### Interface
- Sidebar redesenhada com gradiente institucional escuro e navegação premium
- Topbar com bloco de boas-vindas dinâmico e saudação por horário do dia
- Cards com sombra tripla, topos coloridos e hover com elevação em todos os módulos
- Tela de Login com header institucional, saudação dinâmica e selo LGPD/FNDE

#### Módulos Redesenhados
- Fichas Técnicas: cards com gradiente e sombras profundas
- Escolas: KPI cards + tabela com cabeçalho escuro premium
- Alunos NE: header rosa, cards de escola com topo colorido
- Simulador: painel verde com KPIs dinâmicos pós-simulação
- Compras (PNAE): layout roxo institucional com tabela de mapa de consumo
- Estoque: sidebar branca com identidade azul própria; dashboard com cards coloridos
- Governança: Compliance, Transparência, Cockpit FNDE, Logs e Manual reformulados
- Configurações: atalhos compactos em grid, tabs pill switcher, cards com topos coloridos
- Usuários: header verde gradiente, formulário lateral com topo colorido
- Sobre o Sistema: cards compactos, timeline de releases, seção de módulos

#### Correções
- Restauração do menuEngine.ts com calculateNutritionalTargets (FNDE nº 06/2020)
- Correção de encoding UTF-8 no ProcurementManager.tsx
- Correção de imports quebrados em múltiplos componentes
- Variável S como string literal em vez de referência JS nos style props

---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-05-11

### Added
- **UI/UX Pro Max**: Refatoração de múltiplos dashboards (`Compliance`, `Inventory`, `Procurement`, etc) com foco em estética premium e responsividade mobile-first.
- **Micro-interações**: Adicionados estados de hover e transições suaves em botões e cards informativos.

### Changed
- **Padronização Visual**: Unificação de paleta de cores e tipografia em componentes órfãos.
- **Estrutura de Arquivos**: Normalização de caminhos de importação para garantir compatibilidade com sistemas de arquivos case-sensitive.

### Fixed
- **Vercel Build Error**: Corrigido erro de deploy causado por referências inconsistentes ao diretório `UI/`.

## [1.1.0] - 2026-05-10

### Added
- **Redesign Premium**: Nova interface visual com gradientes vibrantes, glassmorphism e micro-animações.
- **Campos FNDE Adicionais**: Suporte para Peso Bruto, Peso Líquido e Fator de Correção em todos os ingredientes de preparações.
- **Cálculo Nutricional Dinâmico**: Refatoração do `menuEngine` para cálculos em tempo real com maior precisão.

### Changed
- **Integração TACO**: Mudança da estratégia de join SQL para enriquecimento via JavaScript (JS-side enrichment), eliminando erros de relacionamento de banco.
- **Sidebar & Navegação**: Novo layout lateral mais limpo e responsivo.

### Fixed
- **Erro de FK Crítico**: Corrigida falha que impedia o carregamento de fichas técnicas devido a join inválido em `fnde_alimentos`.
- **Sincronização de Dados**: Resolvido problema de persistência onde novos campos nutricionais não eram salvos corretamente.

## [1.0.0] - 2026-05-09

### Added
- **Centralização de Versionamento**: Introdução de constantes globais em `constants.ts` para controle de versão.
- **Módulo de Ficha Técnica**: Novo sistema de gerenciamento de preparações com cálculos nutricionais automáticos baseados nos padrões FNDE/PNAE.
- **Gestão de Inventário**: Controle completo de estoque para almoxarifados escolares, incluindo balanço de entradas e saídas.
- **Painel de Conformidade**: Dashboard para monitoramento de indicadores nutricionais e alertas de irregularidades.
- **Automação com IA**: Geração automática de relatórios mensais, pareceres técnicos e planos de compras utilizando modelos generativos.
- **Segurança RLS**: Implementação de políticas de Row Level Security no Supabase para proteção de dados sensíveis.

### Changed
- Refatoração do componente `AboutSystem` para consumir dados centralizados de versão.
- Atualização das instruções de sistema da IA para refletir a maturidade da versão 1.0.0.

### Fixed
- Correção de inconsistências na exibição da versão entre o banco de dados e a interface.
