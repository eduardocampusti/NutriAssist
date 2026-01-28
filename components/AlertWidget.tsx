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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden group h-full">
            {/* Background Chart Visualization */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.05] pointer-events-none">
                <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full text-slate-900 fill-current">
                    <path d="M0,100 C150,150 350,0 500,100 L500,150 L0,150 Z" />
                </svg>
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <button
                    onClick={onViewAll}
                    className="p-2 transition-all hover:translate-x-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertas Inteligentes</h4>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center border border-red-100 dark:border-red-800">
                            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{criticals.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Críticos</p>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-slate-100 dark:bg-slate-700"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{attentions.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Atenção</p>
                        </div>
                    </div>
                </div>

                {alerts.length > 0 ? (
                    <div className="pt-2">
                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Ação Recomendada em {alerts[0].escola?.nome || 'Escola'}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pt-2">Operação Normalizada</p>
                )}
            </div>
        </div>
    );
};

export default AlertWidget;
