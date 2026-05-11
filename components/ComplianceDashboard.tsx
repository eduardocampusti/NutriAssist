import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    Target,
    Calendar,
    Users,
    Building2,
    ChevronRight,
    Download,
    LayoutGrid,
    List as ListIcon,
    Info,
    Truck
} from 'lucide-react';
import { complianceService } from '../services/complianceService';
import { ComplianceReport, UserRole } from '../types';

const ComplianceDashboard: React.FC = () => {
    const [reports, setReports] = useState<ComplianceReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [filterZona, setFilterZona] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [month, filterZona]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await complianceService.getRanking(month, filterZona === 'all' ? undefined : filterZona);
            setReports(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        r.escola?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        alta: reports.filter(r => r.status === 'ALTA').length,
        atencao: reports.filter(r => r.status === 'ATENCAO').length,
        risco: reports.filter(r => r.status === 'RISCO').length,
        media: reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.score_geral, 0) / reports.length) : 0
    };

    return (
        <div className="page-transition min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-10">

            {/* INSTITUTIONAL HEADER */}
            <div style={{background:'#fff',borderRadius:20,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08),0 20px 40px rgba(0,0,0,0.06)',padding:'20px 24px',display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:0,position:'relative',overflow:'hidden'}}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div style={{width:42,height:42,background:'linear-gradient(135deg,#4f46e5,#6d28d9)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(79,70,229,0.35)',flexShrink:0}}>
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Painel de Conformidade</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">NutriAssist SME • Monitoramento de Governança e Risco</p>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium max-w-xl">
                        Avaliação automatizada do nível de compliance administrativo, nutricional e operacional das unidades escolares de Brotas de Macaúbas.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10 w-full lg:w-auto">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setViewType('grid')}
                            className={`p-3 rounded-xl transition-all ${viewType === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewType('list')}
                            className={`p-3 rounded-xl transition-all ${viewType === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
                        <Calendar size={18} className="text-indigo-600" />
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="bg-transparent border-none text-xs font-black uppercase text-slate-700 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* KPI TICKER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Score Médio da Rede', val: stats.media + '%', icon: Target, color: 'bg-indigo-600', trend: stats.media > 80 ? 'Up' : 'Stable' },
                    { label: 'Conformidade Alta', val: stats.alta, icon: CheckCircle2, color: 'bg-emerald-500', sub: 'Unidades Regulares' },
                    { label: 'Atenção Necessária', val: stats.atencao, icon: AlertTriangle, color: 'bg-amber-500', sub: 'Inconsistências Leves' },
                    { label: 'Risco Administrativo', val: stats.risco, icon: TrendingDown, color: 'bg-rose-500', sub: 'Ação Imediata SME' }
                ].map((kpi, i) => (
                    <div key={i} style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)',padding:'18px 20px',display:'flex',alignItems:'center',gap:16,transition:'all 0.22s ease',cursor:'default'}} onMouseEnter={e=>{const el=e.currentTarget;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08),0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-3px)';}} onMouseLeave={e=>{const el=e.currentTarget;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)';el.style.transform='translateY(0)';}}>
                        <div style={{width:44,height:44,background:kpi.color.replace('bg-','').replace('indigo-600','linear-gradient(135deg,#4f46e5,#6d28d9)').replace('emerald-500','linear-gradient(135deg,#059669,#15803d)').replace('amber-500','linear-gradient(135deg,#d97706,#b45309)').replace('rose-500','linear-gradient(135deg,#f43f5e,#be123c)'),borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 4px 14px rgba(0,0,0,0.18)'}}>
                            <kpi.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none mt-1">{kpi.val}</h3>
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{kpi.sub || 'Monitoramento Ativo'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTERS & RANKING */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div style={{position:'relative',width:'100%',maxWidth:360}}>
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar Escola ou Unidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{width:'100%',paddingLeft:44,paddingRight:20,paddingTop:10,paddingBottom:10,background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,fontSize:14,fontFamily:'inherit',outline:'none',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            value={filterZona}
                            onChange={(e) => setFilterZona(e.target.value)}
                            className="px-6 py-5 bg-white border border-slate-100 rounded-3xl text-xs font-black uppercase tracking-widest text-slate-600 appearance-none shadow-sm min-w-[180px]"
                        >
                            <option value="all">Todas as Zonas</option>
                            <option value="SEDE">Sede Urbana</option>
                            <option value="RURAL">Zona Rural</option>
                            <option value="COCAL">Região Cocal</option>
                        </select>
                        <button className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Calculando Scores em Tempo Real...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="p-20 bg-white rounded-[48px] border border-dashed border-slate-200 text-center space-y-4">
                        <Info className="mx-auto text-slate-300" size={48} />
                        <p className="text-slate-500 font-bold uppercase text-[10px]">Nenhum dado de conformidade encontrado para este período.</p>
                    </div>
                ) : viewType === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{gap:16}}>
                        {filteredReports.map((report, idx) => (
                            <ComplianceCard key={report.id} report={report} rank={idx + 1} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ranking</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Unidade Escolar</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Score</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredReports.map((report, idx) => (
                                    <tr key={report.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">#{idx + 1}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{report.escola?.nome}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.escola?.zona_id || 'Sede'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-black text-slate-900">{report.score_geral}%</span>
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${report.status === 'ALTA' ? 'bg-emerald-500' : report.status === 'ATENCAO' ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${report.score_geral}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${report.status === 'ALTA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                report.status === 'ATENCAO' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {report.status === 'ALTA' ? 'Conformidade Plena' : report.status === 'ATENCAO' ? 'Atenção' : 'Em Adequação'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!report.ultima_atualizacao && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            complianceService.validateAndLock(report, 'user-id-placeholder')
                                                                .then(() => alert('Conformidade validada e selo emitido!'))
                                                                .catch(console.error);
                                                        }}
                                                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Validar
                                                    </button>
                                                )}
                                                <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all group-hover:scale-110 shadow-sm">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const ComplianceCard: React.FC<{ report: ComplianceReport, rank: number }> = ({ report, rank }) => {
    const statusColors = {
        ALTA: 'bg-emerald-500 shadow-emerald-200',
        ATENCAO: 'bg-amber-500 shadow-amber-200',
        RISCO: 'bg-rose-500 shadow-rose-200'
    };

    return (
        <div style={{background:'#fff',borderRadius:18,border:'1px solid rgba(0,0,0,0.07)',boxShadow:'0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)',padding:'20px',display:'flex',flexDirection:'column',gap:16,position:'relative',transition:'all 0.22s ease',cursor:'default'}} onMouseEnter={e=>{const el=e.currentTarget;el.style.boxShadow='0 6px 16px rgba(0,0,0,0.08),0 20px 48px rgba(0,0,0,0.13)';el.style.transform='translateY(-4px)';}} onMouseLeave={e=>{const el=e.currentTarget;el.style.boxShadow='0 2px 6px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.08)';el.style.transform='translateY(0)';}}>
            {/* RANK BADGE */}
            <div className="absolute top-8 right-8 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
                #{rank}
            </div>

            <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-[28px] ${statusColors[report.status]} flex items-center justify-center text-white shrink-0 shadow-2xl`}>
                    <Building2 size={28} />
                </div>
                <div className="pr-10">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-3 inline-block ${report.status === 'ALTA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        report.status === 'ATENCAO' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        {report.status}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 uppercase leading-tight line-clamp-2">{report.escola?.nome}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                        <LayoutGrid size={12} /> {report.escola?.zona_id || 'SEDE'}
                    </p>
                </div>
            </div>

            {/* MAIN SCORE RADIUS */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',background:'#f8fafc',padding:'14px 16px',borderRadius:12,border:'1px solid #f1f5f9'}}>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score Geral</p>
                    <h4 className="text-4xl font-black text-slate-900 leading-none">{report.score_geral}%</h4>
                </div>
                <div className="w-24 h-24 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                            className={report.status === 'ALTA' ? 'text-emerald-500' : report.status === 'ATENCAO' ? 'text-amber-500' : 'text-rose-500'}
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * report.score_geral) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <TrendingUp size={24} className={`absolute ${report.status === 'ALTA' ? 'text-emerald-600' : report.status === 'ATENCAO' ? 'text-amber-600' : 'text-rose-600'}`} />
                </div>
            </div>

            {/* MINI INDICATORS GRID */}
            <div className="grid grid-cols-2 gap-4">
                <Indicator label="Recebimentos" val={report.indicadores.recebimentos_on_time + '%'} icon={Truck} color="indigo" />
                <Indicator label="Auditorias" val={report.indicadores.auditorias_contagem} icon={Search} color="slate" />
                <Indicator label="Divergência" val={report.indicadores.divergencia_estoque + '%'} icon={AlertTriangle} color="rose" invert />
                <Indicator label="Exec. Cardápio" val={report.indicadores.execucao_cardapio + '%'} icon={Calendar} color="emerald" />
            </div>

            <div className="pt-2 mt-auto">
                <button style={{width:'100%',padding:'10px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#475569',display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',transition:'all 0.15s'}} onMouseEnter={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background='#eff6ff';el.style.color='#1d4ed8';el.style.borderColor='#bfdbfe';}} onMouseLeave={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.background='#f8fafc';el.style.color='#475569';el.style.borderColor='#e2e8f0';}}>
                    Ver Detalhes Analíticos <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

const Indicator: React.FC<{ label: string, val: string | number, icon: any, color: string, invert?: boolean }> = ({ label, val, icon: Icon, color, invert }) => (
    <div style={{padding:'10px 12px',background:'#fff',border:'1px solid #f1f5f9',borderRadius:10,display:'flex',flexDirection:'column',gap:6}}>
        <div className={`w-8 h-8 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
            <Icon size={14} />
        </div>
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xs font-black text-slate-900 uppercase">{val}</p>
        </div>
    </div>
);

export default ComplianceDashboard;
