import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import {
    Utensils,
    Save,
    X,
    Plus,
    Search,
    Trash2,
    Zap,
    Scale,
    Droplets,
    Wheat,
    Info,
    ChevronDown,
    ArrowLeft,
    RefreshCw as RefreshCwIcon,
    Sparkles,
    Image as ImageIcon,
    Upload
} from 'lucide-react';
import { fndePreparacaoService, FNDEPreparacao, FNDEPreparacaoIngrediente, PreparacaoNutrientes } from '../services/fndePreparacaoService';
import { fndeService } from '../services/fndeService';
import { aiService } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../contexts/UserContext';

interface PreparacaoEditorProps {
    id: string | null;
    onClose: () => void;
    onSave: () => void;
}

const normalizeDecimal = (v: unknown) =>
    parseFloat(String(v).trim().replace(',', '.'));

const isPositiveDecimal = (v: number) =>
    Number.isFinite(v) && v > 0;

const finiteDecimalOr = (v: unknown, fallback = 0) => {
    const normalized = normalizeDecimal(v);
    return Number.isFinite(normalized) ? normalized : fallback;
};

const PreparacaoEditor: React.FC<PreparacaoEditorProps> = ({ id, onClose, onSave }) => {
    const { addToast } = useToast();
    const { activeProfile } = useUsers();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiCooldown, setAiCooldown] = useState(0); // Segundos restantes de cooldown
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Preparação State
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [modoPreparo, setModoPreparo] = useState('');
    const [rendimento, setRendimento] = useState(1);
    const [imagemUrl, setImagemUrl] = useState('');
    const [ingredientes, setIngredientes] = useState<Partial<FNDEPreparacaoIngrediente>[]>([]);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // PNAE Classifications
    const [categoria, setCategoria] = useState<'CRECHE' | 'ENSINO' | ''>('');
    const [etapa, setEtapa] = useState('');
    const [modalidade, setModalidade] = useState('');
    const [faixaEtaria, setFaixaEtaria] = useState('');

    // FNDE Food selection state
    const [fndeAlimentos, setFndeAlimentos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedAlimentoId, setSelectedAlimentoId] = useState('');
    const [quantidadeBruta, setQuantidadeBruta] = useState('');
    const [quantidadeLiquida, setQuantidadeLiquida] = useState('');

    // Nutritional Preview
    const [nutrientes, setNutrientes] = useState<PreparacaoNutrientes | null>(null);

    // AI Cooldown effect
    useEffect(() => {
        if (aiCooldown > 0) {
            const timer = setTimeout(() => setAiCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [aiCooldown]);

    // DRAFT SYSTEM
    useEffect(() => {
        const draftKey = `preparacao_draft_${id || 'new'}`;
        const draft = {
            nome, descricao, modoPreparo, rendimento, categoria, etapa, modalidade, faixaEtaria, ingredientes, imagemUrl
        };
        const hasContent = nome || modoPreparo || ingredientes.length > 0;

        if (hasContent && !isLoading) {
            localStorage.setItem(draftKey, JSON.stringify(draft));
        }
    }, [nome, descricao, modoPreparo, rendimento, categoria, etapa, modalidade, faixaEtaria, ingredientes, imagemUrl, id, isLoading]);

    const restoreDraft = () => {
        const draftKey = `preparacao_draft_${id || 'new'}`;
        const saved = localStorage.getItem(draftKey);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.nome || data.modoPreparo || (data.ingredientes && data.ingredientes.length > 0)) {
                    setNome(data.nome || '');
                    setDescricao(data.descricao || '');
                    setModoPreparo(data.modoPreparo || '');
                    setRendimento(data.rendimento || 1);
                    setCategoria(data.categoria || '');
                    setEtapa(data.etapa || '');
                    setModalidade(data.modalidade || '');
                    setFaixaEtaria(data.faixaEtaria || '');
                    setIngredientes(data.ingredientes || []);
                    setImagemUrl(data.imagemUrl || '');
                    addToast("Rascunho restaurado!", "info");
                }
            } catch (e) {
                console.error("Erro rascunho:", e);
            }
        }
    };

    const clearDraft = () => {
        const draftKey = `preparacao_draft_${id || 'new'}`;
        localStorage.removeItem(draftKey);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            console.log("[Editor] Montando componente. ID:", id);
            setIsLoading(true);
            try {
                // Carrega lista de alimentos para o seletor (necessário sempre)
                const alimentos = await fndeService.listAlimentos();
                setFndeAlimentos(alimentos);
                console.log("[Editor] Alimentos carregados:", alimentos.length);

                if (id && id !== 'new') {
                    console.log("[Editor] Buscando dados da ficha:", id);
                    const prep = await fndePreparacaoService.getById(id);
                    
                    if (prep) {
                        console.log("[Editor] Dados da ficha recebidos:", prep.nome);
                        setNome(prep.nome || '');
                        setDescricao(prep.descricao || '');
                        setModoPreparo(prep.modo_preparo || '');
                        setRendimento(prep.rendimento_porcoes || 1);
                        setIngredientes(prep.ingredientes || []);
                        setCategoria(prep.categoria_cardapio || '');
                        setEtapa(prep.etapa_ensino || '');
                        setModalidade(prep.modalidade_ensino || '');
                        setFaixaEtaria(prep.faixa_etaria || '');
                        setImagemUrl(prep.imagem_url || '');
                    } else {
                        console.warn("[Editor] Ficha não encontrada para o ID:", id);
                        addToast("Ficha técnica não encontrada.", "error");
                    }
                } else {
                    console.log("[Editor] Modo criação. Restaurando rascunho se houver.");
                    restoreDraft();
                }
            } catch (err) {
                console.error("[Editor] Erro crítico no carregamento:", err);
                addToast("Erro ao carregar dados. Verifique o console.", "error");
            } finally {
                console.log("[Editor] Carregamento finalizado.");
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [id]);

    useEffect(() => {
        const updateNutrition = async () => {
            if (ingredientes.length === 0) {
                setNutrientes(null);
                return;
            }
            try {
                const preview = await fndePreparacaoService.calculatePreview(
                    ingredientes.map(i => ({ 
                        alimento_id: i.alimento_id!, 
                        quantidade_g: finiteDecimalOr(i.per_capita_liquido, finiteDecimalOr(i.quantidade_per_capita, 0))
                    }))
                );
                setNutrientes(preview);
            } catch (err) {
                console.error("Erro nutri:", err);
            }
        };
        updateNutrition();
    }, [ingredientes]);

    const filteredAlimentos = useMemo(() => {
        return fndeAlimentos.filter(a =>
            a.descricao.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [fndeAlimentos, searchTerm]);

    const handleAddIngredient = () => {
        const bruto = normalizeDecimal(quantidadeBruta);
        const liquido = normalizeDecimal(quantidadeLiquida);

        if (!selectedAlimentoId || !isPositiveDecimal(bruto) || !isPositiveDecimal(liquido)) {
            addToast("Informe os pesos bruto e líquido (maiores que zero).", "warning");
            return;
        }

        const alimento = fndeAlimentos.find(a => a.id === selectedAlimentoId);
        const fc = bruto / liquido;

        const newIng: Partial<FNDEPreparacaoIngrediente> = {
            alimento_id: selectedAlimentoId,
            per_capita_bruto: bruto,
            per_capita_liquido: liquido,
            fator_correcao: fc,
            quantidade_per_capita: liquido,
            alimento: {
                nome: alimento.descricao,
                grupo_alimentar: alimento.grupo_alimentar
            }
        };

        setIngredientes([...ingredientes, newIng]);
        setSelectedAlimentoId('');
        setQuantidadeBruta('');
        setQuantidadeLiquida('');
        setSearchTerm('');
        setIsPickerOpen(false);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngs = [...ingredientes];
        newIngs.splice(index, 1);
        setIngredientes(newIngs);
    };

    const handleUpdateIngredient = (index: number, field: 'per_capita_bruto' | 'per_capita_liquido', value: string) => {
        const normalizedValue = normalizeDecimal(value);
        const safeValue = Number.isFinite(normalizedValue) ? normalizedValue : 0;
        const newIngs = [...ingredientes];
        const updated = { ...newIngs[index], [field]: safeValue };
        
        const pb = field === 'per_capita_bruto' ? safeValue : normalizeDecimal(updated.per_capita_bruto || 0);
        const pl = field === 'per_capita_liquido' ? safeValue : normalizeDecimal(updated.per_capita_liquido || 0);
        updated.fator_correcao = pl > 0 ? pb / pl : 1.0;
        updated.quantidade_per_capita = pl;

        newIngs[index] = updated;
        setIngredientes(newIngs);
    };

    const handleAISuggestion = async () => {
        if (ingredientes.length === 0) return;
        setIsGeneratingAI(true);
        try {
            const ingredientNames = ingredientes.map(ing => ing.alimento?.nome || "Ingrediente");
            const suggestion = await aiService.generateRecipeSteps(nome || "Preparação", ingredientNames);
            setModoPreparo(suggestion);
            addToast("Sugestão gerada!", "success");
        } catch (err) {
            addToast("Erro IA", "error");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!nome) return;
        setIsGeneratingImage(true);
        try {
            const ingredientNames = ingredientes.map(ing => ing.alimento?.nome || "Ingrediente");
            const url = await aiService.generateRecipeImage(nome, ingredientNames);
            setImagemUrl(url);
            addToast("Imagem gerada!", "success");
        } catch (err) {
            addToast("Erro Imagem", "error");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleManualUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagemUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!nome || !categoria || ingredientes.length === 0) {
            addToast("Preencha os campos obrigatórios.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            await fndePreparacaoService.save(
                {
                    id: id || undefined,
                    nome,
                    descricao,
                    modo_preparo: modoPreparo,
                    rendimento_porcoes: rendimento,
                    categoria_cardapio: categoria as any,
                    etapa_ensino: etapa,
                    modalidade_ensino: modalidade,
                    faixa_etaria: faixaEtaria,
                    imagem_url: imagemUrl,
                    created_by: id ? undefined : activeProfile?.id
                },
                ingredientes.map(ing => ({
                    alimento_id: ing.alimento_id!,
                    per_capita_bruto: finiteDecimalOr(ing.per_capita_bruto, 0),
                    per_capita_liquido: finiteDecimalOr(ing.per_capita_liquido, 0),
                    fator_correcao: finiteDecimalOr(ing.fator_correcao, 1.0),
                    quantidade_per_capita: finiteDecimalOr(ing.per_capita_liquido, finiteDecimalOr(ing.quantidade_per_capita, 0))
                }))
            );

            clearDraft();
            addToast("Salvo com sucesso!", "success");
            onSave();
        } catch (err) {
            addToast("Erro ao salvar", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 -m-8 p-12 space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
            <div className="flex justify-between items-center bg-white p-10 rounded-[48px] shadow-lg border-2 border-white">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            {id ? "Editar Ficha Técnica" : "Nova Ficha Técnica"}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={onClose} variant="outline">Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 text-white">
                        {isSaving ? "Salvando..." : "Salvar Ficha Técnica"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white rounded-[48px] border-2 border-slate-100 shadow-xl p-12 space-y-12">
                        {/* CLASSIFICAÇÃO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[40px]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Cardápio</label>
                                <select value={categoria} onChange={(e) => setCategoria(e.target.value as any)} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase">
                                    <option value="">Selecione...</option>
                                    <option value="CRECHE">Creche</option>
                                    <option value="ENSINO">Ensino</option>
                                </select>
                            </div>
                        </div>

                        {/* INFO GERAIS */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            <div className="md:col-span-8">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 block">Nome da Preparação</label>
                                <input type="text" value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} className="w-full bg-slate-100 border-2 border-slate-200 rounded-[24px] px-8 py-5 text-base font-black" />
                            </div>
                            <div className="md:col-span-4">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 block">Rendimento</label>
                                <input type="number" value={rendimento} onChange={(e) => setRendimento(parseInt(e.target.value) || 1)} className="w-full bg-slate-100 border-2 border-slate-200 rounded-[24px] px-8 py-5 text-base font-black" />
                            </div>
                        </div>

                        {/* INGREDIENTES */}
                        <div className="pt-12 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Ingredientes (Item FNDE)</h3>
                                <button onClick={() => setIsPickerOpen(!isPickerOpen)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase">
                                    {isPickerOpen ? "Fechar" : "Adicionar Ingrediente"}
                                </button>
                            </div>

                            {isPickerOpen && (
                                <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                                    <div className="relative">
                                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-4 pr-6 py-4 text-sm font-black" placeholder="Buscar alimento..." />
                                        {searchTerm && (
                                            <div className="absolute top-full left-0 w-full z-50 bg-white border rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                {filteredAlimentos.map(a => (
                                                    <button key={a.id} onClick={() => { setSelectedAlimentoId(a.id); setSearchTerm(a.descricao); }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-slate-50">
                                                        {a.descricao}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per capita bruto (g)</label>
                                            <input type="text" inputMode="decimal" value={quantidadeBruta} onChange={(e) => setQuantidadeBruta(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-black" placeholder="PB" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per capita líquido (g)</label>
                                            <input type="text" inputMode="decimal" value={quantidadeLiquida} onChange={(e) => setQuantidadeLiquida(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-black" placeholder="PL" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FC Calculado</label>
                                            <div className="w-full h-[50px] bg-slate-100 flex items-center px-4 rounded-2xl text-xs font-black text-slate-500 border-2 border-slate-100">
                                                {isPositiveDecimal(normalizeDecimal(quantidadeLiquida)) && isPositiveDecimal(normalizeDecimal(quantidadeBruta))
                                                    ? (normalizeDecimal(quantidadeBruta) / normalizeDecimal(quantidadeLiquida)).toFixed(2)
                                                    : '1.00'}
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <button onClick={handleAddIngredient} className="w-full h-[50px] bg-indigo-600 text-white rounded-2xl font-black uppercase hover:bg-indigo-700 transition-colors shadow-lg">Adicionar</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {ingredientes.map((ing, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 uppercase">{ing.alimento?.nome}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{ing.alimento?.grupo_alimentar}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Bruto</label>
                                                <input type="text" inputMode="decimal" value={ing.per_capita_bruto || ''} onChange={(e) => handleUpdateIngredient(idx, 'per_capita_bruto', e.target.value)} className="w-16 bg-slate-100 rounded-lg px-2 py-1 text-xs font-black text-right" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase">Líquido</label>
                                                <input type="text" inputMode="decimal" value={ing.per_capita_liquido || ''} onChange={(e) => handleUpdateIngredient(idx, 'per_capita_liquido', e.target.value)} className="w-16 bg-slate-100 rounded-lg px-2 py-1 text-xs font-black text-right" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase text-center">FC</label>
                                                <div className="w-12 bg-slate-50 rounded-lg px-1 py-1 text-[10px] font-black text-center">{(ing.fator_correcao || 1).toFixed(2)}</div>
                                            </div>
                                            <button onClick={() => handleRemoveIngredient(idx)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MODO PREPARO */}
                        <div className="pt-12 border-t border-slate-100 space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase">Modo de Preparo</h3>
                            <textarea value={modoPreparo} onChange={(e) => setModoPreparo(e.target.value)} className="w-full bg-slate-100 border-2 border-slate-200 rounded-[24px] px-8 py-6 h-48 resize-none" />
                        </div>
                    </div>
                </div>

                {/* NUTRIENTES */}
                <div className="lg:col-span-4">
                    <Card className="bg-white border-2 border-slate-200 rounded-[48px] p-10 sticky top-8">
                        <h4 className="text-sm font-black text-slate-900 uppercase mb-8">Composição Nutricional</h4>
                        {nutrientes ? (
                            <div className="space-y-4">
                                <div className="text-center py-6 bg-emerald-50 rounded-3xl">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase block">Energia</span>
                                    <span className="text-4xl font-black text-slate-900">{Math.round(nutrientes.energia_kcal)} kcal</span>
                                </div>
                                {/* Simplified nutri list for brevity, same logic as before */}
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex justify-between text-xs font-bold uppercase"><span className="text-slate-400">Proteínas</span><span>{nutrientes.proteinas_g.toFixed(2)}g</span></div>
                                    <div className="flex justify-between text-xs font-bold uppercase"><span className="text-slate-400">Carboidratos</span><span>{nutrientes.carboidratos_g.toFixed(2)}g</span></div>
                                    <div className="flex justify-between text-xs font-bold uppercase"><span className="text-slate-400">Lipídios</span><span>{nutrientes.lipidios_g.toFixed(2)}g</span></div>
                                    <div className="flex justify-between text-xs font-bold uppercase"><span className="text-slate-400">Fibras</span><span>{nutrientes.fibras_g.toFixed(2)}g</span></div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-[10px] font-black text-slate-300 uppercase py-12">Adicione ingredientes para ver a análise</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PreparacaoEditor;
