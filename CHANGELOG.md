# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
