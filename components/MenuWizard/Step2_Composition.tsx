import React, { useState } from 'react';
import { MenuPlan, InventoryItem, EducationalStage, Dish, MenuIngredient, MealType } from '../../types';
import { getItemNormativeStatus, calculateNutritionalTargets } from '../../services/menuEngine';
import { useToast } from '../../contexts/ToastContext';
import { generateId } from '../../utils/id';

interface Step2Props {
    plan: Partial<MenuPlan>;
    inventory: InventoryItem[];
    onChange: (updates: Partial<MenuPlan>) => void;
}

export const Step2_Composition: React.FC<Step2Props> = ({ plan, inventory, onChange }) => {
    const { addToast } = useToast();
    const [selectedDay, setSelectedDay] = useState(1);
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    // Composer State
    const [dishName, setDishName] = useState('');
    const [mealType, setMealType] = useState<MealType>(MealType.ALMOCO);
    const [selectedItem, setSelectedItem] = useState('');
    const [perCapita, setPerCapita] = useState(0);
    const [currentIngredients, setCurrentIngredients] = useState<MenuIngredient[]>([]);

    // Searchable Picker State
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Helper to check status
    const checkStatus = (item: InventoryItem) => {
        // Infer stage from age range if needed, or use the plan's stage
        const fakeStage = (plan.faixaEtariaMinMeses || 0) < 36 ? EducationalStage.CRECHE : EducationalStage.FUNDAMENTAL_I;
        return getItemNormativeStatus(item, fakeStage);
    };

    const handleAddIngredient = () => {
        if (!selectedItem || perCapita <= 0) return;

        const item = inventory.find(i => i.id === selectedItem);
        if (!item) return;

        const status = checkStatus(item);
        if (status === 'PROHIBITED') {
            addToast(`BLOQUEADO: ${item.nome} é proibido para esta faixa etária.`, 'error');
            return;
        }
        if (status === 'RESTRICTED') {
            addToast(`ATENÇÃO: ${item.nome} é restrito. Necessária justificativa.`, 'info');
        }

        setCurrentIngredients([...currentIngredients, { itemId: selectedItem, perCapitaGrams: perCapita }]);
        setSelectedItem('');
        setPerCapita(0);
    };

    const handleSaveDish = () => {
        if (!dishName || currentIngredients.length === 0) {
            addToast("Preencha o nome da preparação e adicione ingredientes.", 'warning');
            return;
        }

        const newDish: Dish = {
            id: generateId(),
            nome: dishName.toUpperCase(),
            mealType,
            diaSemana: selectedDay,
            ingredientes: currentIngredients
        };

        const updatedPreparations = [...(plan.preparacoes || []), newDish];
        onChange({ preparacoes: updatedPreparations });

        // Reset composer
        setDishName('');
        setCurrentIngredients([]);
    };

    const removeDish = (dishId: string) => {
        onChange({ preparacoes: plan.preparacoes?.filter(p => p.id !== dishId) });
    };

    // Determine Stage and Targets
    const currentStage = (plan.faixaEtariaMaxMeses || 0) <= 36 ? EducationalStage.CRECHE : EducationalStage.FUNDAMENTAL_I;
    const targets = React.useMemo(() => {
        const coverage = ['LANCHE_MANHA', 'LANCHE_TARDE', 'CEIA'].includes(mealType) ? 0.2 : 0.3;
        return calculateNutritionalTargets(currentStage, coverage);
    }, [currentStage, mealType]);

    // Helper for validation colors
    const getStatusColor = (val: number, min: number, max: number) => {
        if (val < min) return 'text-amber-500'; // Low
        if (val > max) return 'text-rose-500'; // High
        return 'text-emerald-500'; // OK
    };

    // Calculate Nutrition for Current Composition
    const nutritionalTotals = React.useMemo(() => {
        return currentIngredients.reduce((acc, ing) => {
            const item = inventory.find(i => i.id === ing.itemId);
            if (!item) return acc;

            // Assume database values are per 100g
            const factor = ing.perCapitaGrams / 100;

            return {
                kcal: acc.kcal + ((item.kcal || 0) * factor),
                protein: acc.protein + ((item.protein || 0) * factor),
                fats: acc.fats + ((item.fats || item.lipids || 0) * factor), // Handle alias if exists
            };
        }, { kcal: 0, protein: 0, fats: 0 });
    }, [currentIngredients, inventory]);

    // AI Auto-Adjust Logic
    const handleAutoAdjust = () => {
        if (nutritionalTotals.kcal <= 0) return;

        // Aim for the midpoint of the target range for safety
        const targetKcal = (targets.minKcal + targets.maxKcal) / 2;

        // Calculate reduction ratio
        const ratio = targetKcal / nutritionalTotals.kcal;

        // Apply ratio to all ingredients
        const optimizedIngredients = currentIngredients.map(ing => ({
            ...ing,
            perCapitaGrams: Math.floor(ing.perCapitaGrams * ratio) // Floor to avoid slight overshooting, or maybe round
        }));

        setCurrentIngredients(optimizedIngredients);
        addToast("Ingredientes reajustados para a meta calórica!", 'success');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px] animate-in fade-in slide-in-from-right-8 duration-500">

            {/* LEFT: CALENDAR / LIST */}
            <div className="w-full lg:w-1/3 bg-white rounded-[32px] border border-slate-200 p-6 flex flex-col">
                <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Cronograma Semanal</h3>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                    {diasSemana.map((d, idx) => (
                        <button
                            key={d}
                            onClick={() => setSelectedDay(idx + 1)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-colors ${selectedDay === idx + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {plan.preparacoes?.filter(p => p.diaSemana === selectedDay).map(dish => (
                        <div key={dish.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group hover:border-indigo-100 transition-colors">
                            <button
                                onClick={() => removeDish(dish.id)}
                                className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                x
                            </button>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-black text-slate-700 uppercase">{dish.nome}</p>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{dish.mealType}</span>
                            </div>
                            <p className="text-[10px] text-slate-400">{dish.ingredientes.length} ingredientes</p>
                        </div>
                    ))}
                    {plan.preparacoes?.filter(p => p.diaSemana === selectedDay).length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <span className="text-2xl mb-2">🍽️</span>
                            <p className="text-[10px] italic">Nenhuma preparação neste dia.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: COMPOSER */}
            <div className="flex-1 bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col shadow-sm">
                <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">2</span>
                    Composição do Prato
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Preparação</label>
                        <input
                            value={dishName}
                            onChange={e => setDishName(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                            placeholder="Ex: ARROZ COM FEIJÃO"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                        <select
                            value={mealType}
                            onChange={e => setMealType(e.target.value as MealType)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold uppercase focus:border-indigo-500 outline-none"
                        >
                            {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex-1 flex flex-col">
                    {/* SEARCH BAR WITH TRAFFIC LIGHT */}
                    <div className="flex gap-4 mb-4 items-end">
                        <div className="flex-1 relative group">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Escolher Alimento (Base Normativa)</label>

                            {/* Combobox Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={selectedItem ? (inventory.find(i => i.id === selectedItem)?.nome || '') : ingredientSearch}
                                    onChange={(e) => {
                                        setSelectedItem(''); // Clear selection when typing
                                        setIngredientSearch(e.target.value.toUpperCase());
                                        setIsPickerOpen(true);
                                    }}
                                    onFocus={() => setIsPickerOpen(true)}
                                    // Simple hack: delay blur to allow click on options
                                    onBlur={() => setTimeout(() => setIsPickerOpen(false), 200)}
                                    placeholder="DIGITE PARA BUSCAR..."
                                    className={`w-full bg-white border ${isPickerOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-300'} rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none transition-all placeholder:text-slate-400`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">
                                    {isPickerOpen ? '▲' : '▼'}
                                </span>
                            </div>

                            {/* Dropdown Results */}
                            {isPickerOpen && (
                                <div className="absolute top-full left-0 w-full z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-hidden flex flex-col">
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
                                        {inventory
                                            .filter(i => i.ativo && i.nome.toUpperCase().includes(ingredientSearch.toUpperCase()))
                                            .map(item => {
                                                const status = checkStatus(item);
                                                let icon = '🟢';
                                                let opacity = 'opacity-100';
                                                let cursor = 'cursor-pointer hover:bg-slate-50';

                                                if (status === 'PROHIBITED') {
                                                    icon = '🔴';
                                                    opacity = 'opacity-50';
                                                    cursor = 'cursor-not-allowed bg-slate-50';
                                                }
                                                if (status === 'RESTRICTED') icon = '🟡';

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent blur
                                                            if (status !== 'PROHIBITED') {
                                                                setSelectedItem(item.id);
                                                                setIngredientSearch('');
                                                                setIsPickerOpen(false);
                                                            }
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-3 transition-all ${opacity} ${cursor} ${selectedItem === item.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-600 border border-transparent'}`}
                                                    >
                                                        <span className="text-sm">{icon}</span>
                                                        <div className="flex-1 truncate">
                                                            <span className="block">{item.nome}</span>
                                                            <span className="text-[9px] text-slate-400 font-normal normal-case">
                                                                {item.categoria || 'Sem Categoria'} • {item.classificacao_nova || 'N/A'}
                                                            </span>
                                                        </div>
                                                        {status === 'PROHIBITED' && <span className="text-[9px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-lg">PROIBIDO</span>}
                                                    </div>
                                                );
                                            })}
                                        {inventory.filter(i => i.ativo && i.nome.toUpperCase().includes(ingredientSearch.toUpperCase())).length === 0 && (
                                            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                                                <span className="text-2xl mb-2">🥬</span>
                                                <span className="text-[10px] font-bold uppercase">Nenhum alimento encontrado</span>
                                                <span className="text-[9px]">Tente outro termo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-24">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Gramas (p/c)</label>
                            <input
                                type="number"
                                value={perCapita || ''}
                                onChange={e => setPerCapita(parseFloat(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddIngredient}
                            disabled={!selectedItem || perCapita <= 0}
                            className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                        >
                            +
                        </button>
                    </div>

                    {/* NUTRITIONAL SUMMARY PANEL (ENHANCED) */}
                    {currentIngredients.length > 0 && (
                        <div className="flex flex-col gap-2 mb-4 animate-in fade-in zoom-in-95">
                            {/* TARGETS HEADER */}
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metas PNAE ({currentStage})</span>
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                    Meta Kcal: {Math.round(targets.minKcal)}-{Math.round(targets.maxKcal)}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                {/* Kcal */}
                                <div className="flex flex-col items-center border-r border-slate-100 last:border-0 relative">
                                    <div className={`text-xs font-black uppercase ${getStatusColor(nutritionalTotals.kcal, targets.minKcal, targets.maxKcal)}`}>
                                        {nutritionalTotals.kcal.toFixed(0)} kcal
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">CALORIAS</p>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${nutritionalTotals.kcal > targets.maxKcal ? 'bg-rose-500' : nutritionalTotals.kcal < targets.minKcal ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min((nutritionalTotals.kcal / targets.maxKcal) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Protein */}
                                <div className="flex flex-col items-center border-r border-slate-100 last:border-0 relative">
                                    <div className={`text-xs font-black uppercase ${getStatusColor(nutritionalTotals.protein, targets.minProtein, targets.maxProtein)}`}>
                                        {nutritionalTotals.protein.toFixed(1)} g
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">PROTEÍNAS</p>
                                    <span className="text-[8px] text-slate-300">Min: {targets.minProtein.toFixed(1)}g</span>
                                </div>

                                {/* Fats */}
                                <div className="flex flex-col items-center relative">
                                    <div className={`text-xs font-black uppercase ${getStatusColor(nutritionalTotals.fats, targets.minFats, targets.maxFats)}`}>
                                        {nutritionalTotals.fats.toFixed(1)} g
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">LIPÍDIOS</p>
                                    <span className="text-[8px] text-slate-300">Min: {targets.minFats.toFixed(1)}g</span>
                                </div>
                            </div>

                            {/* SMART SUGGESTIONS (AI-LITE) */}
                            {nutritionalTotals.kcal < targets.minKcal && (
                                <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-start gap-2">
                                    <span className="text-sm">💡</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-700 uppercase">Sugestão: Calorias Baixas</p>
                                        <p className="text-[10px] text-amber-600">
                                            Abaixo da meta. Tente aumentar o per capita de <b>Carboidratos</b> ou adicionar um <b>Complemento</b>.
                                        </p>
                                    </div>
                                </div>
                            )}
                            {nutritionalTotals.kcal > targets.maxKcal && (
                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm">⚠️</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-rose-700 uppercase">Atenção: Calorias Excessivas</p>
                                            <p className="text-[10px] text-rose-600">
                                                O valor energético ultrapassou o limite do PNAE (<b>{Math.round(targets.maxKcal)} kcal</b>).
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAutoAdjust}
                                        className="self-end bg-white border border-rose-200 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        ✨ Ajustar Automaticamente com IA
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADDED INGREDIENTS LIST */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {currentIngredients.length === 0 && (
                            <div className="text-center text-slate-400 text-xs italic mt-10">Adicione os ingredientes acima.</div>
                        )}
                        {currentIngredients.map((ing, idx) => {
                            const item = inventory.find(i => i.id === ing.itemId);
                            const status = item ? checkStatus(item) : 'ALLOWED';
                            return (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-lg">{status === 'ALLOWED' ? '🟢' : status === 'RESTRICTED' ? '🟡' : '🔴'}</span>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-700">{item?.nome}</p>
                                            <p className="text-[9px] text-slate-400 capitalize">{item?.classificacao_nova || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-20">
                                            <input
                                                type="number"
                                                value={ing.perCapitaGrams}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val >= 0) {
                                                        const newIngs = [...currentIngredients];
                                                        newIngs[idx].perCapitaGrams = val;
                                                        setCurrentIngredients(newIngs);
                                                    }
                                                }}
                                                className="w-full text-right bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-700 focus:border-indigo-500 outline-none"
                                            />
                                            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none">g</span>
                                        </div>
                                        <button onClick={() => setCurrentIngredients(prev => prev.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors">✕</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 text-right">
                        <button
                            onClick={handleSaveDish}
                            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md"
                        >
                            Confirmar Preparação
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
