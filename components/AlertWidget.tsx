import React, { useState, useEffect } from 'react';
import { IntelligentAlert, AlertType, UserProfile, UserRole } from '../types';
import { alertService } from '../services/alertService';
import {
    AlertOctagon,
    AlertTriangle,
    ChevronRight,
    BellRing
} from 'lucide-react';

interface AlertWidgetProps {
    activeProfile: UserProfile;
    onViewAll: () => void;
}

const AlertWidget: React.FC<AlertWidgetProps> = ({ activeProfile, onViewAll }) => {
    const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const schoolId = activeProfile.role === UserRole.DIRETOR ? activeProfile.school_id : undefined;
                const data = await alertService.getAlerts(schoolId);
                setAlerts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [activeProfile]);

    const criticals = alerts.filter(a => a.tipo_alerta === AlertType.CRITICO);
    const attentions = alerts.filter(a => a.tipo_alerta === AlertType.ATENCAO);

    if (loading) return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-b-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
            {/* DECORATION */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                    <BellRing className="w-6 h-6 text-blue-400" />
                </div>
                <button
                    onClick={onViewAll}
                    className="p-2 transition-all hover:translate-x-1 text-white/40 hover:text-white"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                <h4 className="text-sm font-black text-white/60 uppercase tracking-widest">Alertas Inteligentes</h4>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/20">
                            <AlertOctagon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{criticals.length}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Críticos</p>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/20">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{attentions.length}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Atenção</p>
                        </div>
                    </div>
                </div>

                {alerts.length > 0 ? (
                    <div className="pt-2">
                        <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            Ação Recomendada em {alerts[0].escola?.nome || 'Escola'}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest pt-2">Operação Normalizada</p>
                )}
            </div>
        </div>
    );
};

export default AlertWidget;
