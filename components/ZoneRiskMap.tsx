import React from 'react';
import { Card } from './UI/Card';
import { TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';

interface ZoneHealth {
    zona_escolar: string;
    total_escolas_na_zona: number;
    escolas_adequadas: number;
    escolas_atencao: number;
    escolas_ajuste: number;
    perc_conformidade_zona: number;
    tendencia?: 'UP' | 'DOWN' | 'STABLE';
}

interface ZoneRiskMapProps {
    data: ZoneHealth[];
}

const ZoneRiskMap: React.FC<ZoneRiskMapProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((zone, idx) => (
                <Card key={idx} variant="governance" padding="lg" className="bg-white border-l-4 border-l-slate-200 hover:border-l-slate-900 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-400"><MapPin className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{zone.zona_escolar}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{zone.total_escolas_na_zona} Unidades Gerenciadas</p>
                            </div>
                        </div>
                        {zone.tendencia && (
                            <div className={`p-1.5 rounded-lg ${zone.tendencia === 'UP' ? 'bg-rose-50 text-rose-600' :
                                    zone.tendencia === 'DOWN' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-slate-50 text-slate-400'
                                }`}>
                                {zone.tendencia === 'UP' ? <TrendingUp className="w-4 h-4" /> :
                                    zone.tendencia === 'DOWN' ? <TrendingDown className="w-4 h-4" /> :
                                        <Minus className="w-4 h-4" />}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{zone.perc_conformidade_zona}%</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conformidade Média</span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${(zone.escolas_adequadas / zone.total_escolas_na_zona) * 100}%` }}></div>
                            <div className="h-full bg-amber-400" style={{ width: `${(zone.escolas_atencao / zone.total_escolas_na_zona) * 100}%` }}></div>
                            <div className="h-full bg-rose-500" style={{ width: `${(zone.escolas_ajuste / zone.total_escolas_na_zona) * 100}%` }}></div>
                        </div>

                        <div className="flex justify-between gap-1">
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-[10px] font-black text-emerald-600">{zone.escolas_adequadas}</span>
                                <span className="text-[7px] font-bold text-slate-400 uppercase">Adequadas</span>
                            </div>
                            <div className="flex flex-col items-center flex-1 border-x border-slate-100">
                                <span className="text-[10px] font-black text-amber-500">{zone.escolas_atencao}</span>
                                <span className="text-[7px] font-bold text-slate-400 uppercase">Atenção</span>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-[10px] font-black text-rose-500">{zone.escolas_ajuste}</span>
                                <span className="text-[7px] font-bold text-slate-400 uppercase">Ajuste</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
            {data.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aguardando consolidação de dados geográficos...</p>
                </div>
            )}
        </div>
    );
};

export default ZoneRiskMap;
