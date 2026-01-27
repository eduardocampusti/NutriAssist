
import React, { useState } from 'react';
import { DocumentTypeConfig, DocumentCategory } from '../types';

interface DocumentTypeManagerProps {
  types: DocumentTypeConfig[];
  onAdd: (type: Omit<DocumentTypeConfig, 'id'>) => void;
  onToggle: (id: string) => void;
  onClose: () => void;
}

const DocumentTypeManager: React.FC<DocumentTypeManagerProps> = ({ types, onAdd, onToggle, onClose }) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.RELATORIO);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;
    onAdd({ 
      label, 
      category, 
      description, 
      active: true 
    });
    setLabel('');
    setDescription('');
  };

  const getCategoryStyle = (cat: DocumentCategory) => {
    switch (cat) {
      case DocumentCategory.OFICIO: return 'bg-purple-100 text-purple-700 border-purple-200';
      case DocumentCategory.PARECER: return 'bg-amber-100 text-amber-700 border-amber-200';
      case DocumentCategory.RELATORIO: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-emerald-500">📋</span> Tipos de Documentos Oficiais
          </h2>
          <p className="text-slate-500 text-sm">Defina a nomenclatura e categoria técnica dos atos da rede</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>⚙️</span> Configurar Novo Tipo
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nome de Exibição</label>
              <input 
                type="text" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Resposta de Ouvidoria"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">Categoria Base (BD)</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {Object.values(DocumentCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">Descrição Curta</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Finalidade deste tipo de documento..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-all text-sm shadow-md"
            >
              Salvar Tipo de Documento
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Nome do Documento</th>
                <th className="px-6 py-4">Categoria Técnica</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum tipo de documento configurado. O sistema usará os padrões do PNAE.
                  </td>
                </tr>
              ) : (
                types.map((type) => (
                  <tr key={type.id} className={`hover:bg-slate-50/50 transition-colors ${!type.active ? 'opacity-40' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-slate-800">{type.label}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${getCategoryStyle(type.category)}`}>
                        {type.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-xs">{type.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onToggle(type.id)}
                        className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                          type.active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                      >
                        {type.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentTypeManager;
