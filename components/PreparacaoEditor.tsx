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
    Image as ImageIcon
} from 'lucide-react';
import { fndePreparacaoService, FNDEPreparacao, FNDEPreparacaoIngrediente, PreparacaoNutrientes } from '../services/fndePreparacaoService';
import { fndeService } from '../services/fndeService';
import { aiService } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';

interface PreparacaoEditorProps {
    id: string | null;
    onClose: () => void;
    onSave: () => void;
}

const PreparacaoEditor: React.FC<PreparacaoEditorProps> = ({ id, onClose, onSave }) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiCooldown, setAiCooldown] = useState(0); // Segundos restantes de cooldown

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

    // AI Cooldown effect
    useEffect(() => {
        if (aiCooldown > 0) {
            const timer = setTimeout(() => setAiCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [aiCooldown]);

    // FNDE Food selection state
    const [fndeAlimentos, setFndeAlimentos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectedAlimentoId, setSelectedAlimentoId] = useState('');
    const [quantidade, setQuantidade] = useState<number>(0);

    // Nutritional Preview
    const [nutrientes, setNutrientes] = useState<PreparacaoNutrientes | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const alimentos = await fndeService.listAlimentos();
                setFndeAlimentos(alimentos);

                if (id) {
                    const prep = await fndePreparacaoService.getById(id);
                    setNome(prep.nome);
                    setDescricao(prep.descricao || '');
                    setModoPreparo(prep.modo_preparo || '');
                    setRendimento(prep.rendimento_porcoes);
                    setIngredientes(prep.ingredientes || []);
                    setCategoria(prep.categoria_cardapio || '');
                    setEtapa(prep.etapa_ensino || '');
                    setModalidade(prep.modalidade_ensino || '');
                    setFaixaEtaria(prep.faixa_etaria || '');
                    setImagemUrl(prep.imagem_url || '');
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                addToast("Erro ao carregar dados da ficha técnica.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [id]);

    // Update nutritional preview when ingredients change
    useEffect(() => {
        const updateNutrition = async () => {
            if (ingredientes.length === 0) {
                setNutrientes(null);
                return;
            }
            try {
                const preview = await fndePreparacaoService.calculatePreview(
                    ingredientes.map(i => ({ alimento_id: i.alimento_id!, quantidade_g: i.quantidade_per_capita! }))
                );
                setNutrientes(preview);
            } catch (err) {
                console.error("Erro ao calcular nutrientes:", err);
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
        if (!selectedAlimentoId || quantidade <= 0) {
            addToast("Selecione um alimento e informe a gramatura.", "warning");
            return;
        }

        const alimento = fndeAlimentos.find(a => a.id === selectedAlimentoId);
        const newIng: Partial<FNDEPreparacaoIngrediente> = {
            alimento_id: selectedAlimentoId,
            quantidade_per_capita: quantidade,
            alimento: {
                nome: alimento.descricao,
                grupo_alimentar: alimento.grupo_alimentar
            }
        };

        setIngredientes([...ingredientes, newIng]);
        setSelectedAlimentoId('');
        setQuantidade(0);
        setSearchTerm('');
        setIsPickerOpen(false);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngs = [...ingredientes];
        newIngs.splice(index, 1);
        setIngredientes(newIngs);
    };

    const handleUpdateIngredient = (index: number, quantity: number) => {
        const newIngs = [...ingredientes];
        newIngs[index] = { ...newIngs[index], quantidade_per_capita: quantity };
        setIngredientes(newIngs);
    };

    const handleAISuggestion = async () => {
        if (ingredientes.length === 0) {
            addToast("Adicione ingredientes antes de solicitar uma sugestão.", "warning");
            return;
        }

        setIsGeneratingAI(true);
        try {
            const ingredientNames = ingredientes.map(ing => ing.alimento?.nome || "Ingrediente");
            // Agora o aiService faz 3 tentativas internas com delay de 5s entre elas
            const suggestion = await aiService.generateRecipeSteps(nome || "Preparação sem nome", ingredientNames);
            setModoPreparo(suggestion);
            addToast("Sugestão da IA gerada com sucesso!", "success");
            setAiCooldown(0);
        } catch (err: any) {
            console.error("Erro IA:", err);
            const message = err.message || "Erro ao gerar sugestão.";
            addToast(message, "error");

            // Se falhou mesmo após as retentativas internas do serviço
            if (message.includes("demanda") || message.includes("Limite") || message.includes("indisponível") || message.includes("liberados")) {
                setAiCooldown(60); // Aguarda 1 minuto se o Google bloquear de vez
            }
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!nome) {
            addToast("Dê um nome à preparação antes de gerar a imagem.", "warning");
            return;
        }
        setIsGeneratingImage(true);
        try {
            const ingredientNames = ingredientes.map(ing => ing.alimento?.nome || "Ingrediente");
            const url = await aiService.generateRecipeImage(nome, ingredientNames);
            setImagemUrl(url);
            addToast("Imagem gerada com sucesso!", "success");
        } catch (err: any) {
            console.error("Erro Imagem:", err);
            addToast(err.message || "Erro ao gerar imagem.", "error");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSave = async () => {
        if (!nome) {
            addToast("O nome da preparação é obrigatório.", "warning");
            return;
        }
        if (!categoria) {
            addToast("A categoria do cardápio é obrigatória.", "warning");
            return;
        }
        if (ingredientes.length === 0) {
            addToast("Adicione pelo menos um ingrediente.", "warning");
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
                    categoria_cardapio: categoria as 'CRECHE' | 'ENSINO',
                    etapa_ensino: etapa,
                    modalidade_ensino: modalidade,
                    faixa_etaria: faixaEtaria,
                    imagem_url: imagemUrl
                },
                ingredientes.map(ing => ({
                    alimento_id: ing.alimento_id,
                    quantidade_per_capita: ing.quantidade_per_capita
                }))
            );
            addToast("Ficha técnica salva com sucesso!", "success");
            onSave();
        } catch (err) {
            console.error("Erro ao salvar:", err);
            addToast("Erro ao salvar ficha técnica.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 -m-8 p-12 space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
            <div className="flex justify-between items-center bg-white p-10 rounded-[48px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-2 border-white">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            {id ? "Editar Ficha Técnica" : "Nova Ficha Técnica"}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            Composição nutricional operacional
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={onClose} variant="outline" className="bg-white border-slate-200">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                    >
                        {isSaving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Ficha Técnica</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* FORMULÁRIO PRINCIPAL */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white rounded-[48px] border-2 border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12 space-y-12">
                        {/* CLASSIFICAÇÃO PNAE */}
                        <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100/50 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Classificação PNAE (Obrigatório)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Cardápio</label>
                                    <select
                                        value={categoria}
                                        onChange={(e) => {
                                            setCategoria(e.target.value as any);
                                            setEtapa('');
                                            setModalidade('');
                                            setFaixaEtaria('');
                                        }}
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none focus:border-emerald-600 transition-all uppercase cursor-pointer"
                                    >
                                        <option value="">SELECIONE O TIPO...</option>
                                        <option value="CRECHE">CARDÁPIO - CRECHE</option>
                                        <option value="ENSINO">CARDÁPIO - ETAPA DE ENSINO</option>
                                    </select>
                                </div>

                                {categoria === 'ENSINO' && (
                                    <div className="space-y-2 animate-in slide-in-from-left-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etapa de Ensino</label>
                                        <select
                                            value={etapa}
                                            onChange={(e) => setEtapa(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none focus:border-emerald-600 transition-all uppercase cursor-pointer"
                                        >
                                            <option value="">SELECIONE A ETAPA...</option>
                                            <option value="Pré-Escola">Pré-Escola</option>
                                            <option value="Ensino Fundamental I e II">Ensino Fundamental I e II</option>
                                            <option value="Ensino Médio">Ensino Médio</option>
                                        </select>
                                    </div>
                                )}

                                {categoria && (
                                    <div className="space-y-2 animate-in slide-in-from-left-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade de Ensino</label>
                                        <select
                                            value={modalidade}
                                            onChange={(e) => setModalidade(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none focus:border-emerald-600 transition-all uppercase cursor-pointer"
                                        >
                                            <option value="">SELECIONE A MODALIDADE...</option>
                                            <option value="indígena">Indígena</option>
                                            <option value="quilombola">Quilombola</option>
                                            {categoria === 'ENSINO' && (
                                                <>
                                                    <option value="EJA">EJA</option>
                                                    <option value="Programa Mais Educação">Programa Mais Educação</option>
                                                    <option value="Ensino Médio Integrado">Ensino Médio Integrado</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {categoria && (
                                    <div className="space-y-2 animate-in slide-in-from-left-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faixa Etária</label>
                                        <select
                                            value={faixaEtaria}
                                            onChange={(e) => setFaixaEtaria(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-900 outline-none focus:border-emerald-600 transition-all uppercase cursor-pointer"
                                        >
                                            <option value="">SELECIONE A FAIXA...</option>
                                            {categoria === 'CRECHE' ? (
                                                <>
                                                    <option value="7 - 11 meses">7 - 11 meses</option>
                                                    <option value="01 - 3 anos">01 - 3 anos</option>
                                                </>
                                            ) : (
                                                <option value="da etapa de ensino correspondente">Da etapa de ensino correspondente</option>
                                            )}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Informações Gerais</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-8 relative group">
                                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1 block mb-3">Nome da Preparação <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value.toUpperCase())}
                                        className="w-full bg-slate-100 border-2 border-slate-200 rounded-[24px] px-8 py-5 text-base font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-slate-300"
                                        placeholder="EX: ARROZ COLORIDO COM LEGUMES"
                                    />
                                </div>
                                <div className="md:col-span-4 relative group">
                                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1 block mb-3">Rendimento (Porções)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={rendimento}
                                            onChange={(e) => setRendimento(parseInt(e.target.value) || 1)}
                                            className="w-full bg-slate-100 border-2 border-slate-200 rounded-[24px] px-8 py-5 text-base font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">UN</span>
                                    </div>
                                </div>
                                <div className="md:col-span-12 relative group">
                                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1 block mb-3">Descrição Operacional</label>
                                    <textarea
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        className="w-full bg-slate-100 border-2 border-slate-200 rounded-[24px] px-8 py-6 text-base font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition-all h-32 resize-none shadow-sm placeholder:text-slate-300"
                                        placeholder="Ex: Preparação rica em betacaroteno, servida no almoço das creches..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COMPOSITOR DE INGREDIENTES */}
                        <div className="pt-12 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Ingredientes (Item FNDE)</h3>
                                </div>
                                <button
                                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-lg transition-all hover:-translate-y-0.5 ${isPickerOpen ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}
                                >
                                    {isPickerOpen ? <><X size={16} /> Fechar Painel</> : <><Plus size={16} /> Adicionar Alimento</>}
                                </button>
                            </div>

                            {/* PICKER PANEL */}
                            {isPickerOpen && (
                                <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 animate-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-8 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar na Base FNDE</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-600 shadow-sm"
                                                    placeholder="PESQUISAR ALIMENTO..."
                                                />
                                                {searchTerm && (
                                                    <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                        {filteredAlimentos.map(a => (
                                                            <button
                                                                key={a.id}
                                                                onClick={() => {
                                                                    setSelectedAlimentoId(a.id);
                                                                    setSearchTerm(a.descricao);
                                                                }}
                                                                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-slate-50 transition-colors border-b border-slate-50 flex justify-between ${selectedAlimentoId === a.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
                                                            >
                                                                <span>{a.descricao}</span>
                                                                <span className="text-slate-300 ml-2">{a.grupo_alimentar}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gramas (Per Capita)</label>
                                            <input
                                                type="number"
                                                value={quantidade}
                                                onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 outline-none focus:border-indigo-600 shadow-sm"
                                                placeholder="G"
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex items-end">
                                            <button
                                                onClick={handleAddIngredient}
                                                className="w-full h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ING LIST */}
                            <div className="space-y-4">
                                {ingredientes.length > 0 ? ingredientes.map((ing, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                <Utensils size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{ing.alimento?.nome}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ing.alimento?.grupo_alimentar}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 hover:bg-white border-2 border-transparent hover:border-emerald-500 transition-all">
                                                <input
                                                    type="number"
                                                    value={ing.quantidade_per_capita}
                                                    onChange={(e) => handleUpdateIngredient(idx, parseFloat(e.target.value) || 0)}
                                                    className="w-16 bg-transparent text-sm font-black text-slate-900 text-right outline-none"
                                                />
                                                <span className="text-[10px] font-black text-slate-400 uppercase ml-2">g</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveIngredient(idx)}
                                                className="p-2 bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-16 text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">🥗</div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inicie a composição adicionando itens do FNDE</p>
                                    </div>
                                )}
                            </div>

                            {/* MODO DE PREPARO */}
                            <div className="pt-8 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <span className="w-8 h-px bg-slate-100"></span> Modo de Preparo (Passo a Passo)
                                    </h3>
                                    <button
                                        onClick={handleAISuggestion}
                                        disabled={isGeneratingAI || aiCooldown > 0}
                                        className={`flex items-center gap-2 px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 ${aiCooldown > 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20'}`}
                                    >
                                        {isGeneratingAI ? (
                                            <><RefreshCwIcon className="w-3 h-3 animate-spin" /> Gerando...</>
                                        ) : aiCooldown > 0 ? (
                                            <><RefreshCwIcon className="w-3 h-3" /> Aguarde {aiCooldown}s</>
                                        ) : (
                                            <><Sparkles className="w-3 h-3" /> Sugerir com IA</>
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1">
                                        <textarea
                                            value={modoPreparo}
                                            onChange={(e) => setModoPreparo(e.target.value)}
                                            className={`w-full bg-slate-100 border-2 border-slate-200 rounded-[32px] px-8 py-8 text-base font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition-all h-64 lg:h-80 resize-none shadow-sm placeholder:text-slate-300 ${isGeneratingAI ? 'opacity-50' : ''}`}
                                            placeholder="Descreva aqui o procedimento técnico de preparo..."
                                        />
                                    </div>

                                    <div className="lg:w-80 flex flex-col gap-4">
                                        <div className="aspect-square bg-white rounded-[32px] border-2 border-slate-200 overflow-hidden relative group shadow-sm">
                                            {imagemUrl ? (
                                                <>
                                                    <img src={imagemUrl} alt="Visual da Receita" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setImagemUrl('')}
                                                        className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : isGeneratingImage ? (
                                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                                    <RefreshCwIcon className="w-10 h-10 animate-spin text-indigo-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">IA em ação...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300 p-8 text-center">
                                                    <ImageIcon className="w-16 h-16 opacity-20" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Sem Imagem</p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleGenerateImage}
                                            disabled={isGeneratingImage || !nome}
                                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-indigo-50 text-indigo-600 rounded-2xl border-2 border-indigo-100 hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            {isGeneratingImage ? "Gerando..." : "Gerar Foto com IA"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAINEL NUTRICIONAL LATERAL - GLASSMORPISM */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="relative group sticky top-8">
                            <Card padding="none" className="bg-white border-2 border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[48px] overflow-hidden">
                                <div className="p-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-14 h-14 bg-emerald-600 text-white rounded-[22px] flex items-center justify-center shadow-lg shadow-emerald-600/20">
                                            <Zap className="w-8 h-8 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Status Nutricional</h4>
                                            <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Conformidade FNDE
                                            </p>
                                        </div>
                                    </div>

                                    {nutrientes ? (
                                        <div className="space-y-6">
                                            {/* ENERGIA DESTAQUE */}
                                            <div className="text-center pb-12 mb-8 relative border-b border-slate-100/80">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Energia Per Capita</span>
                                                <div className="relative inline-block">
                                                    <div className="flex items-baseline justify-center gap-2">
                                                        <span className="text-8xl font-black text-slate-900 tracking-tighter">{Math.round(nutrientes.energia_kcal)}</span>
                                                        <span className="text-2xl font-black text-emerald-600 uppercase tracking-widest">kcal</span>
                                                    </div>
                                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-emerald-600 rounded-full blur-xl opacity-20"></div>
                                                </div>
                                            </div>

                                            {/* LISTA DE NUTRIENTES - HIGH CONTRAST GRID */}
                                            <div className="grid grid-cols-1 gap-5">
                                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[28px] border border-slate-100/80 hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
                                                            <Scale size={20} />
                                                        </div>
                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Proteínas</span>
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900">{(nutrientes.proteinas_g || 0).toFixed(2)}<small className="text-[10px] ml-1 opacity-40">g</small></span>
                                                </div>

                                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[28px] border border-slate-100/80 hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
                                                            <Droplets size={20} />
                                                        </div>
                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Lipídios</span>
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900">{(nutrientes.lipidios_g || 0).toFixed(2)}<small className="text-[10px] ml-1 opacity-40">g</small></span>
                                                </div>

                                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[28px] border border-slate-100/80 hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
                                                            <Wheat size={20} />
                                                        </div>
                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Fibras</span>
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900">{(nutrientes.fibras_g || 0).toFixed(2)}<small className="text-[10px] ml-1 opacity-40">g</small></span>
                                                </div>

                                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[28px] border border-slate-100/80 hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
                                                            <Scale size={20} />
                                                        </div>
                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Magnésio</span>
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900">{(nutrientes.magnesio_mg || 0).toFixed(1)}<small className="text-[10px] ml-1 opacity-40">mg</small></span>
                                                </div>

                                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[28px] border border-slate-100/80 hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200/50">
                                                            <Info size={20} />
                                                        </div>
                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Sódio</span>
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900">{Math.round(nutrientes.sodio_mg)}<small className="text-[10px] ml-1 opacity-40">mg</small></span>
                                                </div>
                                            </div>

                                            <div className="pt-10 border-t border-slate-100 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                                    Cálculo automático baseado na<br />base de dados oficial Maranhão/FNDE.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                                            <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-100 flex items-center justify-center text-slate-200 mb-8 animate-pulse">
                                                <Utensils size={32} />
                                            </div>
                                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Aguardando Dados</h5>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                                Vincule ingredientes FNDE para visualizar a composição nutricional.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px]">
                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Atenção Técnica
                            </h4>
                            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                                Conforme Resolução 06/2020, o rendimento da porção deve ser validado pelo teste de aceitabilidade nas unidades escolares.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RefreshCw = ({ className }: { className?: string }) => (
    <RefreshCwIcon className={className || ''} />
);

export default PreparacaoEditor;
