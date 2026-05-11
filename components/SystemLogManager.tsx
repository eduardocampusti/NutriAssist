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
      <div style={{background:'#fff',borderRadius:20,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#1e293b,#0f172a)',padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
        <div className="flex items-center gap-4">
          <div style={{width:40,height:40,background:'rgba(255,255,255,0.10)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,border:'1px solid rgba(255,255,255,0.12)',flexShrink:0}}>📜</div>
          <div>
            <h2 style={{fontSize:17,fontWeight:900,color:'#fff',margin:'0 0 2px',letterSpacing:'-0.02em',textTransform:'uppercase'}}>Trilha de Auditoria</h2>
            <p style={{fontSize:12,color:'rgba(255,255,255,0.45)',margin:0}}>Rastreabilidade completa de eventos críticos do sistema</p>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(255,255,255,0.08)',padding:4,borderRadius:10,border:'1px solid rgba(255,255,255,0.10)'}}>
            {modules.slice(0, 5).map(m => (
              <button
                key={m}
                onClick={() => setFilterModule(m)}
                style={{padding:'5px 12px',borderRadius:7,fontSize:10,fontWeight:700,border:'none',cursor:'pointer',background:filterModule===m?'#fff':'transparent',color:filterModule===m?'#0f172a':'rgba(255,255,255,0.5)',boxShadow:filterModule===m?'0 1px 4px rgba(0,0,0,0.15)':'none',transition:'all 0.15s',textTransform:'uppercase',letterSpacing:'0.05em',fontFamily:'inherit'}}
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

          <div style={{width:1,height:20,background:'rgba(255,255,255,0.15)'}}></div>

          <button
            onClick={async () => {
              if (confirm("Deseja realmente apagar todos os logs? Esta ação é irreversível.")) {
                await onClear();
                alert("Logs limpos com sucesso!");
              }
            }}
            style={{padding:'7px 14px',fontSize:10,fontWeight:700,color:'#fca5a5',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:9,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit',textTransform:'uppercase',letterSpacing:'0.05em'}}
          >
            <span className="opacity-70">🗑️</span> Limpar Tudo
          </button>

          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.10)',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,0.6)',flexShrink:0}}>
            <svg style={{width:15,height:15}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        </div>
      </div>

      <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',overflow:'hidden',minHeight:400}}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead style={{background:'linear-gradient(135deg,#1e293b,#0f172a)',position:'sticky',top:0,zIndex:10}}>
              <tr>
                <th style={{padding:'12px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Data / Hora</th>
                <th style={{padding:'12px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Usuário</th>
                <th style={{padding:'12px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Módulo</th>
                <th style={{padding:'12px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Ação Irreversível / Evento</th>
                <th style={{padding:'12px 20px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Evidência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div style={{width:52,height:52,background:'#f1f5f9',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,opacity:0.6}}>🔍</div>
                      <p style={{color:'#94a3b8',fontSize:13,fontStyle:'italic',margin:0}}>Nenhum evento registrado para este filtro.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                [...filteredLogs].map((log) => {
                  const profile = profiles.find(p => p.id === log.usuario_id);
                  return (
                    <tr key={log.id} style={{borderBottom:'1px solid #f8fafc',transition:'background 0.15s'}} onMouseEnter={e=>{(e.currentTarget as HTMLTableRowElement).style.background='#f8fafc';}} onMouseLeave={e=>{(e.currentTarget as HTMLTableRowElement).style.background='transparent';}}>
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
                          <div style={{width:28,height:28,background:'linear-gradient(135deg,#1e293b,#0f172a)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',flexShrink:0}}>
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
