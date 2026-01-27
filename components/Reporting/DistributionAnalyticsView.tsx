
import React, { useState, useMemo } from 'react';
import {
    Distribution,
    School,
    InventoryItem,
    DistributionStatus,
    InventoryCategory
} from '../../types';
import {
    Download,
    Filter,
    BarChart3,
    PieChart,
    FileSpreadsheet,
    FileDown,
    ArrowLeft,
    TrendingUp,
    AlertCircle,
    Package,
    Calendar,
    Search
} from 'lucide-react';

interface DistributionAnalyticsViewProps {
    distributions: Distribution[];
    schools: School[];
    inventory: InventoryItem[];
    onClose: () => void;
}

export const DistributionAnalyticsView: React.FC<DistributionAnalyticsViewProps> = ({
    distributions,
    schools,
    inventory,
    onClose
}) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedSchoolId, setSelectedSchoolId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Filtering Logic
    const filteredData = useMemo(() => {
        return distributions.filter(d => {
            const matchesSchool = selectedSchoolId === 'all' || d.escola_id === selectedSchoolId;
            const distDate = d.created_at ? new Date(d.created_at) : new Date();
            const matchesStart = !dateRange.start || distDate >= new Date(dateRange.start);
            const matchesEnd = !dateRange.end || distDate <= new Date(dateRange.end);

            const schoolName = schools.find(s => s.id === d.escola_id)?.nome || '';
            const matchesSearch = schoolName.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.includes(searchTerm);

            return matchesSchool && matchesStart && matchesEnd && matchesSearch;
        });
    }, [distributions, selectedSchoolId, dateRange, searchTerm, schools]);

    // 2. Metrics Calculations
    const metrics = useMemo(() => {
        const total = filteredData.length;
        const confirmed = filteredData.filter(d => d.status === DistributionStatus.ENTREGUE || d.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA).length;
        const divergent = filteredData.filter(d => d.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA).length;

        const totalItemsDelivered = filteredData.reduce((acc, d) => acc + (d.itens?.length || 0), 0);
        const totalQtyDelivered = filteredData.reduce((acc, d) =>
            acc + (d.itens?.reduce((sub, it) => sub + Number(it.quantidade_enviada || 0), 0) || 0), 0
        );

        return {
            total,
            confirmed,
            divergent,
            divergenceRate: total > 0 ? (divergent / confirmed) * 100 : 0,
            totalItemsDelivered,
            totalQtyDelivered
        };
    }, [filteredData]);

    // 3. Data for Export
    const handleExportCSV = () => {
        const headers = ['ID', 'Escola', 'Data Envio', 'Status', 'Itens', 'Total Unidades', 'Divergência'];
        const rows = filteredData.map(d => [
            d.id,
            schools.find(s => s.id === d.escola_id)?.nome || 'N/A',
            d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A',
            d.status,
            d.itens?.length || 0,
            d.itens?.reduce((acc, it) => acc + Number(it.quantidade_enviada || 0), 0) || 0,
            d.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA ? 'SIM' : 'NÃO'
        ]);

        const content = [headers, ...rows].map(e => e.join(';')).join('\n');
        const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_distribuicao_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-[60] overflow-y-auto animate-in fade-in duration-300">
            {/* Top Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Relatórios de Logística</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inteligência de Distribuição e Controle</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200 transition-all"
                    >
                        <FileDown className="w-4 h-4" /> Gerar PDF
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-10 space-y-10">
                {/* Filters Row */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Filtrar por Escola</label>
                        <div className="relative">
                            <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <select
                                value={selectedSchoolId}
                                onChange={e => setSelectedSchoolId(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none hover:bg-slate-100 transition-colors"
                            >
                                <option value="all">Todas as Unidades</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Período (De)</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Período (Até)</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Termo de Busca</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="text"
                                placeholder="ID ou Escola..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <TrendingUp className="w-6 h-6 text-blue-500 mb-6" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Ordens</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{metrics.total}</h3>
                        <p className="text-[9px] text-blue-400 font-bold uppercase mt-2">No período selecionado</p>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <Package className="w-6 h-6 text-emerald-500 mb-6" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Distribuído</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{metrics.totalQtyDelivered.toFixed(1)}</h3>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase mt-2">{metrics.totalItemsDelivered} Itens únicos</p>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <AlertCircle className="w-6 h-6 text-rose-500 mb-6" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Divergências</p>
                        <h3 className="text-3xl font-black text-rose-600 mt-1">{metrics.divergent}</h3>
                        <p className="text-[9px] text-rose-400 font-bold uppercase mt-2">{metrics.divergenceRate.toFixed(1)}% de incidência</p>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-12 -translate-y-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <BarChart3 className="w-6 h-6 text-amber-500 mb-6" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa de Eficiência</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{metrics.total > 0 ? ((metrics.confirmed / metrics.total) * 100).toFixed(0) : 0}%</h3>
                        <p className="text-[9px] text-amber-400 font-bold uppercase mt-2">{metrics.confirmed} Entregas finalizadas</p>
                    </div>
                </div>

                {/* Analytical Table */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400" /> Detalhamento de Operações
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / ID</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Escola Destino</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volumes (Itens)</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Final</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Divergência</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.map(dist => {
                                    const school = schools.find(s => s.id === dist.escola_id);
                                    const itemsCount = dist.itens?.length || 0;
                                    const qtySum = dist.itens?.reduce((acc, it) => acc + Number(it.quantidade_enviada || 0), 0) || 0;
                                    const isDivergent = dist.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA;

                                    return (
                                        <tr key={dist.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <p className="text-xs font-black text-slate-800">{dist.created_at ? new Date(dist.created_at).toLocaleDateString() : 'N/A'}</p>
                                                <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase">OD {dist.id.slice(0, 8)}</p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{school?.nome || 'Unidade Indefinida'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{school?.municipio || 'Sede'}</p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="text-xs font-black text-slate-600 uppercase">{qtySum.toFixed(1)} Unidades</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{itemsCount} Itens Únicos</p>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight ${dist.status === DistributionStatus.ENTREGUE ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        dist.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                            dist.status === DistributionStatus.AGUARDANDO_CONFIRMACAO ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                                'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {dist.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA ? 'CONCLUÍDA C/ DIVERGÊNCIA' : dist.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                {isDivergent ? (
                                                    <span className="text-rose-600 text-xs font-black flex items-center justify-end gap-2">
                                                        <AlertCircle className="w-4 h-4" /> EXISTE
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Nenhuma</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="py-20 text-center text-slate-300 italic">
                                Nenhum registro encontrado para os filtros aplicados.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
