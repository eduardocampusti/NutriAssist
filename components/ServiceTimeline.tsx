import React from 'react';
import { TimelineEvent, EventType } from '../types';
import {
    Truck,
    ClipboardList,
    AlertCircle,
    ShieldCheck,
    ArrowRight,
    Clock,
    Calendar,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

interface ServiceTimelineProps {
    events: TimelineEvent[];
    onEventClick?: (event: TimelineEvent) => void;
}

const ServiceTimeline: React.FC<ServiceTimelineProps> = ({ events, onEventClick }) => {

    const getEventIcon = (type: EventType) => {
        switch (type) {
            case EventType.ENTREGA: return <Truck className="w-5 h-5 text-blue-500" />;
            case EventType.SOLICITACAO: return <ClipboardList className="w-5 h-5 text-indigo-500" />;
            case EventType.OCORRENCIA: return <AlertTriangle className="w-5 h-5 text-rose-500" />;
            case EventType.SANITARIO: return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
            case EventType.AJUSTE: return <Clock className="w-5 h-5 text-amber-500" />;
            default: return <ArrowRight className="w-5 h-5 text-slate-400" />;
        }
    };

    const getEventColor = (type: EventType) => {
        switch (type) {
            case EventType.ENTREGA: return 'bg-blue-50 border-blue-100';
            case EventType.SOLICITACAO: return 'bg-indigo-50 border-indigo-100';
            case EventType.OCORRENCIA: return 'bg-rose-50 border-rose-100';
            case EventType.SANITARIO: return 'bg-emerald-50 border-emerald-100';
            default: return 'bg-slate-50 border-slate-100';
        }
    };

    if (events.length === 0) {
        return (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Nenhum evento registrado</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">A linha do tempo está aguardando interações.</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {events.map((event, index) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>

                    {/* ICON DOT */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-slate-500 shadow-xl group-hover:scale-110 transition-transform z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {getEventIcon(event.tipo)}
                    </div>

                    {/* CONTENT CARD */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${getEventColor(event.tipo)}`}>
                                    {event.tipo}
                                </span>
                                {event.status && (
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• {event.status}</span>
                                )}
                            </div>
                            <time className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(event.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </time>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{event.titulo}</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">{event.descricao}</p>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{event.responsavel}</span>
                            </div>

                            {onEventClick && (
                                <button
                                    onClick={() => onEventClick(event)}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                >
                                    Ver detalhes <ArrowRight size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ServiceTimeline;
