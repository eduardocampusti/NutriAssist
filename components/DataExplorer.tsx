
import React, { useState } from 'react';
import { FormalDocument, DocumentAiDraft, UserProfile } from '../types';

interface DataExplorerProps {
  documents: FormalDocument[];
  drafts: DocumentAiDraft[];
  profiles: UserProfile[];
  onClose: () => void;
}

type TableType = 'documents' | 'document_ai_drafts' | 'profiles';

const DataExplorer: React.FC<DataExplorerProps> = ({ documents, drafts, profiles, onClose }) => {
  const [activeTable, setActiveTable] = useState<TableType>('documents');

  const renderTableHead = () => {
    switch (activeTable) {
      case 'documents':
        return (
          <tr>
            <th className="px-4 py-2">id (UUID)</th>
            <th className="px-4 py-2">document_type</th>
            <th className="px-4 py-2">titulo</th>
            <th className="px-4 py-2">status</th>
            <th className="px-4 py-2">responsavel_id</th>
            <th className="px-4 py-2">school_id (RLS)</th>
            <th className="px-4 py-2">created_at</th>
          </tr>
        );
      case 'document_ai_drafts':
        return (
          <tr>
            <th className="px-4 py-2">id (UUID)</th>
            <th className="px-4 py-2">document_id</th>
            <th className="px-4 py-2">prompt_enviado (JSONB)</th>
            <th className="px-4 py-2">texto_gerado (JSONB)</th>
            <th className="px-4 py-2">aprovado</th>
            <th className="px-4 py-2">created_at</th>
          </tr>
        );
      case 'profiles':
        return (
          <tr>
            <th className="px-4 py-2">id (UUID)</th>
            <th className="px-4 py-2">nome</th>
            <th className="px-4 py-2">role (ENUM)</th>
            <th className="px-4 py-2">school_id (FK)</th>
            <th className="px-4 py-2">ativo</th>
            <th className="px-4 py-2">created_at</th>
          </tr>
        );
    }
  };

  const renderTableBody = () => {
    if (activeTable === 'document_ai_drafts' && drafts.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-12 text-center text-red-400 font-mono text-xs italic">
            -- [RLS_DENIED]: SELECT privilege denied for current role on document_ai_drafts --
          </td>
        </tr>
      );
    }

    switch (activeTable) {
      case 'documents':
        return documents.map(doc => (
          <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{doc.id}</td>
            <td className="px-4 py-3"><span className="text-[10px] font-bold px-1 py-0.5 bg-slate-100 rounded">{doc.document_type}</span></td>
            <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[200px]">{doc.titulo}</td>
            <td className="px-4 py-3"><span className="text-[10px] text-emerald-600 font-black">{doc.status}</span></td>
            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{doc.responsavel_id}</td>
            <td className="px-4 py-3 font-mono text-[10px] text-amber-600">{doc.school_id || 'NULL'}</td>
            <td className="px-4 py-3 text-[10px] text-slate-500">{new Date(doc.created_at).toISOString()}</td>
          </tr>
        ));
      case 'document_ai_drafts':
        return drafts.map(draft => (
          <tr key={draft.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{draft.id}</td>
            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{draft.document_id}</td>
            <td className="px-4 py-3">
              <details className="text-[10px] cursor-pointer">
                <summary className="text-emerald-600 font-bold">VIEW JSONB</summary>
                <pre className="p-2 bg-slate-900 text-emerald-400 rounded mt-1 overflow-auto max-w-xs max-h-40">{JSON.stringify(draft.prompt_enviado, null, 2)}</pre>
              </details>
            </td>
            <td className="px-4 py-3">
              <details className="text-[10px] cursor-pointer">
                <summary className="text-blue-600 font-bold">VIEW JSONB</summary>
                <pre className="p-2 bg-slate-900 text-blue-300 rounded mt-1 overflow-auto max-w-xs max-h-40">{JSON.stringify(draft.texto_gerado, null, 2)}</pre>
              </details>
            </td>
            <td className="px-4 py-3 text-center">
              {draft.aprovado ? <span className="text-emerald-500 text-lg">✓</span> : <span className="text-slate-300">✗</span>}
            </td>
            <td className="px-4 py-3 text-[10px] text-slate-500">{new Date(draft.created_at).toISOString()}</td>
          </tr>
        ));
      case 'profiles':
        return profiles.map(profile => (
          <tr key={profile.id} className="border-b border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{profile.id}</td>
            <td className="px-4 py-3 font-bold text-slate-800">{profile.nome}</td>
            <td className="px-4 py-3 font-mono text-[10px]">{profile.role}</td>
            <td className="px-4 py-3 font-mono text-[10px] text-amber-600">{profile.school_id || 'NULL'}</td>
            <td className="px-4 py-3 text-center">{profile.ativo ? 'TRUE' : 'FALSE'}</td>
            <td className="px-4 py-3 text-[10px] text-slate-500">{new Date(profile.created_at).toISOString()}</td>
          </tr>
        ));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center text-2xl shadow-inner font-mono font-black border border-emerald-900/50">SQL</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Explorador de Dados</h2>
            <p className="text-slate-500 text-sm font-mono uppercase tracking-tighter">Políticas de Segurança (RLS) Ativas em Todas as Tabelas</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
        {(['documents', 'document_ai_drafts', 'profiles'] as TableType[]).map(table => (
          <button
            key={table}
            onClick={() => setActiveTable(table)}
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTable === table 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {table}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
        <div className="bg-slate-900 text-emerald-500 p-4 font-mono text-xs flex justify-between items-center">
          <span>SELECT * FROM {activeTable} WHERE ENABLE_RLS = TRUE;</span>
          <span className="flex items-center gap-2">
             <span className="text-amber-500 animate-pulse text-[10px] font-black uppercase">Segurança Ativa</span>
             <span className="opacity-50 font-sans font-bold uppercase tracking-widest text-[9px]">Rows: {
               activeTable === 'documents' ? documents.length :
               activeTable === 'document_ai_drafts' ? drafts.length :
               profiles.length
             }</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] leading-tight border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-tighter sticky top-0">
              {renderTableHead()}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-6 border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/30">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
            <span>🛡️</span> Políticas de Row Level Security (RLS) Implementadas:
          </h4>
          <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded border border-red-200 uppercase">
            DELETE REVOKED ON documents
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-600 leading-relaxed">
          <div className="bg-white/50 p-3 rounded-xl border border-emerald-100">
            <p className="font-bold text-emerald-800 mb-1">Políticas de Perfis e Escolas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>Usuário vê seu próprio perfil</code>: Restringe visualização onde <code>id = auth.uid()</code>.</li>
              <li><code>Nutricionista vê todos os perfis</code>: Acesso total para role 'NUTRICIONISTA'.</li>
              <li><code>Usuários veem escolas</code>: Acesso liberado para todos os usuários autenticados.</li>
            </ul>
          </div>
          <div className="bg-white/50 p-3 rounded-xl border border-emerald-100">
            <p className="font-bold text-emerald-800 mb-1">Políticas de Documentos e Auditoria:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>Nutricionista vê todos os documentos</code>: SELECT total liberado para role 'NUTRICIONISTA'.</li>
              <li><code>Nutricionista edita rascunho</code>: UPDATE restrito a <code>status='RASCUNHO'</code> por Nutricionistas.</li>
              <li><code>Nutricionista vê rascunhos IA</code>: SELECT em <code>document_ai_drafts</code> restrito à role 'NUTRICIONISTA'.</li>
              <li><code>Nutricionista cria rascunho IA</code>: INSERT em <code>document_ai_drafts</code> restrito à role 'NUTRICIONISTA'.</li>
              <li><code>Secretaria emite documento</code>: UPDATE permitido para mudar status para 'EMITIDO'.</li>
              <li><code>Secretaria vê documentos emitidos</code>: Restringe acesso a rascunhos (status ≠ 'RASCUNHO').</li>
              <li><code>Nutricionista vê logs</code>: SELECT em <code>system_logs</code> liberado para role 'NUTRICIONISTA'.</li>
              <li><code>Logs do sistema</code>: Restritos ao autor (usuario_id = current_user) via política base.</li>
              <li><code>Nutricionista cria documentos</code>: Restringe INSERT apenas para role 'NUTRICIONISTA'.</li>
              <li><code>Imutabilidade de Atos</code>: Permissão DELETE revogada para o papel 'authenticated'.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
