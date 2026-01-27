
import React, { useState, useMemo } from 'react';
import { FormalDocument, UserProfile, DocStatus, UserRole, School, DocumentCategory } from '../types';

interface DocumentArchiveProps {
  documents: FormalDocument[];
  profiles: UserProfile[];
  schools: School[];
  activeProfile?: UserProfile;
  onSelectItem: (doc: FormalDocument) => void;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const DocumentArchive: React.FC<DocumentArchiveProps> = ({
  documents,
  profiles,
  schools,
  activeProfile,
  onSelectItem,
  onDelete,
  onClose
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSchool, setFilterSchool] = useState<string>('ALL');

  const isAdmin = activeProfile?.role === UserRole.ADMIN;
  const isNutricionista = activeProfile?.role === UserRole.NUTRICIONISTA;
  const isVisualizador = activeProfile?.role === UserRole.VISUALIZADOR;

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // 1. Filtrar excluídos
      if (doc.isDeleted) return false;

      // 2. Política de Visibilidade por Role
      // Visualizador só vê Arquivados
      if (isVisualizador && doc.status !== DocStatus.ARQUIVADO) return false;

      // Nutricionista vê os seus e outros Arquivados
      if (isNutricionista && doc.responsavel_id !== activeProfile?.id && doc.status !== DocStatus.ARQUIVADO) return false;

      // Admin e Técnico veem documentos em Análise, Aprovados e Arquivados
      if (!isAdmin && activeProfile?.role !== UserRole.TECNICO && !isNutricionista) {
        if (doc.status !== DocStatus.ARQUIVADO) return false;
      }

      // 3. Filtros do Usuário
      if (filterType !== 'ALL' && doc.document_type !== filterType) return false;
      if (filterSchool !== 'ALL' && doc.school_id !== filterSchool) return false;

      return true;
    });
  }, [documents, activeProfile, filterType, filterSchool]);

  const getStatusBadge = (s: DocStatus) => {
    switch (s) {
      case DocStatus.ELABORACAO: return 'bg-slate-100 text-slate-500 border-slate-200';
      case DocStatus.ANALISE: return 'bg-blue-50 text-blue-600 border-blue-100';
      case DocStatus.AJUSTE: return 'bg-red-50 text-red-600 border-red-100';
      case DocStatus.APROVADO: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case DocStatus.ARQUIVADO: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl shadow-xl border border-slate-700">📂</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Arquivo Digital Oficial</h2>
            <p className="text-slate-500 text-sm">Brotas de Macaúbas - BA • SEMED</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Filtrar Categoria</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">TODAS AS CATEGORIAS</option>
            {Object.values(DocumentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Filtrar Unidade</label>
          <select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">TODAS AS UNIDADES</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Protocolo</th>
              <th className="px-6 py-4">Documento / Título</th>
              <th className="px-6 py-4">Responsável</th>
              <th className="px-6 py-4">Fase do Fluxo</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                  O arquivo não contém registros visíveis para o seu perfil.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => {
                const profile = profiles.find(p => p.id === doc.responsavel_id);
                const school = schools.find(s => s.id === doc.school_id);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-slate-400 tracking-tighter">#{doc.id.substring(0, 8)}</div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                        <span>🕒</span> {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 uppercase tracking-tight">{doc.titulo}</div>
                      <div className="text-[9px] text-slate-400 uppercase mt-1 flex gap-2">
                        <span className="bg-slate-100 px-1 rounded">{doc.document_type}</span>
                        {school && <span className="text-indigo-600 font-bold truncate max-w-[150px]">• {school.nome}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {profile?.nome || 'Anônimo'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatusBadge(doc.status)}`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => onSelectItem(doc)} className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1.5 rounded-lg text-[10px] font-black transition-all shadow-md active:scale-95 uppercase">ABRIR</button>
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              if (confirm("Mover este documento para o backup? (Soft Delete)")) {
                                await onDelete(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                            title="Mover para Backup"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentArchive;
