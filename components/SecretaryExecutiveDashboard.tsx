import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './UI/Card';
import { PageHeader } from './UI/PageHeader';
import { Button } from './UI/Button';
import {
    ShieldCheck,
    BarChart3,
    FileText,
    Gavel,
    LayoutDashboard,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Download,
    ExternalLink,
    ChevronRight,
    School
} from 'lucide-react';
import { nutritionalDashboardService, ZoneHealth, ManagementAlert } from '../services/nutritionalDashboardService';
import ZoneRiskMap from './ZoneRiskMap';
import { usePNAE } from '../contexts/PNAEContext';

const SecretaryExecutiveDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { letterhead } = usePNAE();
    const [zoneData, setZoneData] = useState<ZoneHealth[]>([]);
    const [alerts, setAlerts] = useState<ManagementAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadExecutiveData = async () => {
            setIsLoading(true);
            try {
                const [zones, strategicAlerts] = await Promise.all([
                    nutritionalDashboardService.getZoneHealth(),
                    nutritionalDashboardService.getExecutiveAlerts()
                ]);
                setZoneData(zones);
                setAlerts(strategicAlerts);
            } catch (err) {
                console.error("Erro ao carregar painel executivo:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadExecutiveData();
    }, []);

    const municipalMetrics = useMemo(() => {
        const totalSchools = zoneData.reduce((acc, z) => acc + z.total_escolas_na_zona, 0);
        const totalAdequate = zoneData.reduce((acc, z) => acc + z.escolas_adequadas, 0);
        const avgCompliance = zoneData.length > 0
            ? zoneData.reduce((acc, z) => acc + z.perc_conformidade_zona, 0) / zoneData.length
            : 0;

        return { totalSchools, totalAdequate, avgCompliance };
    }, [zoneData]);

    if (isLoading) {
        return <div className="p-12 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Consolidando Governança Municipal...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24">
            <PageHeader
                title="Governança Nutricional Municipal"
                subtitle={`Painel Executivo Estratégico • ${letterhead.municipio || 'SME'}`}
                icon={ShieldCheck}
            />

            {/* MÉTRICAS DE GOVERNANÇA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card variant="governance" padding="lg" className="bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Eficiência Nutricional</p>
                        <h2 className="text-5xl font-black tracking-tighter mb-2">{municipalMetrics.avgCompliance.toFixed(1)}%</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Índice Municipal de Conformidade</p>
                    </div>
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>
                </Card>

                <Card variant="governance" padding="lg" className="bg-white border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rede Ativa</p>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{municipalMetrics.totalSchools}</span>
                        <span className="text-sm font-bold text-slate-400 mb-2 uppercase">Unidades</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{municipalMetrics.totalAdequate} Unidades em Plenitude</span>
                    </div>
                </Card>

                <Card variant="governance" padding="lg" className="bg-white border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gestão do Risco</p>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{alerts.length}</span>
                        <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase leading-snug">Pontos de Atenção Sistêmica Identificados</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MAPA DE RISCO POR ZONA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Vigilância Geográfica</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status Consolidado por Zona Escolar</p>
                        </div>
                    </div>
                    <ZoneRiskMap data={zoneData} />
                </div>

                {/* ALERTAS ESTRATÉGICOS */}
                <Card variant="governance" padding="lg" className="bg-white border-l-4 border-l-rose-500">
                    <div className="flex items-center gap-2 mb-8">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Monitoramento Preventivo</h3>
                    </div>

                    <div className="space-y-6">
                        {alerts.map((alert, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-rose-50 border border-rose-100/50">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2">{alert.tipo.replace(/_/g, ' ')}</p>
                                <p className="text-xs font-bold text-rose-900 leading-relaxed mb-4">{alert.mensagem}</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Impacto Legal PNAE: Crítico</span>
                                </div>
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className="py-20 text-center opacity-40">
                                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Nenhuma anormalidade sistêmica detectada.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* AÇÕES ESTRATÉGICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 bg-white border-slate-200 hover:border-slate-900 group shadow-sm">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all"><FileText className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Gerar Relatório CAE</span>
                </Button>

                <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 bg-white border-slate-200 hover:border-slate-900 group shadow-sm">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-slate-900 group-hover:text-white transition-all"><Download className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Extração FNDE SigPC</span>
                </Button>

                <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-3 bg-white border-slate-200 hover:border-slate-900 group shadow-sm">
                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all"><Gavel className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Base Legal e Portarias</span>
                </Button>

                <Button variant="outline" onClick={() => navigate('/ranking-evolucao')} className="h-auto py-6 flex flex-col items-center gap-3 bg-white border-slate-200 hover:border-slate-900 group shadow-sm">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-slate-900 group-hover:text-white transition-all"><School className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Certificações de Qualidade</span>
                </Button>
            </div>
        </div>
    );
};

export default SecretaryExecutiveDashboard;
