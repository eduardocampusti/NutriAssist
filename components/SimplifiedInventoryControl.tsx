import React, { useState } from 'react';
import { UserProfile, UserRole, GeneratedContent, School, DocStatus } from '../types';
import { generateSimplifiedInventoryReport } from '../services/geminiService';
import { generateId } from '../utils/id';

interface InventoryEntry {
  id: string;
  nome: string;
  unidade: string;
  inicial: number;
  entradas: number;
  saidas: number;
}

interface SimplifiedInventoryControlProps {
  activeProfile?: UserProfile;
  schools: School[];
  onResult: (result: GeneratedContent) => void;
  onClose: () => void;
}

const SimplifiedInventoryControl: React.FC<SimplifiedInventoryControlProps> = ({ activeProfile, schools, onResult, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [unitName, setUnitName] = useState('DEPÓSITO CENTRAL - SEMED');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [items, setItems] = useState<InventoryEntry[]>([
    { id: '1', nome: 'Arroz Agulhinha T1', unidade: 'KG', inicial: 100, entradas: 50, saidas: 80 },
    { id: '2', nome: 'Feijão Carioca', unidade: 'KG', inicial: 60, entradas: 0, saidas: 55 },
  ]);

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const addItem = () => {
    const newItem: InventoryEntry = {
      id: generateId(),
      nome: '',
      unidade: 'KG',
      inicial: 0,
      entradas: 0,
      saidas: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InventoryEntry, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);
    try {
      const result = await generateSimplifiedInventoryReport(items, unitName, technicalNotes);
      onResult(result);
    } catch (error) {
      alert("Falha na geração do relatório de estoque.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-700 font-black">📦</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Controle de Estoque Simplificado</h2>
            <p className="text-slate-500 text-sm font-medium italic">Gestão de Movimentação Manual • SME Brotas de Macaúbas</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-8">
        <div className="bg-slate-50 border-l-4 border-slate-800 p-6 rounded-r-2xl text-[12px] text-slate-600 leading-relaxed italic">
           Este módulo permite o registro manual da movimentação de gêneros. Insira os saldos iniciais e as movimentações do período para que a IA gere o relatório institucional de status de estoque e alertas críticos.
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unidade Escolar / Local</label>
              <select 
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none"
              >
                <option value="DEPÓSITO CENTRAL - SEMED">DEPÓSITO CENTRAL (SEMED)</option>
                {schools.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notas da Nutricionista (Opcional)</label>
               <input 
                 type="text" 
                 value={technicalNotes}
                 onChange={e => setTechnicalNotes(e.target.value)}
                 className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm"
                 placeholder="Ex: Considerar atraso na entrega do fornecedor de hortifruti."
               />
            </div>
          </div>

          <div className="bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100">
             <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                   <tr className="text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4">Nome do Alimento</th>
                      <th className="px-6 py-4 text-center">Unid.</th>
                      <th className="px-6 py-4 text-center">Inicial</th>
                      <th className="px-6 py-4 text-center">Entradas</th>
                      <th className="px-6 py-4 text-center">Saídas</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                   {items.map(item => (
                     <tr key={item.id} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3">
                           <input 
                             type="text" 
                             value={item.nome}
                             onChange={e => updateItem(item.id, 'nome', e.target.value)}
                             className="w-full bg-transparent border-none text-xs font-bold text-slate-800 focus:ring-0"
                             placeholder="Ex: Arroz T1"
                           />
                        </td>
                        <td className="px-4 py-3 text-center">
                           <select 
                             value={item.unidade}
                             onChange={e => updateItem(item.id, 'unidade', e.target.value)}
                             className="bg-transparent border-none text-[10px] font-black focus:ring-0 mx-auto block"
                           >
                              <option value="KG">KG</option>
                              <option value="L">L</option>
                              <option value="UN">UN</option>
                              <option value="PCT">PCT</option>
                           </select>
                        </td>
                        <td className="px-4 py-3">
                           <input 
                             type="number" 
                             value={item.inicial}
                             onChange={e => updateItem(item.id, 'inicial', Number(e.target.value))}
                             className="w-16 mx-auto block bg-slate-100/50 border-none rounded-lg py-1.5 text-center text-xs font-bold"
                           />
                        </td>
                        <td className="px-4 py-3">
                           <input 
                             type="number" 
                             value={item.entradas}
                             onChange={e => updateItem(item.id, 'entradas', Number(e.target.value))}
                             className="w-16 mx-auto block bg-emerald-50 border-none rounded-lg py-1.5 text-center text-xs font-bold text-emerald-700"
                           />
                        </td>
                        <td className="px-4 py-3">
                           <input 
                             type="number" 
                             value={item.saidas}
                             onChange={e => updateItem(item.id, 'saidas', Number(e.target.value))}
                             className="w-16 mx-auto block bg-rose-50 border-none rounded-lg py-1.5 text-center text-xs font-bold text-rose-700"
                           />
                        </td>
                        <td className="px-4 py-3 text-right">
                           <button 
                             type="button"
                             onClick={() => removeItem(item.id)}
                             className="text-slate-300 hover:text-red-500 transition-colors"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             <button 
              type="button"
              onClick={addItem}
              className="w-full py-4 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
             >
               <span>➕</span> Adicionar Alimento à Tabela
             </button>
          </div>

          <button 
            type="submit"
            disabled={isLoading || items.length === 0 || !canEdit}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Consolidando Movimentação...
              </div>
            ) : (
              <>
                Gerar Relatório de Estoque Institucional
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-800 text-center space-y-4">
         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocolo de Gestão de Almoxarifado</h4>
         <p className="text-[11px] text-slate-500 leading-relaxed italic max-w-3xl mx-auto">
           "Este módulo opera em formato de apoio gerencial simplificado. Os dados aqui processados visam auxiliar o monitoramento visual e documental da RT Alexandra Fernandes, não substituindo as obrigações de registro em sistemas contábeis oficiais da Prefeitura Municipal."
         </p>
      </div>
    </div>
  );
};

export default SimplifiedInventoryControl;
