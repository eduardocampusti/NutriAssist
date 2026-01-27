import React, { useState, useEffect, useMemo } from 'react';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';
import { simulationService, ImpactSimulation } from '../services/simulationService';
import { normativeService } from '../services/normativeService';
import { generateTechnicalDocument } from '../services/geminiService';
import {
    NormativeFood,
    UserRole,
    EducationalStage
} from '../types';
import {
    Play,
    AlertOctagon,
    Users,
    School,
    Zap,
    ArrowRight,
    FileText,
    RefreshCw,
    Search,
    Calendar,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { OfficialDocumentViewer } from './OfficialDocumentViewer';

const NutritionalImpactSimulator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { activeProfile } = useUsers();
    const { letterhead } = usePNAE();

    const [normativeFoods, setNormativeFoods] = useState<NormativeFood[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [durationDays, setDurationDays] = useState<number>(7);
    const [simulation, setSimulation] = useState<ImpactSimulation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [technicalOpinion, setTechnicalOpinion] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadFoods = async () => {
            const foods = await normativeService.getAll();
            setNormativeFoods(foods);
        };
        loadFoods();
    }, []);

    const filteredFoods = useMemo(() => {
        return normativeFoods.filter(f => f.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [normativeFoods, searchTerm]);

    const handleRunSimulation = async () => {
        if (!selectedItemId) return;
        setIsLoading(true);
        try {
            const selectedItem = normativeFoods.find(f => f.id === selectedItemId);
            const itemName = selectedItem?.nome || 'Item Selecionado';

            const result = await simulationService.runSimulation(selectedItemId, durationDays, itemName);
            setSimulation(result);
        } catch (err) {
            console.error("Erro na simulação:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateOpinion = async () => {
        if (!simulation) return;
        setIsGenerating(true);
        try {
            const context = {
                item: simulation.itemName,
                duracao: `${simulation.durationDays} dias`,
                alunos_impactados: simulation.totalStudentsAffected,
                escolas: simulation.schoolsAffectedCount,
                modalidades: simulation.stagesAffected.join(', '),
                risco: simulation.impactScore,
                perdas_nutricionais: simulation.nutritionalLoss.map(l => `${l.nutrient}: -${l.impactPercent}%`).join('; '),
                substituicoes: simulation.suggestedSubstitutes.map(s => s.nome).join(', ')
            };

            const doc = await generateTechnicalDocument(
                'PARECER',
                'PARECER',
                context,
                `Simulação de ausência de ${simulation.itemName} por ${simulation.durationDays} dias.`,
                activeProfile?.role || UserRole.NUTRICIONISTA
            );
            setTechnicalOpinion(doc);
        } catch (err) {
            console.error("Erro ao gerar parecer:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const getImpactColor = (score: string) => {
        switch (score) {
            case 'ALTO': return 'text-red-500 bg-red-50 border-red-100';
            case 'MÉDIO': return 'text-amber-500 bg-amber-50 border-amber-100';
            default: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* CABEÇALHO */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20">🧪</div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Simulador de Impacto</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Previsão Nutricional & Contingência PNAE</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Fechar Simulador
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* CONFIGURAÇÃO DA SIMULAÇÃO */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Parâmetros de Ausência</h3>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Alimentar</span>
                                <div className="mt-2 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar item..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <select
                                    value={selectedItemId}
                                    onChange={e => setSelectedItemId(e.target.value)}
                                    className="w-full mt-2 bg-slate-50 border-none rounded-2xl px-4 py-4 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="">Selecione o Insumo</option>
                                    {filteredFoods.map(f => (
                                        <option key={f.id} value={f.id}>{f.nome}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Período de Ruptura</span>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {[1, 7, 30].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDurationDays(d)}
                                            className={`py-3 rounded-xl border-2 text-[10px] font-black transition-all ${durationDays === d
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {d === 1 ? '1 DIA' : d === 7 ? '1 SEMANA' : '1 MÊS'}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={durationDays}
                                    onChange={e => setDurationDays(Number(e.target.value))}
                                    className="w-full mt-2 bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Outro (dias)"
                                />
                            </label>

                            <button
                                onClick={handleRunSimulation}
                                disabled={!selectedItemId || isLoading}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-[20px] shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>ANALISANDO CADEIA...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        <span>EXECUTAR SIMULAÇÃO</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ALERTA DE SEGURANÇA */}
                    <div className="bg-indigo-900 p-6 rounded-[32px] text-white space-y-3 relative overflow-hidden">
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Zap className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest">Aviso de Integridade</h4>
                                <p className="text-[10px] text-indigo-200 font-medium leading-relaxed mt-1">
                                    As simulações **não alteram** dados reais de estoque ou cardápio. Use para planejar contingências e gerar pareceres de substituição técnica.
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    </div>
                </div>

                {/* RESULTADOS DA SIMULAÇÃO */}
                <div className="lg:col-span-8">
                    {!simulation ? (
                        <div className="h-full bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">🧩</div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Dashboard Vazio</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Selecione um item e período para iniciar a análise</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            {/* SCORE DE IMPACTO */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className={`p-6 rounded-[32px] border shadow-sm ${getImpactColor(simulation.impactScore)}`}>
                                    <div className="flex justify-between items-start">
                                        <AlertOctagon className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Risco Logístico</span>
                                    </div>
                                    <h4 className="text-2xl font-black mt-4 uppercase leading-none">{simulation.impactScore} IMPACTO</h4>
                                </div>
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start text-slate-400">
                                        <Users className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Alunos Afetados</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-800 mt-4 leading-none">{simulation.totalStudentsAffected.toLocaleString()}</h4>
                                </div>
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start text-slate-400">
                                        <School className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Escolas Atingidas</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-800 mt-4 leading-none">{simulation.schoolsAffectedCount} UNIDADES</h4>
                                </div>
                            </div>

                            {/* DETALHAMENTO NUTRICIONAL */}
                            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm lg:col-span-2">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-emerald-500" />
                                    Comprometimento Nutricional Esperado
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        {simulation.nutritionalLoss.map((loss, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-black uppercase">
                                                    <span className="text-slate-500">{loss.nutrient}</span>
                                                    <span className="text-red-500">-{loss.impactPercent}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-400 rounded-full transition-all duration-1000"
                                                        style={{ width: `${loss.impactPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Modalidades Afetadas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {simulation.stagesAffected.map(stage => (
                                                <span key={stage} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-600 uppercase">
                                                    {stage}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            <p className="text-[10px] font-bold text-red-600 uppercase">Revisão de Cardápio Urgente: {simulation.menusAffectedCount} Planos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SUBSTITUIÇÕES SUGERIDAS */}
                            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        Substituições Técnicas Equivalentes
                                    </h3>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">Mesmo Grupo Alimentar</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {simulation.suggestedSubstitutes.map(sub => (
                                        <div key={sub.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-default group">
                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{sub.grupo_alimentar}</span>
                                            <h5 className="text-xs font-black mt-1 group-hover:text-emerald-300 transition-colors">{sub.nome}</h5>
                                            <div className="flex items-center gap-1.5 mt-3 text-[9px] font-bold text-slate-400 uppercase">
                                                <FileText className="w-3 h-3" />
                                                <span>Padrão PNAE</span>
                                            </div>
                                        </div>
                                    ))}
                                    {simulation.suggestedSubstitutes.length === 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl col-span-3">
                                            <p className="text-[10px] font-black text-red-400 uppercase">Nenhuma substituição direta encontrada no catálogo normativo.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={handleGenerateOpinion}
                                        disabled={isGenerating}
                                        className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all group disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        )}
                                        <span>{isGenerating ? 'GERANDO FUNDAMENTAÇÃO...' : 'GERAR PARECER TÉCNICO (IA)'}</span>
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-8 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all text-xs uppercase tracking-widest"
                                    >
                                        IMPRIMIR ANÁLISE
                                    </button>
                                </div>
                            </div>

                            {/* MODAL / VIEW DO PARECER TÉCNICO */}
                            {technicalOpinion && (
                                <OfficialDocumentViewer
                                    content={technicalOpinion}
                                    config={letterhead}
                                    onClose={() => setTechnicalOpinion(null)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionalImpactSimulator;
