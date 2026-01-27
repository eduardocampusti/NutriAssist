import React, { useState, useEffect } from 'react';
import { complianceService } from '../services/complianceService';
import { useUsers } from '../contexts/UserContext';
import { UserRole } from '../types';
import { TrendingUp, TrendingDown, Minus, Award, ArrowRight } from 'lucide-react';

interface EvolutionData {
    schoolId: string;
    schoolName: string;
    currentScore: number;
    history: { month: string, score: number }[];
    trend: 'UP' | 'DOWN' | 'FLAT';
    status: 'POSITIVE' | 'STABLE' | 'ATTENTION';
    delta: number;
}

const EvolutionDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { activeProfile } = useUsers();
    const [data, setData] = useState<EvolutionData[]>([]);
    const [loading, setLoading] = useState(true);

    const isCentral = activeProfile?.role === UserRole.ADMIN ||
        activeProfile?.role === UserRole.NUTRICIONISTA ||
        activeProfile?.role === UserRole.SECRETARIO;

    useEffect(() => {
        loadEvolution();
    }, []);

    const loadEvolution = async () => {
        setLoading(true);
        const result = await complianceService.getSchoolEvolution();

        // Filter for specific school if not central
        if (!isCentral && activeProfile?.school_id) {
            setData(result.filter((d: any) => d.schoolId === activeProfile.school_id));
        } else {
            // Top 10 for dashboard view to avoid clutter, or all? Let's show all for now but grid layout
            setData(result);
        }
        setLoading(false);
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'UP': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
            case 'DOWN': return <TrendingDown className="w-5 h-5 text-red-500" />;
            default: return <Minus className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'POSITIVE':
                return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-full uppercase">Evolução Positiva</span>;
            case 'ATTENTION':
                return <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-1 rounded-full uppercase">Atenção Necessária</span>;
            default:
                return <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded-full uppercase">Estável</span>;
        }
    };

    // Simple SVG Line Chart Component
    const MiniChart = ({ pts }: { pts: { month: string, score: number }[] }) => {
        if (pts.length < 2) return <div className="h-16 flex items-center justify-center text-xs text-slate-300">Dados insuficientes</div>;

        const max = 100;
        const width = 120;
        const height = 40;
        const step = width / (pts.length - 1);

        const points = pts.map((p, i) =>
            `${i * step},${height - (p.score / max) * height}`
        ).join(' ');

        return (
            <svg width="100%" height={height} className="overflow-visible">
                <polyline
                    fill="none"
                    stroke={pts[pts.length - 1].score >= pts[0].score ? '#10b981' : '#ef4444'}
                    strokeWidth="2"
                    points={points}
                />
                {pts.map((p, i) => (
                    <circle
                        key={i}
                        cx={i * step}
                        cy={height - (p.score / max) * height}
                        r="2"
                        className="fill-slate-400"
                    />
                ))}
            </svg>
        );
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Award className="w-8 h-8 text-indigo-600" />
                        Melhoria Contínua
                    </h1>
                    <p className="text-slate-500 max-w-2xl mt-2 text-sm">
                        Acompanhamento da evolução técnica das unidades escolares.
                        Este painel foca no progresso individual e no compromisso com a qualidade.
                    </p>
                </div>
                <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50">
                    Fechar
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map(item => (
                        <div key={item.schoolId} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Trend Indicator Background */}
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-10 -mt-10 rounded-full opacity-10 ${item.trend === 'UP' ? 'bg-emerald-500' : item.trend === 'DOWN' ? 'bg-red-500' : 'bg-amber-500'}`}></div>

                            <div className="flex justify-between items-start relative z-10 mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 line-clamp-1" title={item.schoolName}>{item.schoolName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-black text-slate-900">{item.currentScore}</span>
                                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-400">
                                        {getTrendIcon(item.trend)}
                                        <span>{item.delta > 0 ? `+${item.delta}` : item.delta} pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="mt-6 mb-2">
                                <MiniChart pts={item.history} />
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2">
                                <span>6 Meses Atrás</span>
                                <span>Atual</span>
                            </div>

                            {/* Insight/Message */}
                            {item.status === 'POSITIVE' && (
                                <p className="mt-4 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                                    🚀 Excelente! Esta unidade vem demonstrando compromisso constante com a qualidade.
                                </p>
                            )}
                            {item.status === 'ATTENTION' && (
                                <p className="mt-4 text-xs text-red-700 bg-red-50 p-2 rounded-lg">
                                    ⚠️ Atenção: Identificamos uma tendência de queda leve. Verifique pendências recentes.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvolutionDashboard;
