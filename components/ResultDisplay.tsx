
import React, { useState } from 'react';
import { GeneratedContent, DocStatus, UserRole, LetterheadConfig, UserProfile } from '../types';
import { OfficialLetterhead } from './OfficialLetterhead';

interface ResultDisplayProps {
  documentId: string;
  data: GeneratedContent;
  status: DocStatus;
  aiDrafts?: any[];
  workflowHistory?: any[];
  parecerTecnico?: string;
  onClose: () => void;
  onUpdateStatus?: (status: DocStatus, observacao?: string) => void;
  onApproveDraft?: (draftId: string) => void;
  onDelete?: (id: string) => void;
  activeProfile?: UserProfile;
  letterhead: LetterheadConfig;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  documentId,
  data,
  status,
  workflowHistory = [],
  parecerTecnico,
  onClose,
  onUpdateStatus,
  activeProfile,
  letterhead
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const isNutricionista = activeProfile?.role === UserRole.NUTRICIONISTA;
  const isAdmin = activeProfile?.role === UserRole.ADMIN;
  const isTecnico = activeProfile?.role === UserRole.TECNICO;
  const isSecretario = activeProfile?.role === UserRole.SECRETARIO;

  // REGRAS DE WORKFLOW
  const canSendToAnalysis = isNutricionista && (status === DocStatus.ELABORACAO);
  const canReview = (isSecretario || isAdmin) && status === DocStatus.ENVIADO;
  const canHomologate = isAdmin && status === DocStatus.APROVADO;
  const isOfficial = status === DocStatus.ARQUIVADO;

  const getStatusLabel = (s: DocStatus) => {
    switch (s) {
      case DocStatus.ELABORACAO: return 'Em Elaboração';
      case DocStatus.ENVIADO: return 'Em Análise Técnica';
      case DocStatus.APROVADO: return 'Aprovado Tecnicamente';
      case DocStatus.REJEITADO: return 'Devolvido para Ajustes';
      case DocStatus.ARQUIVADO: return 'Arquivado Oficialmente';
      default: return s;
    }
  };

  const getStatusColor = (s: DocStatus) => {
    switch (s) {
      case DocStatus.ELABORACAO: return 'bg-slate-100 text-slate-600 border-slate-200';
      case DocStatus.ENVIADO: return 'bg-blue-50 text-blue-600 border-blue-200';
      case DocStatus.REJEITADO: return 'bg-red-50 text-red-600 border-red-200';
      case DocStatus.APROVADO: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case DocStatus.ARQUIVADO: return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* BARRA DE CONTROLE DE WORKFLOW */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden sticky top-4 z-10 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm transition-all ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
          <h2 className="text-xs font-bold text-slate-500 hidden md:block">Protocolo #{documentId.substring(0, 8)}</h2>
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Histórico do Fluxo">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>

          <button onClick={() => {
            const textToCopy = `${data.titulo}\n\n${data.assunto}\n\n${data.corpo}\n\n${data.conclusao}`;
            navigator.clipboard.writeText(textToCopy);
            alert("Texto copiado para área de transferência!");
          }} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Copiar como Texto (Editável)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          </button>

          {(canSendToAnalysis || isOfficial) && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-[10px] font-black bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
            >
              <span>📄</span> Imprimir / PDF
            </button>
          )}

          {canReview && onUpdateStatus && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const reason = prompt("Descreva os ajustes necessários:");
                  if (reason) onUpdateStatus(DocStatus.REJEITADO, reason);
                }}
                className="px-4 py-2 text-[10px] font-black bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 uppercase tracking-widest transition-all"
              >
                ↩️ Devolver
              </button>
              <button
                onClick={() => onUpdateStatus(DocStatus.APROVADO, "Aprovado tecnicamente conforme diretrizes do PNAE.")}
                className="px-4 py-2 text-[10px] font-black bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg uppercase tracking-widest transition-all active:scale-95"
              >
                ✅ Aprovar
              </button>
            </div>
          )}

          {canHomologate && onUpdateStatus && (
            <button
              onClick={() => onUpdateStatus(DocStatus.ARQUIVADO, "Homologação final e arquivamento institucional.")}
              className="px-4 py-2 text-[10px] font-black bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg uppercase tracking-widest transition-all active:scale-95"
            >
              🏛️ Homologar e Arquivar
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>
      </div>

      {/* HISTÓRICO */}
      {showHistory && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-in fade-in duration-300">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Histórico de Tramitação</h3>
          <div className="space-y-4">
            {workflowHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum evento registrado.</p>
            ) : (
              workflowHistory.map((event: any, idx: number) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-100 pb-1 last:pb-0">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(event.status)}`}></div>
                  <div className="mb-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 block">{new Date(event.timestamp).toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-700">{getStatusLabel(event.status)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTO OFICIAL TIMBRADO */}
      <div className="bg-white shadow-2xl rounded-sm border border-slate-300 mx-auto min-h-[1100px] flex flex-col relative print:shadow-none print:border-none">

        {/* CABEÇALHO TIMBRADO OFICIAL */}
        <OfficialLetterhead
          config={letterhead}
          className="p-12 border-b-2 border-slate-100"
          showDate={false}
        />

        {/* CONTEÚDO */}
        <div className="p-16 flex-1 space-y-10 text-slate-900 font-serif leading-relaxed">
          <div className="space-y-4">
            <h4 className="text-center font-black text-xl mb-12 uppercase underline decoration-2 underline-offset-[12px] decoration-slate-300">
              {data.titulo}
            </h4>
            <div className="space-y-2 text-[13px]">
              <p className="font-bold flex gap-2">ASSUNTO: <span className="font-normal uppercase">{data.assunto}</span></p>
              <p className="font-bold flex gap-2">DESTINATÁRIO: <span className="font-normal uppercase">{data.destinatario}</span></p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-justify text-[14px] leading-[1.8]">
            <div className="whitespace-pre-wrap">{data.corpo}</div>
          </div>

          <div className="pt-12 text-[14px]">
            <h5 className="font-bold mb-3 uppercase text-[11px] tracking-widest text-slate-500 border-b border-slate-100 pb-1 w-fit">Parecer Conclusivo:</h5>
            <div className="text-justify italic bg-slate-50 p-5 rounded-lg border border-slate-100 text-slate-800">
              {data.conclusao}
            </div>
          </div>

          {data.observacoes && (
            <div className="pt-8 text-[11px] text-slate-500 italic">
              <p className="font-black uppercase mb-1 not-italic tracking-tighter text-slate-400">Observações Técnicas:</p>
              <p>{data.observacoes}</p>
            </div>
          )}
        </div>

        {/* ASSINATURA */}
        <div className="p-12 pt-0 flex flex-col items-center text-center">
          <div className="w-96 border-t border-slate-400 pt-6 mt-16">
            <p className="text-[14px] font-black uppercase tracking-widest text-slate-800">
              {activeProfile?.nome || 'RESPONSÁVEL TÉCNICO'}
            </p>
            <p className="text-[11px] font-bold text-slate-600 uppercase">
              Matrícula/CRN: {activeProfile?.id?.substring(0, 8)}
            </p>
          </div>

          <OfficialLetterhead
            config={letterhead}
            type="footer"
            className="mt-10"
          />
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
