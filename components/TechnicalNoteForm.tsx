import React, { useState, useEffect } from 'react';
import { StructuredContext, School, UserProfile, DocumentTypeConfig, DocumentCategory, UserRole } from '../types';
import { Sparkles, FileText, LayoutDashboard, BookOpen, Shield, Check } from 'lucide-react';

interface TechnicalNoteFormProps {
  onSubmit: (type: string, category: DocumentCategory, context: string | StructuredContext, details: string) => void;
  isLoading: boolean;
  schools: School[];
  docTypes: DocumentTypeConfig[];
  activeProfile?: UserProfile;
}

const TechnicalNoteForm: React.FC<TechnicalNoteFormProps> = ({ onSubmit, isLoading, schools, docTypes, activeProfile }) => {
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [context, setContext] = useState('');
  const [details, setDetails] = useState('');

  const activeDocTypes = docTypes.filter(t => t.active);
  const canInsertDocument = activeProfile?.role === UserRole.NUTRICIONISTA || activeProfile?.role === UserRole.ADMIN;

  useEffect(() => {
    if (activeDocTypes.length > 0 && !selectedTypeId) {
      const defaultTR = activeDocTypes.find(t => t.category === 'TERMO_REFERENCIA');
      setSelectedTypeId(defaultTR ? defaultTR.id : activeDocTypes[0].id);
    }
  }, [activeDocTypes, selectedTypeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInsertDocument) return;

    const docType = activeDocTypes.find(t => t.id === selectedTypeId);
    if (!docType || !context) return;

    const school = schools.find(s => s.id === selectedSchoolId);
    const fullContext: StructuredContext = {
      contexto: context,
      escola: school?.nome,
      autor_perfil: activeProfile?.nome,
    };

    onSubmit(docType.label, docType.category, fullContext, details);
  };

  return (
    <div className="page-transition max-w-5xl mx-auto pb-20 px-4">
      <div className="glass-card rounded-[48px] soft-shadow border border-white/40 p-10 lg:p-16 relative overflow-hidden bg-white/80 backdrop-blur-xl">

        {/* DECORATION */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>

        <header className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Sparkles size={20} />
              </div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">IA Redação Técnica v2.0</p>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              Redator <span className="text-emerald-600">Técnico Nutricional.</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-xl text-lg lg:text-xl">
              Escreva livremente suas notas. Nossa IA cuidará da padronização técnica, legal e gramatical.
            </p>
          </div>

          <div className="bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50 flex items-center gap-2">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Modo Escritório Virtual
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className={`relative z-10 space-y-10 ${(!canInsertDocument || isLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                <FileText size={14} className="text-emerald-500" />
                Tipo de Documento Técnico
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-emerald-500/30"
                disabled={isLoading}
              >
                {activeDocTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-medium px-2">
                {activeDocTypes.find(t => t.id === selectedTypeId)?.description}
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                <LayoutDashboard size={14} className="text-emerald-500" />
                Unidade / Destino
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all hover:border-emerald-500/30"
                disabled={isLoading}
              >
                <option value="">REDE MUNICIPAL - GERAL (SME)</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-medium px-2">
                O cabeçalho do documento será ajustado conforme o destino.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Área de Escrita Livre (Rascunho)
              </label>
              <div className="flex gap-4">
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                  Padronização PNAE
                </span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                  Lei 14.133 Ativa
                </span>
              </div>
            </div>

            <div className="relative group">
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Exemplo de escrita livre:&#10;Cardápio semanal de 6 a 10 anos, almoço: arroz, feijão, frango e salada. Precisa de adequação térmica e lista de ingredientes conforme PNAE."
                rows={12}
                className="w-full bg-slate-900 border-none rounded-[40px] px-10 py-12 text-base font-medium text-emerald-50 leading-relaxed focus:ring-8 focus:ring-emerald-500/5 outline-none placeholder:text-slate-600 shadow-inner group-hover:bg-slate-800 transition-colors"
                required
                disabled={isLoading}
              />
              <div className="absolute top-4 right-10 text-[10px] font-black text-emerald-500/30 uppercase tracking-[0.2em] pointer-events-none">
                Technical Redactor Engine
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Notas Suplementares / Legislação Específica</label>
            <div className="relative">
              <input
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ex: Ref. Resolução 06/2020 FNDE, Portaria Interministerial nº..."
                className="w-full bg-slate-100/80 border-none rounded-2xl px-8 py-5 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                disabled={isLoading}
              />
              <BookOpen size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>

          <div className="pt-12 flex flex-col lg:flex-row items-center gap-10 border-t border-slate-100">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-600" />
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Responsabilidade Técnica</p>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                O conteúdo gerado pela IA requer validação criteriosa pelo nutricionista (RT).
                A assinatura digital e o CRN serão exigidos na etapa final de homologação.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !context}
              className="w-full lg:w-auto min-w-[320px] bg-slate-900 hover:bg-emerald-600 text-white px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-emerald-500/20 transition-all duration-500 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-5 group relative overflow-hidden"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-emerald-600 flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              <span className="relative z-10 flex items-center gap-3">
                Transformar em Documento Oficial
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Check size={14} /> Padrão ANVISA
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Check size={14} /> Compliance PNAE
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Check size={14} /> Normas CFN
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Check size={14} /> Lei 14.133/21
        </div>
      </div>
    </div>
  );
};

export default TechnicalNoteForm;