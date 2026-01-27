
import React, { useState } from 'react';
import { School, UserRole, UserProfile, GeneratedContent, DocumentCategory } from '../types';
import { generateInstitutionalReport } from '../services/geminiService';

interface InstitutionalReportManagerProps {
  schools: School[];
  activeProfile?: UserProfile;
  letterhead: any;
  onResult: (result: GeneratedContent, category: DocumentCategory) => Promise<void>;
  onClose: () => void;
}

const InstitutionalReportManager: React.FC<InstitutionalReportManagerProps> = ({ schools, activeProfile, letterhead, onResult, onClose }) => {
  /* TOAST NOTIFICATION */
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<'MONTHLY' | 'STOCK' | 'SPECIAL' | 'PROCUREMENT'>('MONTHLY');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [period, setPeriod] = useState('');
  const [notes, setNotes] = useState('');

  const canGenerate = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!period) return;

    setIsLoading(true);
    try {
      const school = schools.find(s => s.id === selectedSchoolId);
      const data = { period, notes, timestamp: Date.now() };
      const categoryMap = {
        MONTHLY: DocumentCategory.MENSAL,
        STOCK: DocumentCategory.ESTOQUE,
        SPECIAL: DocumentCategory.SAUDE,
        PROCUREMENT: DocumentCategory.LICITACAO
      };

      const result = await generateInstitutionalReport(reportType, data, school, letterhead);
      showNotification("Relatório consolidado com sucesso! Redirecionando...", 'success');
      setTimeout(async () => {
        await onResult(result, categoryMap[reportType]);
      }, 1000); // Small delay to show success
    } catch (e) {
      console.error(e);
      showNotification("Falha na consolidação. Verifique a chave API ou a conexão.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20 relative">
      {/* TOAST */}
      {notification && (
        <div className={`fixed top-10 right-10 z-[9999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
          <div className="text-2xl">{notification.type === 'success' ? '✅' : '⚠️'}</div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wide">{notification.type === 'success' ? 'Sucesso' : 'Erro'}</h4>
            <p className="text-xs font-medium">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="ml-4 text-white/50 hover:text-white">✕</button>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg font-black border border-emerald-600">📊</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Relatórios Institucionais</h2>
            <p className="text-slate-500 text-sm font-medium italic">Consolidação e Prestação de Contas • {letterhead.municipio}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SELEÇÃO DO TIPO DE RELATÓRIO */}
        <div className="lg:col-span-4 space-y-4">
          {[
            { id: 'MONTHLY', label: 'Relatório Mensal', desc: 'Atendimento, dias letivos e cardápio executado.', icon: '🗓️' },
            { id: 'STOCK', label: 'Estoque e Consumo', desc: 'Balanço de saldos, itens críticos e consumo médio.', icon: '📦' },
            { id: 'SPECIAL', label: 'Necessidades Especiais', desc: 'Censo de restrições e impacto logístico.', icon: '❤️' },
            { id: 'PROCUREMENT', label: 'Base para Licitação', desc: 'Projeção de compra e especificações técnicas.', icon: '📑' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as any)}
              className={`w-full text-left p-5 rounded-[32px] border transition-all flex gap-4 ${reportType === type.id ? 'bg-emerald-900 border-emerald-900 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'}`}
            >
              <span className="text-2xl">{type.icon}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{type.label}</p>
                <p className={`text-[10px] leading-tight mt-1 ${reportType === type.id ? 'text-emerald-100' : 'text-slate-400'}`}>{type.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* PARÂMETROS E GERAÇÃO */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">Configuração do Documento</h3>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Unidade Escolar / Filtro</label>
                <select
                  value={selectedSchoolId}
                  onChange={e => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">REDE MUNICIPAL (GERAL)</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Mês / Período de Referência</label>
                <input
                  type="text"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  placeholder="Ex: Março de 2025"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase block">Observações Técnicas / Memória Operacional</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Descreva aqui os fatos ocorridos no período, dificuldades de entrega, substituições de última hora ou destaques da vigilância sanitária."
                rows={6}
                className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-xs font-medium text-slate-700 leading-relaxed outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !canGenerate}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Consolidando Dados via IA...
                </div>
              ) : (
                <>
                  Gerar Relatório Oficial para Impressão
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Orientações de Prestação de Contas:</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Estes documentos são formatados para compor o processo de prestação de contas mensal da Secretaria. Garanta que as informações de estoque e consumo coincidam com os mapas de controle físico das unidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalReportManager;
