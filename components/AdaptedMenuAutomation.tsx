
import React, { useState } from 'react';
import { MenuAdaptedResult, UserProfile, UserRole } from '../types';
import { generateAdaptedMenu } from '../services/geminiService';

interface AdaptedMenuAutomationProps {
  activeProfile?: UserProfile;
  inventory: any[];
  onResult: (result: MenuAdaptedResult) => void;
  onClose: () => void;
}

const AdaptedMenuAutomation: React.FC<AdaptedMenuAutomationProps> = ({ activeProfile, inventory, onResult, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    baseMenu: '',
    specialNeeds: 'Seletividade Alimentar (TEA)',
    characteristics: '',
    numAlunos: 1,
    modalidade: 'Ensino Fundamental I',
    faixaEtaria: '07 a 10 anos',
    periodo: 'Semanal'
  });

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.baseMenu || !formData.characteristics) return;
    setIsLoading(true);
    try {
      const result = await generateAdaptedMenu(
        formData.baseMenu.split('\n'), // baseMenu as array
        "Aluno NE",
        formData.specialNeeds,
        formData.characteristics,
        inventory
      );
      onResult(result);
    } catch (error) {
      alert("Falha na adaptação técnica.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-rose-500 font-black">🧩</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Automação de Cardápio Especial</h2>
            <p className="text-slate-500 text-sm font-medium">Atendimento Diferenciado • SME Brotas de Macaúbas</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-10 relative overflow-hidden">
        {/* BG DECOR */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

        <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl text-[12px] text-rose-800 leading-relaxed italic relative z-10">
          Este módulo executa a inteligência de substituição nutricional segura. Insira o cardápio regular e os detalhes das restrições; o sistema gerará a versão adaptada com as devidas justificativas técnicas prontas para impressão.
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Tipo de Restrição</label>
              <select
                value={formData.specialNeeds}
                onChange={e => setFormData({ ...formData, specialNeeds: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-rose-500/10 outline-none"
              >
                <option value="Seletividade Alimentar (TEA)">TEA / Seletividade</option>
                <option value="Intolerância à Lactose">Intol. à Lactose</option>
                <option value="Alergia Alimentar (APLV, Ovos, etc)">Alergia Alimentar</option>
                <option value="Diabetes / Restrição de Açúcar">Diabetes / Açúcar</option>
                <option value="Doença Celíaca (Glúten)">Doença Celíaca</option>
                <option value="Fenilcetonúria / Outras Inatas">Erros Inatos</option>
                <option value="Outra (Descrever nas Notas)">Outras Restrições</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Período</label>
              <select
                value={formData.periodo}
                onChange={e => setFormData({ ...formData, periodo: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700"
              >
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
                <option value="Eventual / Substituição Única">Eventual</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Alunos Atendidos</label>
              <input
                type="number"
                value={formData.numAlunos}
                onChange={e => setFormData({ ...formData, numAlunos: Number(e.target.value) })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Modalidade</label>
              <select
                value={formData.modalidade}
                onChange={e => setFormData({ ...formData, modalidade: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700"
              >
                <option value="Creche">Creche</option>
                <option value="Pré-Escola">Pré-Escola</option>
                <option value="Ensino Fundamental">Fundamental</option>
                <option value="Tempo Integral">Integral</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cardápio Regular de Referência</label>
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Base para Substituição</span>
            </div>
            <textarea
              value={formData.baseMenu}
              onChange={e => setFormData({ ...formData, baseMenu: e.target.value })}
              placeholder="Copie aqui o cardápio padrão que será servido às outras crianças..."
              rows={4}
              className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-sm font-medium text-slate-700 leading-relaxed focus:ring-4 focus:ring-rose-500/10 outline-none placeholder:text-slate-300 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Características / Observações do Aluno</label>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Garantia Sensorial e Nutricional</span>
            </div>
            <textarea
              value={formData.characteristics}
              onChange={e => setFormData({ ...formData, characteristics: e.target.value })}
              placeholder="Ex: Aluno TEA com forte rejeição a texturas pastosas e cor amarela. Requer alimentos crocantes e cores variadas..."
              rows={4}
              className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-sm font-medium text-slate-700 leading-relaxed focus:ring-4 focus:ring-rose-500/10 outline-none placeholder:text-slate-300 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.baseMenu || !canEdit}
            className="w-full bg-slate-900 hover:bg-rose-600 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando Adaptação Nutricional...
              </div>
            ) : (
              <>
                Gerar Cardápio Especial e Justificativa
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-800 text-center space-y-4">
        <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em]">Protocolo de Segurança Alimentar (PNAE)</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed italic max-w-3xl mx-auto">
          "Toda substituição proposta pela IA deve respeitar a equivalência de macronutrientes. Alunos com laudo médico para alergias severas devem ter suas preparações realizadas em utensílios exclusivos para evitar contaminação cruzada. A RT Alexandra Fernandes validará o documento final."
        </p>
      </div>
    </div>
  );
};

export default AdaptedMenuAutomation;
