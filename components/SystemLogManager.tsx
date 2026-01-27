import React, { useState } from 'react';
import { SystemLog, UserProfile } from '../types';

import { useDocuments } from '../contexts/DocumentContext';
import { useUsers } from '../contexts/UserContext';

const SystemLogManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { systemLogs: logs, clearLogs: onClear } = useDocuments();
  const { profiles } = useUsers();
  const [filterModule, setFilterModule] = useState<string>('TODOS');

  const modules = ['TODOS', ...Array.from(new Set(logs.map(l => l.modulo)))];

  const filteredLogs = filterModule === 'TODOS'
    ? logs
    : logs.filter(l => l.modulo === filterModule);

  const getModuleStyle = (module: string) => {
    const map: { [key: string]: string } = {
      'ESTOQUE': 'bg-blue-100 text-blue-700 border-blue-200',
      'DOCUMENTOS': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'USUARIOS': 'bg-purple-100 text-purple-700 border-purple-200',
      'ESCOLAS': 'bg-amber-100 text-amber-700 border-amber-200',
      'CARDAPIO': 'bg-rose-100 text-rose-700 border-rose-200',
      'EXECUCAO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'LICITACAO': 'bg-slate-100 text-slate-700 border-slate-200',
      'SISTEMA': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return map[module] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl shadow-inner shadow-white/10">📜</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Trilha de Auditoria</h2>
            <p className="text-slate-500 text-sm">Rastreabilidade completa de eventos críticos do sistema</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
            {modules.slice(0, 5).map(m => (
              <button
                key={m}
                onClick={() => setFilterModule(m)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${filterModule === m
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {m}
              </button>
            ))}
            {modules.length > 5 && (
              <select
                value={modules.includes(filterModule) && modules.indexOf(filterModule) >= 5 ? filterModule : ''}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-400 px-2 outline-none cursor-pointer"
              >
                <option value="" disabled>Mais...</option>
                {modules.slice(5).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>

          <button
            onClick={async () => {
              if (confirm("Deseja realmente apagar todos os logs? Esta ação é irreversível.")) {
                await onClear();
                alert("Logs limpos com sucesso!");
              }
            }}
            className="px-4 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100 flex items-center gap-2"
          >
            <span className="opacity-70">🗑️</span> Limpar Tudo
          </button>

          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 border border-transparent hover:border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-widest z-10">
              <tr>
                <th className="px-6 py-5">Data / Hora</th>
                <th className="px-6 py-5">Usuário</th>
                <th className="px-6 py-5">Módulo</th>
                <th className="px-6 py-5">Ação Irreversível / Evento</th>
                <th className="px-6 py-5">Evidência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl opacity-50 gray-scale">🔍</div>
                      <div className="text-slate-400 font-medium italic">Nenhum evento registrado para este filtro.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                [...filteredLogs].map((log) => {
                  const profile = profiles.find(p => p.id === log.usuario_id);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-500 font-mono tracking-tighter">
                          {new Date(log.created_at).toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                            {profile?.nome.substring(0, 2) || 'SY'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-700 font-bold leading-none mb-1">{profile?.nome || 'Sistema (Automático)'}</span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">ID:{log.usuario_id?.substring(0, 8) || 'SYSTEM'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border tracking-tight ${getModuleStyle(log.modulo)}`}>
                          {log.modulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-xs">
                          {log.acao.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <details className="text-[10px] group/details">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-black flex items-center gap-1 transition-colors outline-none list-none">
                            <span className="text-xs group-open/details:rotate-90 transition-transform">▸</span>
                            RASTREAR DADOS
                          </summary>
                          <div className="mt-3 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-slate-700 tracking-widest uppercase">Payload JSON</div>
                            <pre className="text-emerald-400 font-mono leading-relaxed overflow-x-auto max-w-sm whitespace-pre-wrap">
                              {JSON.stringify(log.dados, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SystemLogManager;
