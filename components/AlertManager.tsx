import React, { useState, useEffect } from 'react';
import { IntelligentAlert, AlertType, AlertCategory, UserRole, UserProfile } from '../types';
import { alertService } from '../services/alertService';
import {
    AlertTriangle,
    Info,
    AlertOctagon,
    CheckCircle,
    RefreshCcw,
    Search,
    Filter,
    ArrowRight,
    ShieldAlert,
    X
} from 'lucide-react';
import JustificationForm from './JustificationForm';

interface AlertManagerProps {
    activeProfile: UserProfile;
}

const AlertManager: React.FC<AlertManagerProps> = ({ activeProfile }) => {
    const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showJustifyModal, setShowJustifyModal] = useState<IntelligentAlert | null>(null);

    useEffect(() => {
        loadAlerts();
    }, [activeProfile]);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            // Se for Diretor, só vê os da sua escola
            const schoolId = activeProfile.role === UserRole.DIRETOR ? activeProfile.school_id : undefined;
            const data = await alertService.getAlerts(schoolId);
            setAlerts(data);
        } catch (err) {
            console.error('Erro ao carregar alertas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await alertService.resolveAlert(id);
            setAlerts(alerts.filter(a => a.id !== id));
        } catch (err) {
            console.error('Erro ao resolver alerta:', err);
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.escola?.nome.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'ALL') return matchesSearch;
        return matchesSearch && alert.tipo_alerta === filterType;
    });

    const getAlertIcon = (type: AlertType) => {
        switch (type) {
            case AlertType.CRITICO: return <AlertOctagon className="w-6 h-6 text-red-500" />;
            case AlertType.ATENCAO: return <AlertTriangle className="w-6 h-6 text-amber-500" />;
            case AlertType.INFORMATIVO: return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getAlertColor = (type: AlertType) => {
        switch (type) {
            case AlertType.CRITICO: return 'bg-red-50 border-red-100';
            case AlertType.ATENCAO: return 'bg-amber-50 border-amber-100';
            case AlertType.INFORMATIVO: return 'bg-blue-50 border-blue-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Painel de Alertas Inteligentes</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monitoramento preventivo de estoque e cardápio</p>
                </div>
                <button
                    onClick={loadAlerts}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar alerta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                </div>
                <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none"
                    >
                        <option value="ALL">TODOS OS NÍVEIS</option>
                        <option value={AlertType.CRITICO}>APENAS CRÍTICOS</option>
                        <option value={AlertType.ATENCAO}>ATENÇÃO</option>
                        <option value={AlertType.INFORMATIVO}>INFORMATIVO</option>
                    </select>
                </div>
                <div className="flex items-center justify-around px-4 bg-slate-50 rounded-2xl">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Críticos</p>
                        <p className="text-lg font-black text-red-600">{alerts.filter(a => a.tipo_alerta === AlertType.CRITICO).length}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atenção</p>
                        <p className="text-lg font-black text-amber-600">{alerts.filter(a => a.tipo_alerta === AlertType.ATENCAO).length}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Info</p>
                        <p className="text-lg font-black text-blue-600">{alerts.filter(a => a.tipo_alerta === AlertType.INFORMATIVO).length}</p>
                    </div>
                </div>
            </div>

            {/* ALERT LIST */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 shadow-inner">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight">Nenhum Alerta Encontrado</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tudo em conformidade com o planejamento técnico.</p>
                    </div>
                ) : (
                    filteredAlerts.map(alert => (
                        <div
                            key={alert.id}
                            className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${getAlertColor(alert.tipo_alerta)}`}
                        >
                            <div className="flex gap-4">
                                <div className="mt-1">{getAlertIcon(alert.tipo_alerta)}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-white/50 border border-current/20 text-slate-600 uppercase tracking-widest">
                                            {alert.categoria.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(alert.data_geracao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-1">{alert.titulo}</h3>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed mb-4">{alert.descricao}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{alert.escola?.nome}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowJustifyModal(alert)}
                                                className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-sm flex items-center gap-2"
                                            >
                                                <ShieldAlert size={14} />
                                                Justificar
                                            </button>
                                            <button
                                                onClick={() => handleResolve(alert.id)}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2"
                                            >
                                                Marcar como Resolvido
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* JUSTIFICATION MODAL */}
            {showJustifyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <JustificationForm
                            activeProfile={activeProfile}
                            initialData={{
                                escola_id: showJustifyModal.escola_id,
                                tipo: showJustifyModal.tipo_alerta === 'CRITICO' ? 'FALTA_ITEM' : 'OUTROS' as any,
                                descricao: `Justificativa vinculada ao alerta: ${showJustifyModal.titulo}\n\n`,
                                vinculo_tipo: 'ALERTA',
                                vinculo_id: showJustifyModal.id
                            }}
                            onSuccess={() => {
                                handleResolve(showJustifyModal.id);
                                setShowJustifyModal(null);
                            }}
                            onCancel={() => setShowJustifyModal(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertManager;
