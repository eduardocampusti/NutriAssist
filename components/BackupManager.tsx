
import React, { useRef, useState, useEffect } from 'react';
import { FormalDocument, UserProfile } from '../types';
import {
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Database,
  RefreshCw,
  FileJson,
  History,
  Clock,
  ExternalLink
} from 'lucide-react';

interface InternalBackup {
  id: string;
  timestamp: string;
  filename: string;
  data: Record<string, any>;
}

interface BackupManagerProps {
  documents: FormalDocument[];
  profiles: UserProfile[];
  onRestore: (id: string) => void;
  onClose: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ documents, profiles, onRestore, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<InternalBackup[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('nutriassist_backup_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico de backup", e);
      }
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: InternalBackup[]) => {
    setHistory(newHistory);
    localStorage.setItem('nutriassist_backup_history', JSON.stringify(newHistory));
  };

  // 1. EXPORT FUNCTION
  const handleExport = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutriassist_') && key !== 'nutriassist_backup_history') {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch (e) {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }

    const filename = `nutriassist_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });

    // Save to history automatically
    const newEntry: InternalBackup = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      filename,
      data: backupData
    };
    saveHistory([newEntry, ...history].slice(0, 10)); // Keep only last 10 backups

    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadBackup = (entry: InternalBackup) => {
    const blob = new Blob([JSON.stringify(entry.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry: InternalBackup) => {
    if (!confirm(`⚠️ Deseja restaurar o sistema para o estado de "${new Date(entry.timestamp).toLocaleString()}"? Isso irá substituir os dados atuais.`)) {
      return;
    }
    applyBackupData(entry.data);
  };

  const applyBackupData = (data: Record<string, any>) => {
    // Clear existing NutriAssist keys EXCEPT history
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutriassist_') && key !== 'nutriassist_backup_history') keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Set matching keys from backup
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith('nutriassist_')) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

    alert("✅ Sistema restaurado com sucesso! Reiniciando...");
    window.location.reload();
  };

  // 2. IMPORT FUNCTION
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("⚠️ ATENÇÃO: Importar um backup irá SUBSTITUIR todos os dados atuais. Deseja continuar?")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data !== 'object') throw new Error("Formato inválido");
        applyBackupData(data);
      } catch (err) {
        alert("❌ Erro ao processar o arquivo de backup. Verifique se é um JSON válido do NutriAssist.");
      }
    };
    reader.readAsText(file);
  };

  // 3. SYSTEM RESET
  const handleReset = () => {
    if (confirm("🚨 PERIGO: Isso irá apagar ABSOLUTAMENTE TODOS os dados do sistema. Esta ação não pode ser desfeita. Tem certeza?")) {
      if (confirm("Confirmação Final: Apagar tudo agora?")) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('nutriassist_')) keysToRemove.push(key);
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        window.location.reload();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-950 text-emerald-400 rounded-3xl flex items-center justify-center text-3xl shadow-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Central de Backup</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Database className="w-4 h-4" /> Gestão de Integridade e Segurança de Dados
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* BACKUP TOOLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* EXPORT CARD */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Exportar Dados</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">Baixe um arquivo de segurança com todas as informações do sistema.</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="mt-8 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            Gerar Cópia .JSON
          </button>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Importar Backup</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">Restaurar o sistema a partir de um arquivo gerado anteriormente.</p>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            Subir Arquivo
          </button>
        </div>

        {/* RESET CARD */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full bg-red-50/20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-red-800 uppercase tracking-tight">Zona de Perigo</h3>
              <p className="text-xs text-red-400 font-medium leading-relaxed mt-1">Limpar todos os dados do navegador para reiniciar o sistema do zero.</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-8 w-full py-4 bg-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition-all flex items-center justify-center gap-2 border border-red-200"
          >
            Restaurar Padrão de Fábrica
          </button>
        </div>

      </div>

      {/* BACKUP HISTORY */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Histórico de Segurança (Backups Internos)</h3>
          </div>
          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">
            {history.length} Pontos de Restauração
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Clock className="w-10 h-10 text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhum backup interno registrado ainda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <FileJson className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-xs text-slate-800 uppercase tracking-tight">{entry.filename}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end items-center gap-4">
                        <button
                          onClick={() => downloadBackup(entry)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                          <Download className="w-3 h-3" /> Baixar
                        </button>
                        <button
                          onClick={() => restoreFromHistory(entry)}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 hover:bg-slate-950 flex items-center gap-2 active:scale-95"
                        >
                          <RefreshCw className="w-3 h-3" /> Restaurar Este Ponto
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOGICAL DELETIONS (OLD TRASH) */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Lixeira Institucional (Arquivos Removidos)</h3>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">
            {documents.length} Itens em Custódia
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-6 uppercase tracking-widest">Registro / Meta-Data</th>
                <th className="px-8 py-6 uppercase tracking-widest">Descrição do Ativo</th>
                <th className="px-8 py-6 uppercase tracking-widest text-right">Ação Corretiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <FileJson className="w-12 h-12" />
                      <p className="text-sm font-black uppercase tracking-widest">Nenhum rastro de exclusão lógica</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const profile = profiles.find(p => p.id === doc.responsavel_id);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-[10px] text-slate-900 mb-1 uppercase tracking-tighter">#{doc.id.split('-')[0]}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          <Clock className="w-3 h-3" />
                          {doc.deletedAt ? new Date(doc.deletedAt).toLocaleString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-sm text-slate-800 uppercase tracking-tight leading-none mb-1">{doc.titulo}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{doc.document_type}</span>
                          <span className="text-[9px] text-slate-400 font-bold italic">• Autor: {profile?.nome || 'Operador'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => onRestore(doc.id)}
                          className="bg-slate-950 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:bg-emerald-600 flex items-center gap-3 ml-auto active:scale-95"
                        >
                          <RefreshCw className="w-3 h-3" /> Restaurar Ativo
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECURITY NOTE */}
      <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-200">
        <div className="flex gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Protocolo de Segurança Administrativa PNAE</p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Em conformidade com as normas de transparência pública, nenhum dado técnico gerado pelo <strong>NutriAssist</strong> é deletado permanentemente sem registro de auditoria.
              A Central de Backup atua como rastro oficial. Recomendamos a exportação semanal dos dados para armazenamento em mídia física externa ou nuvem governamental, garantindo a continuidade do serviço em caso de falha no dispositivo local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
