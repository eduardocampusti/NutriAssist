
import React, { useState } from 'react';
import { MenuAutomationResult, UserProfile, UserRole } from '../types';
import { automateMenuPlanning } from '../services/geminiService';

interface MenuAutomationProps {
  activeProfile?: UserProfile;
  onResult: (result: MenuAutomationResult) => void;
  onClose: () => void;
}

const MenuAutomation: React.FC<MenuAutomationProps> = ({ activeProfile, onResult, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    input: '',
    numAlunos: 100,
    modalidade: 'Ensino Fundamental I',
    faixaEtaria: '07 a 10 anos',
    turno: 'Integral',
    periodo: 'Mensal (Março/2025)',
    diasLetivos: 22
  });

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.input) return;
    setIsLoading(true);
    try {
      const result = await automateMenuPlanning(
        formData.input,
        formData.numAlunos,
        formData.modalidade,
        formData.faixaEtaria,
        formData.turno,
        formData.periodo,
        formData.diasLetivos
      );
      onResult(result);
    } catch (error) {
      alert("Falha na automação técnica.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-emerald-500 font-black">🤖</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Automação de Cardápios Oficiais</h2>
            <p className="text-slate-500 text-sm font-medium">SME Brotas de Macaúbas • PNAE 2025</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-10 relative overflow-hidden">
        {/* BG DECOR */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-2xl text-[12px] text-emerald-800 leading-relaxed italic relative z-10">
          Este módulo executa o motor de inteligência técnica para gerar o cardápio oficial. Insira as informações da modalidade e os alimentos base; o sistema calculará automaticamente o per capita e a demanda total para o período informado.
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Modalidade de Ensino</label>
              <select
                value={formData.modalidade}
                onChange={e => setFormData({ ...formData, modalidade: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              >
                <option value="Creche">Creche</option>
                <option value="Pré-Escola">Pré-Escola</option>
                <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                <option value="EJA">EJA</option>
                <option value="Ensino Médio">Ensino Médio</option>
                <option value="Educação Integral">Educação Integral</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Número de Alunos</label>
              <input
                type="number"
                value={formData.numAlunos}
                onChange={e => setFormData({ ...formData, numAlunos: Number(e.target.value) })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Dias Letivos</label>
              <input
                type="number"
                value={formData.diasLetivos}
                onChange={e => setFormData({ ...formData, diasLetivos: Number(e.target.value) })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Turno</label>
              <select
                value={formData.turno}
                onChange={e => setFormData({ ...formData, turno: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700"
              >
                <option value="Parcial">Parcial</option>
                <option value="Integral">Integral</option>
                <option value="Noturno">Noturno</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Faixa Etária</label>
              <input
                type="text"
                value={formData.faixaEtaria}
                onChange={e => setFormData({ ...formData, faixaEtaria: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-700"
                placeholder="Ex: 01 a 03 anos"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Período de Vigência</label>
              <input
                type="text"
                value={formData.periodo}
                onChange={e => setFormData({ ...formData, periodo: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-700"
                placeholder="Ex: Abril/2025"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alimentos e Observações do Período</label>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">IA Conectada às Normas FNDE</span>
            </div>
            <textarea
              value={formData.input}
              onChange={e => setFormData({ ...formData, input: e.target.value })}
              placeholder="Ex: Arroz, feijão carioquinha, carne moída, abóbora cabotiá, melancia, biscoito integral (apenas 1x semana)..."
              rows={8}
              className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-8 text-sm font-medium text-slate-700 leading-relaxed focus:ring-4 focus:ring-emerald-500/10 outline-none placeholder:text-slate-300 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.input || !canEdit}
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando Cálculos e Redação...
              </div>
            ) : (
              <>
                Gerar Cardápio Oficial e Quadros de Consumo
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-800 text-center space-y-4">
        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em]">Protocolo de Conformidade Nutricional</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed italic max-w-3xl mx-auto">
          "A automação utiliza os coeficientes nutricionais das Resoluções CD/FNDE nº 06/2020 e 20/2020 para cálculo de gramaturas e frequências. A nutricionista Alexandra Fernandes (RT) deve realizar a validação soberana do resultado antes da impressão final."
        </p>
      </div>
    </div>
  );
};

export default MenuAutomation;
