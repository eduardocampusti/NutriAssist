# NutriAssist SME 🍎

**Sistema de Inteligência e Gestão para Nutrição Escolar**

O **NutriAssist SME** é um sistema público desenvolvido para organizar, automatizar e garantir a conformidade legal da gestão da nutrição escolar nos municípios brasileiros.

Ele transforma as normas do **PNAE (Programa Nacional de Alimentação Escolar)** em regras automáticas, reduzindo falhas humanas, fortalecendo a atuação da Nutricionista Responsável Técnica e protegendo a gestão municipal em auditorias do CAE, TCE e CGU.

---

## 🎯 Objetivo Central
Centralizar e padronizar toda a operação técnica da alimentação escolar, desde o planejamento dos cardápios até a prestação de contas, assegurando que cada refeição servida esteja em conformidade com a legislação federal (Resolução FNDE nº 06/2020).

## 🚀 Funcionalidades Principais

### ✅ Gestão de Cardápios & PNAE
- Elaboração, validação e aprovação de cardápios por modalidade e faixa etária.
- **Workflow Guiado**: Passos obrigatórios de Identificação, Composição (com semáforo nutricional) e Revisão Técnica.
- **Bloqueio Automático**: Impede a inserção de alimentos proibidos (ex: açúcar/ultraprocessados para < 3 anos).
- **Justificativa Obrigatória**: Exige razão técnica para alimentos restritos.

### 📋 Controle Normativo
- Base de dados de alimentos classificados pelo **Guia Alimentar (NOVA)**: In Natura, Processados e Ultraprocessados.
- Controle estrito de ingredientes proibidos e restritos.

### 👶 Gestão de Alunos (NAE)
- Cadastro de alunos com **Necessidades Alimentares Especiais** (Diabetes, Celíacos, Alergias).
- Cruzamento automático de restrições alimentares com o cardápio da escola.

### 📦 Controle de Estoque
- Monitoramento de entradas, saídas e saldo atual.
- Prevenção de desperdícios e cálculo de demanda para compras.

### 📄 Documentação & Licitações
- Apoio técnico automático às licitações e chamadas públicas.
- Geração de **Mapas de Consumo Anual**.
- Emissão de Termos de Referência e documentos timbrados prontos para fiscalização.

---

## ⭐ Diferenciais do Sistema

1.  **Segurança Jurídica**: Auditoria automática prévia que antecipa apontamentos de órgãos de controle.
2.  **Rastreabilidade**: Histórico completo de quem criou, quem aprovou e quando o cardápio foi publicado.
3.  **Tecnologia Proativa**: O sistema "avisa" sobre erros antes que eles aconteçam (ex: Semáforo Nutricional).
4.  **Interface Acessível**: Design limpo e intuitivo para equipes técnicas e gestores públicos.

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v18+)
- Conta no Supabase (Banco de Dados e Auth)

### Passo a Passo

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configuração de Ambiente:**
   Renomeie o arquivo `.env.example` para `.env` e configure suas credenciais:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

---

> *"O NutriAssist SME fortalece a política pública de alimentação escolar, promove alimentação saudável e assegura o cumprimento integral do PNAE."*
