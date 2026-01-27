
import React from 'react';
import { LetterheadConfig } from '../types';

interface OrdinanceDraftProps {
  letterhead: LetterheadConfig;
  onClose: () => void;
}

const OrdinanceDraft: React.FC<OrdinanceDraftProps> = ({ letterhead, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* BARRA DE CONTROLE */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden sticky top-4 z-20 flex justify-between items-center">
        <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
          <span>📜</span> Minuta de Portaria Administrativa
        </h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
            Imprimir Portaria
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

        {/* CONTEÚDO DA PORTARIA */}
        <div className="p-16 flex-1 space-y-8 text-slate-900 font-serif leading-relaxed text-[14px]">
          
          <div className="text-center space-y-6 mb-12">
            <h1 className="font-black text-lg uppercase tracking-widest">
              PORTARIA SEMED Nº ____/____
            </h1>
            <div className="flex justify-end">
              <div className="w-1/2 text-justify italic text-[12px] leading-snug border-l-2 border-slate-200 pl-4">
                "Institui e regulamenta a implantação do Sistema Municipal de Gestão da Alimentação Escolar - NutriAssist, estabelece normas para a redação de atos técnicos, controle de suprimentos e vigilância nutricional na rede municipal de ensino de Brotas de Macaúbas, e dá outras providências."
              </div>
            </div>
          </div>

          <p className="font-bold uppercase mb-6">
            O(A) SECRETÁRIO(A) MUNICIPAL DE EDUCAÇÃO DE BROTAS DE MACAÚBAS, Estado da Bahia, no uso de suas atribuições legais e em conformidade com as diretrizes do Programa Nacional de Alimentação Escolar (PNAE);
          </p>

          <p className="font-bold uppercase mb-4">RESOLVE:</p>

          <div className="space-y-6 text-justify">
            <p>
              <strong>Art. 1º</strong> - Fica instituído o Sistema Municipal de Gestão da Alimentação Escolar, denominado NutriAssist, como plataforma tecnológica oficial e obrigatória para o suporte técnico e administrativo da Nutrição Escolar no âmbito desta Secretaria Municipal de Educação.
            </p>

            <p>
              <strong>Art. 2º</strong> - O sistema NutriAssist tem por finalidade centralizar, padronizar e dar segurança jurídica aos processos de:
              <br />I – Elaboração de Pareceres Técnicos Nutricionais, Notas Técnicas e Ofícios;
              <br />II – Controle de Estoque e movimentação de insumos alimentares (PNAE);
              <br />III – Registro de Vigilância Nutricional e Antropometria escolar;
              <br />IV – Planejamento técnico de processos licitatórios e chamadas públicas da agricultura familiar;
              <br />V – Registro de Atas e formações continuadas para manipuladores de alimentos.
            </p>

            <p>
              <strong>Art. 3º</strong> - A utilização do sistema estende-se a todas as unidades escolares pertencentes à rede municipal de ensino, incluindo creches, pré-escolas, ensino fundamental e educação de jovens e adultos.
            </p>

            <p>
              <strong>Art. 4º</strong> - O acesso ao sistema será segmentado por perfis de responsabilidade técnica e administrativa, a saber:
              <br /><strong>I – Administrador:</strong> Responsável pela governança do sistema, auditoria de logs e configuração da identidade visual institucional;
              <br /><strong>II – Nutricionista RT:</strong> Responsável técnico pela geração de atos e diagnósticos de vigilância nutricional;
              <br /><strong>III – Técnico:</strong> Atuante na revisão, validação e fluxo de análise de minutas documentais;
              <br /><strong>IV – Visualizador:</strong> Perfil restrito para consulta de relatórios consolidados e arquivo morto.
            </p>

            <p>
              <strong>Art. 5º</strong> - Todo documento técnico gerado pelo sistema deverá obrigatoriamente utilizar o Papel Timbrado Institucional configurado pela administração, garantindo a uniformidade da comunicação oficial da Secretaria.
            </p>

            <p>
              <strong>Art. 6º</strong> - Os documentos gerados e arquivados eletronicamente no sistema NutriAssist possuem validade administrativa institucional, devendo ser mantidos em custódia digital para fins de fiscalização pelo Conselho de Alimentação Escolar (CAE) e pelo Fundo Nacional de Desenvolvimento da Educação (FNDE).
              <br /><strong>Parágrafo Único</strong> - A exclusão de documentos técnicos é permitida apenas em caráter lógico (Lixeira), permanecendo os dados à disposição para auditoria do administrador.
            </p>

            <p>
              <strong>Art. 7º</strong> - Esta Portaria entra em vigor na data de sua publicação, revogadas as disposições em contrário.
            </p>
          </div>

          <div className="mt-20 text-center space-y-12">
            <p className="uppercase font-bold tracking-widest">
              Gabinete do(a) Secretário(a) Municipal de Educação
            </p>
            
            <div className="flex flex-col items-center">
               <div className="w-80 border-t border-slate-900 pt-2">
                  <p className="font-bold uppercase text-[12px]">Secretário(a) Municipal de Educação</p>
                  <p className="text-[10px] text-slate-500 uppercase">Brotas de Macaúbas - BA</p>
               </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ DO DOCUMENTO */}
        <div className="p-10 border-t border-slate-50 text-center bg-slate-50/20">
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed max-w-2xl mx-auto">
             {letterhead.rodapeTexto || "Este documento é uma minuta oficial do Programa Nacional de Alimentação Escolar (PNAE)."}
           </p>
        </div>
      </div>
    </div>
  );
};

export default OrdinanceDraft;
