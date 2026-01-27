
import React, { useState, useEffect } from 'react';
import {
    AlertOctagon,
    AlertTriangle,
    Info,
    CheckCircle2,
    Clock,
    UserX,
    FileWarning,
    History,
    MoreVertical,
    MessageSquare,
    ShieldAlert,
    ExternalLink
} from 'lucide-react';
import { alertService } from '../services/alertService';
import { IntelligentAlert, AlertType, AlertCategory } from '../types';
import AlertJustificationModal from './AlertJustificationModal';

interface IrregularAlertsDashboardProps {
    schoolId?: string;
    onResolve?: (alertId: string) => void;
}

const IrregularAlertsDashboard: React.FC<IrregularAlertsDashboardProps> = ({ schoolId, onResolve }) => {
    const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | AlertType>('ALL');

    const [selectedAlert, setSelectedAlert] = useState<IntelligentAlert | null>(null);
    const [modalMode, setModalMode] = useState<'JUSTIFY' | 'AUDIT'>('JUSTIFY');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadAlerts();
    }, [schoolId]);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await alertService.getAlerts(schoolId);
            setAlerts(data);
        } catch (err) {
            console.error('Erro ao carregar alertas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (alert: IntelligentAlert, mode: 'JUSTIFY' | 'AUDIT') => {
        setSelectedAlert(alert);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleModalConfirm = async (text: string) => {
        if (!selectedAlert) return;

        try {
            setLoading(true);
            if (modalMode === 'JUSTIFY') {
                // TODO: Adicionar método específico no service se for diferente de resolve
                // Por enquanto, vamos assumir que justificar resolve o alerta ou apenas adiciona nota.
                // Vou implementar um método updateAlertMetadata no service depois.
                // Por ora, vamos simular que "Justificar" resolve com observação.
                await alertService.resolveAlert(selectedAlert.id); // Placeholder
                console.log('Justificativa:', text);
            } else {
                console.log('Enviado para auditoria:', text);
                // TODO: Implementar sendToAudit no service
            }

            // Remove da lista visual
            setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id));
            setIsModalOpen(false);
        } catch (err) {
            alert('Erro ao processar ação');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await alertService.resolveAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
            if (onResolve) onResolve(id);
        } catch (err) {
            alert('Erro ao resolver alerta');
        }
    };

    const getIcon = (type: AlertType) => {
        switch (type) {
            case AlertType.CRITICO: return <AlertOctagon className="text-rose-500" size={24} />;
            case AlertType.ATENCAO: return <AlertTriangle className="text-amber-500" size={24} />;
            default: return <Info className="text-blue-500" size={24} />;
        }
    };

    const getCategoryLabel = (category: AlertCategory) => {
        return category.replace(/_/g, ' ');
    };

    const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.tipo_alerta === filter);

    return (
        <>
            <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                            <ShieldAlert className="text-rose-600" />
                            Alertas de Uso Irregular
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoramento Preventivo e Rastreabilidade</p>
                    </div>

                    <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        {(['ALL', AlertType.CRITICO, AlertType.ATENCAO, AlertType.INFORMATIVO] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {f === 'ALL' ? 'Todos' : f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisando dados do sistema...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <CheckCircle2 className="mx-auto text-emerald-400 w-16 h-16 opacity-20" />
                            <div>
                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Nenhuma irregularidade detectada</p>
                                <p className="text-xs text-slate-400 font-medium">O sistema está operando dentro dos parâmetros de normalidade.</p>
                            </div>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => (
                            <div key={alert.id} className="p-8 hover:bg-slate-50/50 transition-all group relative">
                                <div className="flex gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${alert.tipo_alerta === AlertType.CRITICO ? 'bg-rose-50' :
                                        alert.tipo_alerta === AlertType.ATENCAO ? 'bg-amber-50' : 'bg-blue-50'
                                        }`}>
                                        {getIcon(alert.tipo_alerta)}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${alert.tipo_alerta === AlertType.CRITICO ? 'bg-rose-100 text-rose-600' :
                                                    alert.tipo_alerta === AlertType.ATENCAO ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {getCategoryLabel(alert.categoria)}
                                                </span>
                                                <h4 className="text-lg font-black tracking-tight text-slate-900">{alert.titulo}</h4>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Clock size={12} />
                                                {new Date(alert.data_geracao).toLocaleString('pt-BR')}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
                                            {alert.descricao}
                                        </p>

                                        {alert.escola && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                Unidade: {alert.escola.nome}
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {alert.tipo_alerta !== AlertType.CRITICO && (
                                                <button
                                                    onClick={() => handleResolve(alert.id)}
                                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Marcar como Lido
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleOpenModal(alert, 'JUSTIFY')}
                                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                                            >
                                                <MessageSquare size={14} />
                                                Justificar
                                            </button>

                                            <button
                                                onClick={() => handleOpenModal(alert, 'AUDIT')}
                                                className="px-6 py-2.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                                            >
                                                <FileWarning size={14} />
                                                Auditoria
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden lg:block">
                                        <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                                            <MoreVertical />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 bg-slate-900 text-white/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <History size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Histórico Completo disponível para Perfil Núcleo</span>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest hover:text-white flex items-center gap-2 transition-colors">
                        Exportar Relatório PDF
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            <AlertJustificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                isAudit={modalMode === 'AUDIT'}
                title={modalMode === 'AUDIT' ? 'Encaminhar para Auditoria' : 'Justificativa Administrativa'}
                description={modalMode === 'AUDIT'
                    ? `Encaminhando alerta "${selectedAlert?.titulo}" para análise do setor de auditoria.`
                    : `Adicionando justificativa para o alerta "${selectedAlert?.titulo}".`
                }
            />
        </>
    );
};

export default IrregularAlertsDashboard;
