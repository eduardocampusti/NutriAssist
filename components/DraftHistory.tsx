
import React from 'react';
import { DocumentAiDraft } from '../types';

interface DraftHistoryProps {
  drafts: DocumentAiDraft[];
  onApprove: (draftId: string) => void;
}

const DraftHistory: React.FC<DraftHistoryProps> = ({ drafts, onApprove }) => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span>🤖</span> Registro de Processamento de IA (Log de Drafts)
      </h3>
      
      <div className="space-y-3">
        {drafts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Nenhum log de processamento encontrado para este documento.</p>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className={`p-4 rounded-xl border transition-all ${draft.aprovado ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400">#{draft.id.substring(0,8)}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(draft.created_at).toLocaleString()}</span>
                </div>
                {draft.aprovado ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Aprovado para Minuta
                  </span>
                ) : (
                  <button 
                    onClick={() => onApprove(draft.id)}
                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase underline"
                  >
                    Marcar como Aprovado
                  </button>
                )}
              </div>
              
              <details className="text-[10px]">
                <summary className="cursor-pointer text-slate-500 font-bold hover:text-slate-700">Ver Payload de Entrada (Prompt Context)</summary>
                <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto">
                  {JSON.stringify(draft.prompt_enviado, null, 2)}
                </pre>
              </details>
              
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="text-[10px]">
                  <span className="block font-bold text-slate-400 mb-1 uppercase tracking-tighter">Resumo Gerado</span>
                  <p className="text-slate-700 line-clamp-2 italic">"{draft.texto_gerado.titulo}"</p>
                </div>
                <div className="text-[10px]">
                  <span className="block font-bold text-slate-400 mb-1 uppercase tracking-tighter">Observações da IA</span>
                  <p className="text-slate-600 line-clamp-2">{draft.texto_gerado.observacoes}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DraftHistory;
