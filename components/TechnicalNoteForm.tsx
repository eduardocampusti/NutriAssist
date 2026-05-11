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
      <div style={{background:'#fff',borderRadius:22,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'28px 32px',position:'relative',overflow:'hidden'}}>

        {/* DECORATION */}
        <div style={{position:'absolute',top:-80,right:-80,width:260,height:260,background:'rgba(5,150,105,0.06)',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none'}}></div>
        <div style={{position:'absolute',bottom:-60,left:-60,width:200,height:200,background:'rgba(100,116,139,0.04)',borderRadius:'50%',filter:'blur(50px)',pointerEvents:'none'}}></div>

        <header className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div style={{width:40,height:40,background:'linear-gradient(135deg,#059669,#15803d)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:'0 4px 14px rgba(5,150,105,0.35)',flexShrink:0}}>
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

          <div style={{background:'#f0fdf4',padding:'6px 8px',borderRadius:12,border:'1px solid #bbf7d0',display:'flex',alignItems:'center',gap:8}}>
            <div style={{padding:'5px 12px',background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.07)',fontSize:9.5,fontWeight:800,color:'#059669',textTransform:'uppercase',letterSpacing:'0.08em'}}>
              Modo Escritório Virtual
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className={`relative z-10 space-y-10 ${(!canInsertDocument || isLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,background:'#f8fafc',padding:'18px 20px',borderRadius:16,border:'1px solid #f1f5f9',marginBottom:0}}>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                <FileText size={14} className="text-emerald-500" />
                Tipo de Documento Técnico
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                style={{width:'100%',background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'9px 14px',fontSize:13,fontFamily:'inherit',fontWeight:600,color:'#0f172a',outline:'none',cursor:'pointer',boxSizing:'border-box'}}
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
                style={{width:'100%',background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'9px 14px',fontSize:13,fontFamily:'inherit',fontWeight:600,color:'#0f172a',outline:'none',cursor:'pointer',boxSizing:'border-box'}}
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
                style={{width:'100%',background:'#0f172a',border:'none',borderRadius:16,padding:'20px 24px',fontSize:14,fontFamily:'inherit',fontWeight:500,color:'#d1fae5',lineHeight:1.7,outline:'none',resize:'vertical',boxSizing:'border-box',boxShadow:'inset 0 2px 8px rgba(0,0,0,0.15)'}}
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
                style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'10px 16px',fontSize:13,fontFamily:'inherit',fontWeight:600,color:'#0f172a',outline:'none',boxSizing:'border-box'}}
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
              style={{width:'100%',maxWidth:360,background:'linear-gradient(135deg,#059669,#15803d)',color:'#fff',padding:'13px 28px',borderRadius:13,border:'none',fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer',boxShadow:'0 6px 20px rgba(5,150,105,0.4)',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:(!context||isLoading)?0.4:1}} disabled={isLoading||!context}
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

      <div style={{marginTop:20,display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9.5,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',padding:'4px 12px',background:'#f8fafc',borderRadius:99,border:'1px solid #f1f5f9'}}>
          <Check size={14} /> Padrão ANVISA
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9.5,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',padding:'4px 12px',background:'#f8fafc',borderRadius:99,border:'1px solid #f1f5f9'}}>
          <Check size={14} /> Compliance PNAE
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9.5,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',padding:'4px 12px',background:'#f8fafc',borderRadius:99,border:'1px solid #f1f5f9'}}>
          <Check size={14} /> Normas CFN
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9.5,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',padding:'4px 12px',background:'#f8fafc',borderRadius:99,border:'1px solid #f1f5f9'}}>
          <Check size={14} /> Lei 14.133/21
        </div>
      </div>
    </div>
  );
};

export default TechnicalNoteForm;