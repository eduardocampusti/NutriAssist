
import React, { useState } from 'react';
import { StockAnalysisResult, UserProfile, UserRole, School } from '../types';
import { analyzeStockAndConsumption } from '../services/geminiService';

interface StockAutomationProps {
  activeProfile?: UserProfile;
  schools: School[];
  onResult: (result: StockAnalysisResult) => void;
  onClose: () => void;
}

const StockAutomation: React.FC<StockAutomationProps> = ({ activeProfile, schools, onResult, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitName: 'REDE MUNICIPAL - GERAL',
    period: 'Planejamento Mensal',
    numStudents: 100,
    modalidade: 'Ensino Fundamental I',
    menuContext: '',
    rawStockData: '' // Agora usado para observações de estoque atual se houver
  });

  const canEdit = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menuContext || !formData.unitName) return;
    setIsLoading(true);
    try {
      // Injetando modalidade no contexto do menu para a IA
      const enrichedMenu = `MODALIDADE: ${formData.modalidade}\nCARDÁPIO BASE: ${formData.menuContext}`;
      
      const result = await analyzeStockAndConsumption(
        formData.rawStockData || "Não informado (Foco em estimativa preditiva)",
        formData.unitName,
        formData.period,
        formData.numStudents,
        enrichedMenu
      );
      onResult(result);
    } catch (error) {
      alert("Falha na análise técnica de planejamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-blue-500 font-black">📊</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Planejamento de Estoque e Consumo</h2>
            <p className="text-slate-500 text-sm font-medium">Estimativa Licitatória • SME Brotas de Macaúbas</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-10 relative overflow-hidden">
        {/* BG DECOR */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl text-[12px] text-blue-800 leading-relaxed italic relative z-10">
           Este módulo gera o **Relatório Técnico de Estimativa de Consumo**. Insira o cardápio e o número de alunos para que a IA calcule automaticamente os quantitativos necessários para o processo de compra do PNAE.
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Unidade / Escopo</label>
              <select 
                value={formData.unitName}
                onChange={e => setFormData({...formData, unitName: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none"
                required
              >
                <option value="REDE MUNICIPAL - GERAL">REDE MUNICIPAL (GERAL)</option>
                {schools.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Alunos Atendidos</label>
              <input 
                type="number" 
                value={formData.numStudents}
                onChange={e => setFormData({...formData, numStudents: Number(e.target.value)})}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Modalidade</label>
              <select 
                value={formData.modalidade}
                onChange={e => setFormData({...formData, modalidade: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700"
              >
                <option value="Creche">Creche</option>
                <option value="Pré-Escola">Pré-Escola</option>
                <option value="Ensino Fundamental">Ensino Fundamental</option>
                <option value="Educação Especial">Educação Especial</option>
                <option value="Tempo Integral">Tempo Integral</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Cardápio de Referência para Cálculo</label>
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Base de Estimativa</span>
            </div>
            <textarea 
              value={formData.menuContext}
              onChange={e => setFormData({...formData, menuContext: e.target.value})}
              placeholder="Ex: Arroz (15g), Feijão (10g), Peito de Frango (80g), Salada de Tomate (30g), Melancia (100g)..."
              rows={6}
              className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-sm font-medium text-slate-700 leading-relaxed focus:ring-4 focus:ring-blue-500/10 outline-none placeholder:text-slate-300 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest px-1">Observações Adicionais / Estoque Atual</label>
            <textarea 
              value={formData.rawStockData}
              onChange={e => setFormData({...formData, rawStockData: e.target.value})}
              placeholder="Ex: Considerar saldo de 50kg de arroz já em estoque. Priorizar itens da Agricultura Familiar."
              rows={3}
              className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 text-sm font-medium text-slate-700"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || !formData.menuContext || !canEdit}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando Inteligência Licitatória...
              </div>
            ) : (
              <>
                Gerar Relatório Técnico de Quantitativos
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-800 text-center space-y-4">
         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Protocolo de Suporte à Licitação</h4>
         <p className="text-[11px] text-slate-400 leading-relaxed italic max-w-3xl mx-auto">
           "Este relatório não substitui o controle físico de almoxarifado, servindo como base técnica de projeção para fins de aquisição pública. A responsabilidade pela conferência final dos quantitativos antes da publicação de editais é da RT Alexandra Fernandes."
         </p>
      </div>
    </div>
  );
};

export default StockAutomation;
