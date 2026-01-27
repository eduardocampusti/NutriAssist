import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, AlertTriangle, AlertOctagon, Download, ChevronRight, Info } from 'lucide-react';
import { complianceService } from '../../services/complianceService';
import { usePNAE } from '../../contexts/PNAEContext';
import { OfficialLetterhead } from '../../components/OfficialLetterhead';

interface PublicSchoolData {
    id: string;
    nome: string;
    zona: string;
    nivel: string;
    validade: string;
    pontuacao: number;
}

const TransparencyPanel: React.FC = () => {
    const { letterhead } = usePNAE();
    const [data, setData] = useState<PublicSchoolData[]>([]);
    const [filteredData, setFilteredData] = useState<PublicSchoolData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterZone, setFilterZone] = useState('TODAS');
    const [filterLevel, setFilterLevel] = useState('TODOS');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [data, searchTerm, filterZone, filterLevel]);

    const loadData = async () => {
        setLoading(true);
        const result = await complianceService.getPublicData();
        setData(result);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = data;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s => s.nome.toLowerCase().includes(term));
        }

        if (filterZone !== 'TODAS') {
            filtered = filtered.filter(s => s.zona === filterZone);
        }

        if (filterLevel !== 'TODOS') {
            filtered = filtered.filter(s => s.nivel === filterLevel);
        }

        setFilteredData(filtered);
    };

    const getStatusColor = (level: string) => {
        switch (level) {
            case 'VERDE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'AMARELO': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'VERMELHO': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (level: string) => {
        switch (level) {
            case 'VERDE': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
            case 'AMARELO': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case 'VERMELHO': return <AlertOctagon className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusLabel = (level: string) => {
        switch (level) {
            case 'VERDE': return 'CONFORMIDADE PLENA';
            case 'AMARELO': return 'EM ADEQUAÇÃO';
            case 'VERMELHO': return 'ATENÇÃO REQUERIDA';
            default: return 'EM ANÁLISE';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white">

            {/* PRINT HEADER ONLY */}
            <div className="hidden print:block mb-8">
                <OfficialLetterhead config={letterhead} />
                <div className="text-center mt-8 mb-6 border-b border-black pb-4">
                    <h1 className="text-xl font-black uppercase">Relatório de Transparência Nutricional</h1>
                    <p className="text-sm">Posição Consolidada da Rede Municipal de Ensino</p>
                    <p className="text-xs mt-2">Gerado em: {new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* WEB HEADER */}
            <header className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden print:hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                <span className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase">NutriAssist SME</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                                Transparência Nutricional<br />Rede Municipal de Ensino
                            </h1>
                            <p className="mt-4 text-slate-400 max-w-2xl text-sm leading-relaxed">
                                Este painel apresenta informações consolidadas sobre a conformidade das escolas da rede municipal,
                                garantindo transparência ativa e respeitando a Lei Geral de Proteção de Dados (LGPD).
                            </p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 backdrop-blur-sm border border-white/10"
                        >
                            <Download className="w-4 h-4" />
                            Relatório PDF
                        </button>
                    </div>
                </div>
            </header>

            {/* PRINT DATA TABLE */}
            <div className="hidden print:block w-full">
                <table className="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-2 uppercase font-black">Escola</th>
                            <th className="py-2 uppercase font-black">Zona</th>
                            <th className="py-2 uppercase font-black text-center">Nível de Conformidade</th>
                            <th className="py-2 uppercase font-black text-right">Validade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(school => (
                            <tr key={school.id} className="border-b border-gray-200">
                                <td className="py-2 font-bold">{school.nome}</td>
                                <td className="py-2">{school.zona}</td>
                                <td className="py-2 text-center font-bold">
                                    {getStatusLabel(school.nivel)}
                                </td>
                                <td className="py-2 text-right">{school.validade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-8 text-[10px] text-center italic border-t border-black pt-4">
                    Documento gerado publicamente via Portal de Transparência NutriAssist SME.
                </div>
            </div>

            {/* Main Content Info Cards (WEB ONLY) */}
            <main className="container mx-auto max-w-6xl px-6 -mt-16 relative z-20 pb-20 print:hidden">

                {/* Stats / Controls */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar escola..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium focus:border-emerald-500/50 focus:outline-none transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
                            <div className="relative min-w-[150px]">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    className="w-full pl-10 pr-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase appearance-none"
                                    value={filterZone}
                                    onChange={(e) => setFilterZone(e.target.value)}
                                >
                                    <option value="TODAS">Todas Zonas</option>
                                    <option value="Urbana">Urbana</option>
                                    <option value="Rural">Rural</option>
                                </select>
                            </div>

                            <div className="relative min-w-[200px]">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    className="w-full pl-10 pr-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase appearance-none"
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value)}
                                >
                                    <option value="TODOS">Todos Níveis</option>
                                    <option value="VERDE">Conformidade Plena</option>
                                    <option value="AMARELO">Em Adequação</option>
                                    <option value="VERMELHO">Atenção Requerida</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando dados...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-bold text-sm">Nenhuma escola encontrada com os filtros atuais.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map(school => (
                            <div key={school.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        {school.zona}
                                    </span>
                                    <div className={`p-2 rounded-xl bg-opacity-10 ${school.nivel === 'VERDE' ? 'bg-emerald-500' : school.nivel === 'AMARELO' ? 'bg-amber-500' : 'bg-red-500'}`}>
                                        {getStatusIcon(school.nivel)}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.5rem]">
                                    {school.nome}
                                </h3>

                                <div className={`flex items-center gap-3 mt-4 p-3 rounded-xl border ${getStatusColor(school.nivel)}`}>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black uppercase opacity-60 mb-0.5">Status Atual</p>
                                        <p className="text-[11px] font-bold">{getStatusLabel(school.nivel)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                    <span>Validade: <strong>{school.validade}</strong></span>
                                    {/* <span className="flex items-center gap-1 font-bold">
                                        Verificar <ChevronRight className="w-3 h-3" />
                                    </span> */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                        Dados atualizados em tempo real • NutriAssist SME Public Portal
                    </p>
                </div>

            </main>
        </div>
    );
};

export default TransparencyPanel;
