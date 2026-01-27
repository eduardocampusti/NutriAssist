
import React, { useState } from 'react';
import { MonthlyReportResult, UserProfile, UserRole } from '../types';
import { generateMonthlyManagementReport } from '../services/geminiService';

interface MonthlyReportAutomationProps {
  activeProfile?: UserProfile;
  onResult: (result: MonthlyReportResult) => void;
  onClose: () => void;
}

const MonthlyReportAutomation: React.FC<MonthlyReportAutomationProps> = ({ activeProfile, onResult, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    period: '',
    modalities: 'Todas (Infantil ao EJA)',
    totalStudents: 0,
    specialMenusCount: 0,
    menuContext: '',
    stockInfo: '',
    projections: '',
    technicalNotes: ''
  });

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.period || !formData.menuContext) return;
    setIsLoading(true);
    try {
      const result = await generateMonthlyManagementReport(
        formData.period,
        formData.modalities,
        formData.totalStudents,
        formData.specialMenusCount,
        formData.menuContext,
        formData.stockInfo,
        formData.projections,
        formData.technicalNotes
      );
      onResult(result);
    } catch (error) {
      alert("Falha na consolidação do relatório mensal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg border border-slate-700 font-black">🏢</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Relatório Mensal e Base Licitatória</h2>
            <p className="text-slate-500 text-sm">Consolidação e Planejamento PNAE - Brotas de Macaúbas/BA</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-8">
        <div className="bg-slate-50 border-l-4 border-slate-900 p-4 text-[11px] text-slate-700 leading-relaxed italic">
           Este motor de inteligência consolida a execução mensal e fundamenta tecnicamente os processos de licitação e chamada pública. Os dados serão formatados em 6 seções conforme exigência institucional.
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Período (Mês/Ano)</label>
              <input 
                type="text" 
                value={formData.period}
                onChange={e => setFormData({...formData, period: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Ex: Março/2025"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Alunos Atendidos</label>
              <input 
                type="number" 
                value={formData.totalStudents}
                onChange={e => setFormData({...formData, totalStudents: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-rose-600 uppercase mb-1 block">Cardápios Especiais</label>
              <input 
                type="number" 
                value={formData.specialMenusCount}
                onChange={e => setFormData({...formData, specialMenusCount: Number(e.target.value)})}
                className="w-full bg-rose-50 border border-rose-100 rounded-lg px-4 py-2 text-sm font-bold text-rose-700 outline-none"
                placeholder="Qtd. Diários"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Modalidades</label>
              <input 
                type="text" 
                value={formData.modalities}
                onChange={e => setFormData({...formData, modalities: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block font-mono">Cardápios Executados e Aceitabilidade</label>
              <textarea 
                value={formData.menuContext}
                onChange={e => setFormData({...formData, menuContext: e.target.value})}
                placeholder="Descreva as preparações servidas e como foi a aceitação pelos alunos."
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-slate-500/5 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block font-mono">Status do Estoque e Logística</label>
              <textarea 
                value={formData.stockInfo}
                onChange={e => setFormData({...formData, stockInfo: e.target.value})}
                placeholder="Descreva o saldo atual de gêneros e observações de entrega."
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-slate-500/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block font-mono">Necessidades para Licitação/AF</label>
              <textarea 
                value={formData.projections}
                onChange={e => setFormData({...formData, projections: e.target.value})}
                placeholder="Liste alimentos e quantitativos sugeridos para o próximo processo de compra."
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block font-mono">Justificativas Técnicas e Finais</label>
              <textarea 
                value={formData.technicalNotes}
                onChange={e => setFormData({...formData, technicalNotes: e.target.value})}
                placeholder="Acrescente pareceres sobre conformidade PNAE e recomendações."
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-slate-500/5 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading || !canEdit}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-black disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                Redigindo Relatório Oficial...
              </>
            ) : 'Gerar Relatório Mensal e Base Licitatória'}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-700">
         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Garantia de Legalidade e Transparência</h4>
         <p className="text-[11px] text-slate-400 leading-relaxed italic">
           "Este relatório visa consolidar a rastro técnico para o FNDE e TCE, assegurando que o planejamento de compras da Secretaria de Educação esteja amparado por dados reais de consumo e necessidades nutricionais específicas da rede municipal."
         </p>
      </div>
    </div>
  );
};

export default MonthlyReportAutomation;
