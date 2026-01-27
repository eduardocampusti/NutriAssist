import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    FileText,
    Download,
    Calendar,
    Hash,
    ChevronRight,
    Activity,
    ArrowLeft,
    Search,
    CheckCircle2,
    AlertTriangle,
    Zap,
    Clock,
    Printer
} from 'lucide-react';
import { earlyWarningService } from '../services/earlyWarningService';
import { documentGenerator } from '../services/documentGeneratorService';
import { OfficialDocumentViewer } from './OfficialDocumentViewer';
import { usePNAE } from '../contexts/PNAEContext';

interface PreventiveReport {
    id: string;
    tipo_risco: string;
    descricao: string;
    impacto_projetado: string;
    acoes_recomendadas: string;
    protocolo: string;
    data_geracao: string;
    contexto_dados: any;
}

const EarlyWarningCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { letterhead } = usePNAE();
    const [reports, setReports] = useState<PreventiveReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<PreventiveReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);

    useEffect(() => {
        const runScan = async () => {
            await earlyWarningService.checkStockAnomalies();
            await earlyWarningService.checkZoneRisks();
            await earlyWarningService.checkConsumptionTrends();
            loadReports();
        };
        runScan();
    }, []);

    const loadReports = async () => {
        setIsLoading(true);
        try {
            const data = await earlyWarningService.getAllReports();
            setReports(data as PreventiveReport[]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = (report: PreventiveReport) => {
        const content = documentGenerator.generatePreventiveReportContent(report);
        setGeneratedContent(content);
        setIsViewerOpen(true);
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'ESTOQUE': return 'bg-red-50 text-red-600 border-red-100';
            case 'SIMULACAO': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'ZONA': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredReports = reports.filter(r =>
        r.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.protocolo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-slate-900/10 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Vigilância Preventiva...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* HEADER */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[24px] flex items-center justify-center text-3xl">🛡️</div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Central de Vigilância</h2>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-2 font-mono">Monitoramento de Risco Antecipado</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
                </button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl capitalize"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LISTA DE RELATÓRIOS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar protocolo..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredReports.map(report => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group ${selectedReport?.id === report.id
                                        ? 'border-indigo-600 bg-indigo-50/30'
                                        : 'border-slate-50 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyles(report.tipo_risco)}`}>
                                            {report.tipo_risco}
                                        </span>
                                        <Clock className="w-3 h-3 text-slate-300" />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase leading-snug mb-2 line-clamp-2">
                                        {report.descricao}
                                    </h4>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                            Prot: {report.protocolo}
                                        </div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                            {new Date(report.data_geracao).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* VISUALIZAÇÃO DO DETALHE */}
                <div className="lg:col-span-8">
                    {selectedReport ? (
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* TOP BAR */}
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-xl">📜</div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Relatório Institucional</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo: {selectedReport.protocolo}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleExport(selectedReport)}
                                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                                    >
                                        <Printer className="w-4 h-4" /> Visualizar Oficial
                                    </button>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Risco Identificado</label>
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm font-bold text-slate-800 leading-relaxed uppercase">
                                            {selectedReport.descricao}
                                        </div>
                                    </section>
                                    <section>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Impacto Projetado</label>
                                        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-sm font-black text-red-700 leading-relaxed uppercase">
                                            {selectedReport.impacto_projetado}
                                        </div>
                                    </section>
                                </div>

                                <section>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Ações Preventivas Recomendadas (Parecer IA-PNAE)</label>
                                    <div className="p-10 bg-indigo-900 text-white rounded-[40px] relative overflow-hidden group shadow-2xl">
                                        <div className="relative z-10 whitespace-pre-line text-sm leading-relaxed font-medium">
                                            {selectedReport.acoes_recomendadas}
                                        </div>
                                        <Zap className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                    </div>
                                </section>

                                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Validado tecnicamente por Alexandra Fernandes (RT)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-indigo-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gerado em: {new Date(selectedReport.data_geracao).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-6 opacity-40">📊</div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center max-w-xs">
                                Selecione um relatório ao lado para visualizar a fundamentação técnica
                            </h3>
                        </div>
                    )}
                </div>
            </div>

            {isViewerOpen && generatedContent && (
                <OfficialDocumentViewer
                    content={generatedContent}
                    config={letterhead}
                    onClose={() => setIsViewerOpen(false)}
                />
            )}
        </div>
    );
};

export default EarlyWarningCenter;
