import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from './UI/Card';
import { ShieldCheck, Award, Info, Search, SearchSlash } from 'lucide-react';
import { nutritionalDashboardService, CertifiedSchool } from '../services/nutritionalDashboardService';

const PublicTransparencyPanel: React.FC = () => {
    const [certifiedSchools, setCertifiedSchools] = useState<CertifiedSchool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const faqs = [
        {
            q: "O que é o Selo Escola em Conformidade Nutricional?",
            a: "É um reconhecimento oficial às unidades de ensino que mantêm excelência técnica e rigor sanitário no PNAE."
        },
        {
            q: "Como uma escola é certificada?",
            a: "A avaliação é automatizada e considera regularidade de estoque, recebimento técnico e conformidade sanitária."
        }
    ];

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    useEffect(() => {
        const fetchPublicData = async () => {
            setIsLoading(true);
            try {
                const data = await nutritionalDashboardService.getCertifiedSchools();
                setCertifiedSchools(data);
            } catch (err) {
                console.error("Erro ao carregar dados públicos:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPublicData();
    }, []);

    const filtered = certifiedSchools.filter(s =>
        s.escola_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.zona.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando Registros Oficiais...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-12 px-6 animate-in fade-in duration-1000">
            <Helmet>
                <title>Selo Escola em Conformidade | NutriAssist</title>
                <meta name="description" content="Conheça as escolas certificadas pelo NutriAssist em conformidade nutricional e rigor sanitário do PNAE." />
                <link rel="canonical" href="https://nutriassist.gov.br/transparencia-pnae" />

                {/* OG Tags */}
                <meta property="og:title" content="Selo Escola em Conformidade | NutriAssist" />
                <meta property="og:description" content="Conheça as escolas certificadas em conformidade nutricional." />
                <meta property="og:image" content="https://nutriassist.gov.br/header-sme.png" />
                <meta property="og:url" content="https://nutriassist.gov.br/transparencia-pnae" />

                <script type="application/ld+json">
                    {JSON.stringify(faqJsonLd)}
                </script>
            </Helmet>
            {/* HERO SECTION */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">PNAE Compliance Transparência</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                    Selo Escola em Conformidade Nutricional
                </h1>
                <p className="max-w-2xl mx-auto text-slate-500 text-lg leading-relaxed">
                    Reconhecimento oficial às unidades de ensino que mantêm excelência técnica,
                    rigor sanitário e execução integral do cardápio planejado.
                </p>
            </div>

            {/* METODOLOGIA CARD */}
            <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:20,padding:'22px 28px',border:'1px solid rgba(255,255,255,0.06)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',position:'relative',overflow:'hidden'}}>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-tight">Critérios de Certificação</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            A avaliação é 100% automatizada e considera a regularidade do estoque,
                            o recebimento técnico das mercadorias, a ausência de alertas nutricionais críticos
                            e a conformidade do checklist sanitário bimestral.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="text-xs font-black text-slate-500 uppercase mb-1">Validade</p>
                            <p className="text-sm font-bold">60 Dias</p>
                        </div>
                        <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="text-xs font-black text-slate-500 uppercase mb-1">Avaliação</p>
                            <p className="text-sm font-bold">Mensal</p>
                        </div>
                    </div>
                </div>
                <div style={{position:'absolute',top:-60,right:-60,width:180,height:180,background:'rgba(52,211,153,0.07)',borderRadius:'50%',filter:'blur(40px)',pointerEvents:'none'}}></div>
            </div>

            {/* BUSCA */}
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar escola certificada..."
                    style={{width:'100%',background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,paddingLeft:48,paddingRight:20,paddingTop:12,paddingBottom:12,fontSize:14,fontFamily:'inherit',fontWeight:600,color:'#0f172a',outline:'none',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',boxSizing:'border-box'}}
                />
            </div>

            {/* GRID DE ESCOLAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{gap:16}}>
                {filtered.map((school, idx) => (
                    <div key={idx} style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',overflow:'hidden',transition:'all 0.22s ease'}} onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-3px)';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)';el.style.transform='translateY(0)';}}>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Ativo</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight mb-1">{school.escola_nome}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{school.zona}</p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Validade até</p>
                                    <p className="text-xs font-bold text-slate-600">{new Date(school.validade_fim).toLocaleDateString()}</p>
                                </div>
                                <Info className="w-4 h-4 text-slate-200" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{padding:'64px 32px',textAlign:'center',background:'#f8fafc',borderRadius:18,border:'2px dashed #e2e8f0'}}>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <SearchSlash className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Consulta sem resultados</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                            No momento, nenhuma unidade correspondente atende aos pré-requisitos de certificação ativa.
                        </p>
                    </div>
                </div>
            )}

            {/* FOOTER PUBLICO */}
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div className="flex items-center gap-4">
                    <div className="text-2xl">🇧🇷</div>
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">SME - NutriAssist</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Gestão da Merenda de Alta Performance</p>
                    </div>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    Dados atualizados diariamente às 00:00 (Brasília)
                </div>
            </div>
        </div>
    );
};

export default PublicTransparencyPanel;
