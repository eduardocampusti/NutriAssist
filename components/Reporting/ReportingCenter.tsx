
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Filter, PieChart, TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { reportingService } from '../../services/reportingService';
import { documentService, OfficialDocType } from '../../services/documentService';
import { documentGenerator } from '../../services/documentGeneratorService';
import { UserRole, UserProfile } from '../../types';
import { usePNAE } from '../../contexts/PNAEContext';
import { OfficialDocumentViewer } from '../OfficialDocumentViewer';
import { OfficialLetterhead } from '../OfficialLetterhead';

interface ReportingCenterProps {
    onClose: () => void;
    activeProfile?: UserProfile;
}

type ReportType = 'MENUS' | 'COMPLIANCE' | 'CONSUMPTION' | 'ACCOUNTABILITY';

const ReportingCenter: React.FC<ReportingCenterProps> = ({ onClose, activeProfile }) => {
    const { letterhead } = usePNAE();
    const navigate = useNavigate();
    const [activeReport, setActiveReport] = useState<ReportType>('MENUS');
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);

    // Filters
    const [year, setYear] = useState(new Date().getFullYear());

    // Load Data based on Active Report
    useEffect(() => {
        loadReportPreview();
    }, [activeReport, year]);

    const loadReportPreview = async () => {
        setIsLoading(true);
        setPreviewData(null); // Reset data to prevent stale state on error
        try {
            let data;
            switch (activeReport) {
                case 'MENUS':
                    data = await reportingService.getApprovedMenusReport(year);
                    break;
                case 'COMPLIANCE':
                    data = await reportingService.getComplianceReport(year);
                    break;
                case 'CONSUMPTION':
                    // Mock date range for prototype
                    data = await reportingService.getConsumptionDeviation(`${year}-01-01`, `${year}-12-31`);
                    break;
                case 'ACCOUNTABILITY':
                    data = await reportingService.getPNAEAccountability(year);
                    break;
            }
            setPreviewData(data);
        } catch (error) {
            console.error("Error loading report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = (format: 'PDF' | 'CSV') => {
        if (format === 'PDF') {
            const content = documentGenerator.generateManagementReport(
                activeReport,
                previewData,
                year
            );
            setGeneratedContent(content);
            setIsViewerOpen(true);
        } else {
            alert(`Exportando Relatório ${activeReport} em ${format}... (Funcionalidade Simulada)`);
        }
    };

    const handleArchiveReport = async () => {
        if (!activeProfile || !previewData) return;

        try {
            const content = documentGenerator.generateManagementReport(
                activeReport,
                previewData,
                year
            );

            await documentService.saveDocument(
                OfficialDocType.RELATORIO_MENSAL,
                content.titulo,
                activeProfile.id,
                content
            );

            alert("Relatório técnico ARQUIVADO OFICIALMENTE com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao arquivar documento.");
        }
    };

    const renderPreview = () => {
        if (isLoading) return <div className="p-10 text-center text-slate-400">Gerando visualização de dados...</div>;
        if (!previewData) return <div className="p-10 text-center text-slate-400">Nenhum dado disponível.</div>;

        switch (activeReport) {
            case 'MENUS':
                if (!Array.isArray(previewData)) {
                    return <div className="p-10 text-center text-red-500">Erro: Formato de dados inválido para Mensus.</div>;
                }
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                            <span className="text-xs font-bold text-slate-500">Total de Cardápios Aprovados</span>
                            <span className="text-xl font-black text-slate-800">{(previewData as any[]).length}</span>
                        </div>
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                        <th className="p-3">Título</th>
                                        <th className="p-3">Escola</th>
                                        <th className="p-3">Data Aprovação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(previewData as any[]).map((m: any) => (
                                        <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 text-xs">
                                            <td className="p-3 font-bold text-slate-700">{m.titulo}</td>
                                            <td className="p-3 text-slate-500">{m.escolas?.nome || 'Genérico'}</td>
                                            <td className="p-3 text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'ACCOUNTABILITY':
                const accData = previewData as any;
                console.log("Rendering Accountability Data:", accData);

                if (!accData || typeof accData.totalResources !== 'number') {
                    return (
                        <div className="p-10 text-center text-red-400">
                            Erro nos dados de Prestação de Contas.
                            <pre className="text-[10px] text-left mt-2 bg-slate-50 p-2">{JSON.stringify(accData, null, 2)}</pre>
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Recursos (R$)</span>
                            <p className="text-3xl font-black text-slate-800 mt-2">R$ {(accData.totalResources || 0).toFixed(2)}</p>
                        </div>
                        <div className={`p-6 rounded-2xl text-center ${accData.isCompliant ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                            <span className="text-[10px] uppercase font-bold opacity-70">Meta Agricultura Familiar (30%)</span>
                            <p className="text-3xl font-black mt-2">R$ {(accData.familyAgricultureReal || 0).toFixed(2)}</p>
                            <div className="mt-2 text-xs font-bold bg-white/50 py-1 px-3 rounded-full inline-block">
                                {accData.isCompliant ? 'META ATINGIDA' : 'ABAIXO DA META'}
                            </div>
                        </div>
                    </div>
                );
            case 'CONSUMPTION':
                // Assuming empty for now in setup
                return (
                    <div className="text-center py-10">
                        <AlertTriangle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-slate-600">Dados insuficientes para correlação</h3>
                        <p className="text-xs text-slate-400 mt-2">Necessário ciclo completo de Execução de Cardápio (Merendeira) + Movimentação (Estoque).</p>
                    </div>
                );
            default:
                return <pre className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl overflow-auto">{JSON.stringify(previewData, null, 2)}</pre>;
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#F8FAFC]">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center shadow-sm shrink-0 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Central de Relatórios</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documentação Oficial & Prestação de Contas</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase">Fechar</button>
            </div>

            <div className="flex flex-1 overflow-hidden print:overflow-visible print:h-auto">
                {/* SIDEBAR */}
                <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2 overflow-y-auto print:hidden">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 px-3">Relatórios Obrigatórios</span>

                    <button
                        onClick={() => setActiveReport('MENUS')}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeReport === 'MENUS' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FileText className="w-4 h-4" /> Cardápios Aprovados
                    </button>
                    <button
                        onClick={() => setActiveReport('COMPLIANCE')}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeReport === 'COMPLIANCE' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Conformidade PNAE
                    </button>
                    <button
                        onClick={() => setActiveReport('CONSUMPTION')}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeReport === 'CONSUMPTION' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> Consumo vs Planejado
                    </button>
                    <button
                        onClick={() => setActiveReport('ACCOUNTABILITY')}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeReport === 'ACCOUNTABILITY' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <PieChart className="w-4 h-4" /> Prestação de Contas
                    </button>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => navigate('/vigilancia-preventiva')}
                            className="w-full bg-slate-900 shadow-lg text-white px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all"
                        >
                            <ShieldAlert className="w-4 h-4" /> Vigilância Preventiva
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 p-8 overflow-y-auto print:overflow-visible print:p-0 print:h-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* TOOLBAR */}
                        <div className="flex justify-between items-center mb-8 print:hidden">
                            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Exercício:</span>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="bg-slate-50 border-none text-sm font-black text-slate-700 rounded-lg py-1 px-3 outline-none"
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => handleExport('CSV')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                                    <Download className="w-4 h-4" /> Planilha (CSV)
                                </button>

                                {activeProfile?.role === UserRole.NUTRICIONISTA && (
                                    <button
                                        onClick={handleArchiveReport}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Arquivar Oficialmente
                                    </button>
                                )}

                                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                                    <FileText className="w-4 h-4" /> Gerar PDF Oficial
                                </button>
                            </div>
                        </div>

                        {/* CONTAINER PARA IMPRESSÃO - GARANTE RODAPÉ NO FIM DA PÁGINA */}
                        <div className="print:flex print:flex-col print:min-h-[29.7cm]">
                            {/* OFFICIAL LETTERHEAD FOR PRINTING */}
                            <OfficialLetterhead
                                config={letterhead}
                                title={`Relatório de Gestão: ${activeReport}`}
                                className="hidden print:block mb-8"
                            />

                            {/* PREVIEW AREA */}
                            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 min-h-[400px] print:shadow-none print:border-none print:p-0 print:flex-1">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 print:hidden">
                                    Visualização Prévia: {activeReport}
                                </h3>
                                {renderPreview()}
                            </div>

                            <div className="hidden print:block mt-12 pb-8">
                                <OfficialLetterhead
                                    config={letterhead}
                                    type="footer"
                                    className="opacity-80"
                                />
                            </div>
                        </div>

                        {isViewerOpen && generatedContent && (
                            <OfficialDocumentViewer
                                content={generatedContent}
                                config={letterhead}
                                onClose={() => setIsViewerOpen(false)}
                            />
                        )}

                        <div className="mt-8 text-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                            Sistema NutriAssist SME • Relatórios Auditáveis com Rastreabilidade de Origem
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportingCenter;
