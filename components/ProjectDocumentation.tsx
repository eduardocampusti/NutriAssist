
import React from 'react';
import { LetterheadConfig } from '../types';

interface ProjectDocumentationProps {
  letterhead: LetterheadConfig;
  onClose: () => void;
}

const ProjectDocumentation: React.FC<ProjectDocumentationProps> = ({ letterhead, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* BARRA DE CONTROLE */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden sticky top-4 z-20 flex justify-between items-center">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span>📖</span> Documentação Oficial do Sistema
        </h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
            Imprimir Manual
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* DOCUMENTO TIMBRADO */}
      <div className="bg-white shadow-2xl rounded-sm border border-slate-300 mx-auto min-h-[1100px] flex flex-col relative print:shadow-none print:border-none">

        {/* CABEÇALHO INSTITUCIONAL */}
        <div className="p-12 border-b-2 border-slate-100 flex flex-col items-center text-center">
          {letterhead.headerImage ? (
            <img src={letterhead.headerImage} className="h-24 object-contain mb-4" alt="Brasão Oficial" />
          ) : (
            <div className="text-4xl mb-4 grayscale opacity-40">🏛️</div>
          )}

          <div className="space-y-1">
            <h1 className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-900">ESTADO DA BAHIA</h1>
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">BROTAS DE MACAÚBAS - BA</h2>
            <h3 className="text-[11px] font-bold uppercase text-slate-700">PREFEITURA MUNICIPAL</h3>
            <h4 className="text-[10px] font-semibold uppercase text-slate-600">SECRETARIA MUNICIPAL DE EDUCAÇÃO</h4>
          </div>
        </div>

        {/* CONTEÚDO DA DOCUMENTAÇÃO */}
        <div className="p-16 flex-1 space-y-10 text-slate-900 font-serif leading-relaxed text-justify">

          <h1 className="text-center font-black text-2xl uppercase underline decoration-2 underline-offset-[12px] decoration-slate-300 mb-16">
            DOCUMENTAÇÃO OFICIAL DO PROJETO INSTITUCIONAL: SISTEMA NUTRIASSIST
          </h1>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">1. Apresentação do Projeto</h2>
            <p className="text-[14px]">
              O NutriAssist é uma plataforma tecnológica institucional desenvolvida para a Secretaria Municipal de Educação de Brotas de Macaúbas - BA. O sistema tem como propósito central modernizar, organizar e dar segurança jurídica à gestão da Alimentação Escolar no município, integrando ferramentas de inteligência normativa, controle de suprimentos e vigilância nutricional.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">2. Justificativa Institucional</h2>
            <p className="text-[14px]">
              A complexidade das normas do Programa Nacional de Alimentação Escolar (PNAE) exige rigor técnico na produção de pareceres e no controle de recursos. Este sistema justifica-se pela necessidade de eliminar erros na redação de atos oficiais, garantir o cumprimento da cota de 45% da Agricultura Familiar e assegurar que as especificações técnicas de alimentos atendam aos padrões da ANVISA e do FNDE.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">3. Objetivos Gerais e Específicos</h2>
            <div className="text-[14px] space-y-2">
              <p><strong>Objetivo Geral:</strong> Automatizar e padronizar os processos técnicos e administrativos da Nutrição Escolar municipal.</p>
              <p><strong>Objetivos Específicos:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Garantir a conformidade normativa dos documentos produzidos;</li>
                <li>Monitorar em tempo real o saldo de estoque nas unidades escolares;</li>
                <li>Consolidar diagnósticos nutricionais para planejamento de cardápios;</li>
                <li>Subsidiar o setor de licitações com descritivos técnicos precisos.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">4. Abrangência do Sistema</h2>
            <p className="text-[14px]">
              O sistema abrange todas as unidades da rede municipal de ensino, incluindo Creches, Pré-Escolas, Ensino Fundamental I e II, Educação de Jovens e Adultos (EJA) e programas de tempo integral, atendendo tanto a sede quanto a zona rural do município.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">5. Perfis de Usuários e Responsabilidades</h2>
            <div className="text-[14px] space-y-4">
              <p><strong>Administrador:</strong> Gestão de governança, configuração de timbrados, auditoria de logs e restauração de arquivos.</p>
              <p><strong>Nutricionista RT:</strong> Responsável técnico pela elaboração de pareceres, avaliações nutricionais, planejamentos de compra e formação de merendeiras.</p>
              <p><strong>Técnico:</strong> Atuação na validação e revisão de minutas documentais enviadas pela equipe de nutrição.</p>
              <p><strong>Visualizador:</strong> Perfil restrito para consulta de relatórios consolidados e documentos já arquivados.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">6. Módulos do Sistema</h2>
            <ul className="text-[14px] space-y-2 list-disc list-inside">
              <li><strong>Redação Técnica:</strong> Motor de geração de documentos assistido por IA.</li>
              <li><strong>Estoque e Logística:</strong> Controle de entradas, saídas e validades de lotes.</li>
              <li><strong>Vigilância Nutricional:</strong> Registro de antropometria e diagnósticos nutricionais.</li>
              <li><strong>Capacitação:</strong> Registro de atas e conteúdo programático de formações.</li>
              <li><strong>Licitação:</strong> Simulador de quantitativos e descritivos técnicos de alimentos.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">7. Fluxo de Produção e Aprovação</h2>
            <p className="text-[14px]">
              O sistema adota um workflow rigoroso: Elaboração (Nutricionista) &rarr; Análise Técnica (Revisor) &rarr; Devolução para Ajustes ou Aprovação &rarr; Homologação Final e Arquivamento. Atos arquivados tornam-se imutáveis e oficiais para fins de fiscalização.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">8. Padronização Institucional</h2>
            <p className="text-[14px]">
              A padronização visual e textual é gerida centralmente, garantindo que todo documento emitido contenha o brasão do município e as informações hierárquicas corretas, eliminando a fragmentação da identidade visual da Secretaria.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">9. Segurança, Backup e Arquivamento</h2>
            <p className="text-[14px]">
              O sistema utiliza criptografia de dados e políticas de Row Level Security (RLS) para proteção de dados sensíveis. A exclusão de documentos é apenas lógica, permanecendo em custódia na Lixeira Institucional para auditoria antes de qualquer remoção definitiva pelo administrador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">10. Relatórios e Dashboard</h2>
            <p className="text-[14px]">
              Gestores têm acesso a um dashboard estratégico que exibe o status global do PNAE no município, indicadores de consumo, eficácia documental e alertas de estoque crítico, facilitando a tomada de decisão baseada em dados reais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">11. Benefícios para a Gestão Pública</h2>
            <ul className="text-[14px] space-y-2 list-disc list-inside">
              <li>Eficiência administrativa e redução de burocracia papelista;</li>
              <li>Transparência ativa perante órgãos de controle (TCE/FNDE);</li>
              <li>Melhoria na qualidade nutricional da merenda escolar;</li>
              <li>Segurança jurídica na elaboração de editais de compra.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase border-b border-slate-200 pb-2">12. Considerações Finais</h2>
            <p className="text-[14px]">
              Este documento institui o sistema NutriAssist como ferramenta oficial de apoio técnico da Secretaria Municipal de Educação de Brotas de Macaúbas. Sua utilização é mandatória para o registro de atos da alimentação escolar, visando o aprimoramento contínuo do serviço público e a garantia do direito humano à alimentação adequada e saudável no ambiente escolar.
            </p>
          </section>
        </div>

        {/* RODAPÉ DO DOCUMENTO */}
        <div className="p-12 pt-0 flex flex-col items-center text-center">
          <div className="w-80 border-t border-slate-400 pt-4 mt-12 opacity-80">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">Documentação Institucional</p>
            <p className="text-[9px] text-slate-500 uppercase font-medium mt-1">Secretaria Municipal de Educação</p>
          </div>
        </div>

        <div className="p-10 border-t border-slate-50 text-center bg-slate-50/20">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed max-w-2xl mx-auto">
            {letterhead.rodapeTexto || "Este documento é de uso estritamente institucional para fins de gestão do Programa Nacional de Alimentação Escolar (PNAE)."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentation;
