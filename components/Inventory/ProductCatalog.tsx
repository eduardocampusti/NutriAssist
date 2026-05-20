import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryCategory, InventoryBatch, NovaClassification } from '../../types';
import {
    Package,
    Search,
    Plus,
    Save,
    X,
    Sparkles,
    AlertCircle,
    Clock,
    ChevronRight,
    TrendingDown,
    Activity,
    ChefHat,
    Scale,
    Link,
    BookOpen
} from 'lucide-react';
import { normativeService } from '../../services/normativeService';
import { NormativeFood, NormativeStatus } from '../../types';

interface ProductCatalogProps {
    inventory: InventoryItem[];
    batches: InventoryBatch[];
    onAddItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'saldoAtual'>) => Promise<void>;
    onUpdateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ inventory, batches, onAddItem, onUpdateItem }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);
    const [lastEnrichedName, setLastEnrichedName] = useState('');

    const [normativeOptions, setNormativeOptions] = useState<NormativeFood[]>([]);

    const [newItem, setNewItem] = useState({
        nome: '',
        alimento_normativo_id: '',
        categoria: InventoryCategory.SECO,
        unidadeMedida: 'KG' as const,
        estoqueMinimo: 5,
        origemPadrao: 'LICITACAO' as const,
        kcal: 0, protein: 0, carbs: 0, fats: 0,
        correctionFactor: 1, costPerUnit: 0, isUltraProcessed: false,
        novaGroup: NovaClassification.IN_NATURA, prohibitedForAgeUnder3: false,
        technicalSpecifications: '', unitWeight: 1
    });

    useEffect(() => {
        if (isAdding) {
            normativeService.getAll().then(setNormativeOptions);
        }
    }, [isAdding]);

    const handleSelectNormative = (foodId: string) => {
        const food = normativeOptions.find(f => f.id === foodId);
        if (!food) return;

        setNewItem(prev => ({
            ...prev,
            alimento_normativo_id: food.id,
            nome: food.nome_alimento, // Auto-fill name
            novaGroup: food.classificacao_nova,
            isUltraProcessed: food.classificacao_nova === NovaClassification.ULTRAPROCESSADO,
            // Simple logic: if min age > 0 (e.g. 36 months), it implies restriction under 3
            prohibitedForAgeUnder3: food.faixa_etaria_min_meses >= 36 || food.status_normativo === NormativeStatus.PROIBIDO,
            technicalSpecifications: `${food.nome_alimento} - Conforme Resolução PNAE. Grupo: ${food.grupo_alimentar}.`,
            categoria: mapGroupToCategory(food.grupo_alimentar)
        }));
    };

    const mapGroupToCategory = (group: string): any => {
        if (group.includes('LATICÍNIOS') || group.includes('CARNES')) return InventoryCategory.PEREATIVEL;
        if (group.includes('FRUTAS') || group.includes('HORTALIÇAS')) return InventoryCategory.HORTIFRUTI;
        return InventoryCategory.SECO;
    };

    const handleEnrich = async (targetName?: string) => {
        const nameToUse = (targetName || newItem.nome).trim().toUpperCase();
        if (!nameToUse || nameToUse.length < 3 || nameToUse === lastEnrichedName) return;

        console.log("HANDS-FREE: Enriching", nameToUse);
        setIsEnriching(true);
        setLastEnrichedName(nameToUse);

        try {
            const { enrichFoodData } = await import('../../services/geminiService');
            const data = await enrichFoodData(nameToUse);

            if (data) {
                setNewItem(prev => ({
                    ...prev,
                    kcal: data.kcal ?? 0,
                    protein: data.protein ?? 0,
                    carbs: data.carbs ?? 0,
                    fats: data.fats ?? 0,
                    correctionFactor: data.correctionFactor ?? 1,
                    isUltraProcessed: !!data.isUltraProcessed,
                    categoria: (data.category as any) || prev.categoria,
                    novaGroup: data.isUltraProcessed ? NovaClassification.ULTRAPROCESSADO : NovaClassification.IN_NATURA
                }));
            }
        } catch (e) {
            console.error("Auto-Enrich Failure:", e);
        } finally {
            setIsEnriching(false);
        }
    };

    // Auto-Enrich Debounce Logic (Hands-Free Mode)
    useEffect(() => {
        if (!isAdding) return;

        const trimmedName = newItem.nome.trim();
        // Trigger if: Name is long enough, hasn't been enriched yet, and fields are empty
        const shouldEnrich = trimmedName.length >= 4 &&
            trimmedName !== lastEnrichedName &&
            newItem.kcal === 0 &&
            newItem.protein === 0;

        if (!shouldEnrich) return;

        const timer = setTimeout(() => {
            if (!isEnriching) {
                handleEnrich(trimmedName);
            }
        }, 1200); // 1.2s wait for typing to settle

        return () => clearTimeout(timer);
    }, [newItem.nome, isAdding, lastEnrichedName, isEnriching]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.nome) return;

        try {
            await onAddItem(newItem);
            setNewItem({
                nome: '',
                categoria: InventoryCategory.SECO,
                unidadeMedida: 'KG' as const,
                estoqueMinimo: 5,
                origemPadrao: 'LICITACAO' as const,
                kcal: 0, protein: 0, carbs: 0, fats: 0,
                correctionFactor: 1, costPerUnit: 0, isUltraProcessed: false,
                novaGroup: NovaClassification.IN_NATURA, prohibitedForAgeUnder3: false,
                technicalSpecifications: '', unitWeight: 1,
                alimento_normativo_id: ''
            });
            setLastEnrichedName('');
            setIsAdding(false);
        } catch (error) {
            alert("Erro ao salvar produto.");
        }
    };

    const filteredItems = inventory.filter(i =>
        i.nome.toUpperCase().includes(searchTerm.toUpperCase()) && i.ativo
    );

    const getValTime = (v: number | string | undefined): number => {
        if (!v) return 0;
        return typeof v === 'number' ? v : new Date(v).getTime();
    };

    const getTrafficLight = (itemId: string) => {
        const itemBatches = batches.filter(b => b.itemId === itemId && b.saldoAtual > 0 && b.ativo);
        if (itemBatches.length === 0) return { color: 'text-slate-300', label: 'SEM ESTOQUE', bg: 'bg-slate-50' };

        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        const expired = itemBatches.some(b => getValTime(b.validade) < now);
        if (expired) return { color: 'text-red-600', label: 'Lote Vencido!', bg: 'bg-red-50' };

        const critical = itemBatches.some(b => getValTime(b.validade) < now + thirtyDays);
        if (critical) return { color: 'text-orange-600', label: 'Validade Curta', bg: 'bg-orange-50' };

        return { color: 'text-emerald-600', label: 'Estoque Regular', bg: 'bg-emerald-50' };
    };

    const calculateBalance = (itemId: string) => {
        return batches
            .filter(b => b.itemId === itemId && b.ativo)
            .reduce((acc, b) => acc + b.saldoAtual, 0);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        Catálogo Master
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Padronização técnica de alimentos da rede
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Procurar no catálogo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-64 outline-none transition-all focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Cadastrar Alimento
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-white p-8 rounded-[40px] border border-orange-100 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ChefHat className="w-32 h-32 text-orange-900" />
                    </div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Plus className="w-4 h-4 text-orange-500" />
                            Nova Ficha Técnica de Produto
                        </h3>
                        <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                        <div className="md:col-span-12 lg:col-span-6 relative">
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-3 h-3 text-emerald-500" /> Vínculo Normativo (PNAE)
                                </label>
                                {newItem.alimento_normativo_id && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 rounded-full font-bold">VINCULADO</span>}
                            </div>

                            <select
                                value={newItem.alimento_normativo_id}
                                onChange={e => handleSelectNormative(e.target.value)}
                                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none mb-4 focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="">-- Selecione o Alimento da Base Normativa --</option>
                                {normativeOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.nome_alimento} ({opt.status_normativo})
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Comercial</label>
                            </div>
                            <input
                                type="text"
                                value={newItem.nome}
                                onChange={e => setNewItem({ ...newItem, nome: e.target.value.toUpperCase() })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                                placeholder="EX: ARROZ AGULHINHA INTEGRAL TIPO 1"
                            />
                        </div>

                        <div className="md:col-span-6 lg:col-span-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Categoria de Inventário</label>
                            <select
                                value={newItem.categoria}
                                onChange={e => setNewItem({ ...newItem, categoria: e.target.value as any })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                            >
                                {Object.values(InventoryCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-6 lg:col-span-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Und. Fornecimento</label>
                            <div className="flex gap-2">
                                <select
                                    value={newItem.unidadeMedida}
                                    onChange={e => setNewItem({ ...newItem, unidadeMedida: e.target.value as any })}
                                    className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                                >
                                    <option value="KG">QUILOGRAMA (KG)</option>
                                    <option value="L">LITRO (L)</option>
                                    <option value="UN">UNIDADE (UN)</option>
                                    <option value="PCT">PACOTE (PCT)</option>
                                    <option value="DZ">DÚZIA (DZ)</option>
                                </select>
                                {['UN', 'PCT', 'DZ'].includes(newItem.unidadeMedida) && (
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Peso (KG)"
                                            title="Peso unitário em KG"
                                            value={newItem.unitWeight}
                                            onChange={e => setNewItem({ ...newItem, unitWeight: Number(e.target.value) })}
                                            className="w-full h-full bg-slate-100 border-none rounded-2xl px-2 text-center text-xs font-black text-slate-600 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-12">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Especificação Técnica (Padrão Licitação)</label>
                            <textarea
                                rows={3}
                                value={newItem.technicalSpecifications}
                                onChange={e => setNewItem({ ...newItem, technicalSpecifications: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                                placeholder="DESCREVA DETALHADAMENTE PARA O TERMO DE REFERÊNCIA (EX: ARROZ LONGO FINO, TIPO 1, ISENTO DE MATÉRIA ESTRANHA...)"
                            />
                        </div>

                        <div className={`md:col-span-12 p-8 rounded-[32px] grid grid-cols-2 md:grid-cols-5 gap-4 transition-all duration-700 ${isEnriching ? 'bg-orange-50 ring-2 ring-orange-200' : 'bg-slate-50'}`}>
                            <div className="col-span-full mb-2 flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isEnriching ? 'text-orange-600' : 'text-slate-400'}`}>
                                    {isEnriching ? 'IA PREENCHENDO DADOS NUTRICIONAIS...' : 'Composição por 100g (Padrão TBCA)'}
                                </span>
                                <Activity className={`w-4 h-4 ${isEnriching ? 'text-orange-500 animate-bounce' : 'text-orange-300'}`} />
                            </div>

                            {[
                                { label: 'Energia (Kcal)', field: 'kcal' },
                                { label: 'Proteína (G)', field: 'protein' },
                                { label: 'Carbo (G)', field: 'carbs' },
                                { label: 'Gordura (G)', field: 'fats' },
                                { label: 'Fator Corr.', field: 'correctionFactor' }
                            ].map((item) => {
                                return (
                                    <div key={item.field} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block pl-1">{item.label}</label>
                                        <input
                                            type="number"
                                            step={item.field === 'correctionFactor' ? '0.1' : '1'}
                                            value={(newItem as any)[item.field]}
                                            onChange={e => setNewItem({ ...newItem, [item.field]: Number(e.target.value) })}
                                            className={`w-full border-none rounded-xl px-4 py-2.5 text-xs font-black outline-none transition-all ${isEnriching
                                                ? 'bg-white text-orange-600 ring-2 ring-orange-400 animate-pulse'
                                                : 'bg-white text-slate-800 focus:ring-2 focus:ring-orange-500/20'
                                                }`}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="md:col-span-12 flex justify-between items-center mt-4 border-t border-slate-100 pt-6">
                            <div className="flex gap-6">
                                {/* NOVA GROUP SELECT */}
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Classificação NOVA (FNDE)</label>
                                    <div className="flex gap-2">
                                        {[NovaClassification.IN_NATURA, NovaClassification.PROCESSADO, NovaClassification.ULTRAPROCESSADO].map(grp => (
                                            <button
                                                type="button"
                                                key={grp}
                                                onClick={() => setNewItem({ ...newItem, novaGroup: grp, isUltraProcessed: grp === NovaClassification.ULTRAPROCESSADO })}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${newItem.novaGroup === grp
                                                    ? (grp === NovaClassification.ULTRAPROCESSADO ? 'bg-red-500 text-white border-red-500' : 'bg-green-500 text-white border-green-500')
                                                    : 'bg-white text-slate-400 border-slate-200'}`}
                                            >
                                                {grp.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group mt-6">
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${newItem.prohibitedForAgeUnder3 ? 'bg-red-500' : 'bg-slate-200'}`}>
                                        <input
                                            type="checkbox"
                                            checked={newItem.prohibitedForAgeUnder3}
                                            onChange={e => setNewItem({ ...newItem, prohibitedForAgeUnder3: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newItem.prohibitedForAgeUnder3 ? 'left-5 shadow-sm' : 'left-1'}`}></div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${newItem.prohibitedForAgeUnder3 ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                        Proibido {'<'} 3 anos (Açúcar/Mel)
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-8 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all transform active:scale-95"
                                >
                                    Salvar Produto
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const status = getTrafficLight(item.id);
                    const balance = calculateBalance(item.id);
                    const isLow = balance < item.estoqueMinimo;

                    return (
                        <div key={item.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col h-[320px] relative">
                            {/* CATEGORY & STATUS */}
                            <div className="p-6 flex justify-between items-start mb-auto">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">{item.categoria}</span>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${status.bg} ${status.color.replace('text-', 'border-').replace('600', '200')} ${status.color}`}>
                                        <div className={`w-1 h-1 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                                        {status.label}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                    <Package className="w-5 h-5" />
                                </div>
                            </div>

                            {/* NAME & BALANCE */}
                            <div className="px-6 pb-6 mt-auto">
                                <h3 className="text-sm font-black text-slate-800 uppercase leading-snug mb-4 line-clamp-2 min-h-12 border-l-2 border-slate-100 pl-4 group-hover:border-orange-500 transition-all">
                                    {item.nome}
                                </h3>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-60">Em Depósito</p>
                                        <p className={`text-2xl font-black ${isLow ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                                            {balance} <span className="text-xs font-bold text-slate-300 ml-1">{item.unidadeMedida}</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        Fator {item.correctionFactor || '1.0'}
                                    </div>
                                </div>
                            </div>

                            {/* HOVER DETAILS OVERLAY */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform duration-500 overflow-hidden z-20">
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    <div className="col-span-2 border-b border-white/10 pb-2 mb-2 flex justify-between items-center">
                                        <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Detalhes do Alimento</span>
                                        <Scale className="w-3 h-3 text-white/50" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-white/40 uppercase">Kcal / 100g</p>
                                        <p className="text-sm font-black text-white">{item.kcal}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-white/40 uppercase">Estoque Mín.</p>
                                        <p className="text-sm font-black text-white">{item.estoqueMinimo} {item.unidadeMedida}</p>
                                    </div>
                                    <div className="col-span-2 pt-2">
                                        <button
                                            onClick={async () => await onUpdateItem(item.id, { ativo: false })}
                                            className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2"
                                        >
                                            <TrendingDown className="w-3 h-3" /> Arquivar Produto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {item.isUltraProcessed && (
                                <div className="absolute top-6 left-0 translate-x-3/4 -rotate-45 bg-red-600 text-white text-[8px] font-black px-8 py-1 shadow-lg pointer-events-none z-10">
                                    ULTRAPROCESSADO
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ProductCatalog;
