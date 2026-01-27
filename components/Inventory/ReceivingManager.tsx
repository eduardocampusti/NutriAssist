import React, { useState } from 'react';
import { InventoryItem, Supplier, InventoryMovement, MovementType, MovementPurpose, InventoryBatch, InventoryCategory } from '../../types';
import {
    Truck,
    Search,
    Calendar,
    PackageCheck,
    ArrowRight,
    Check,
    Trash2,
    Plus,
    ArrowLeft,
    FileText,
    BadgeDollarSign,
    Hash
} from 'lucide-react';

interface ReceivingManagerProps {
    inventory: InventoryItem[];
    suppliers: Supplier[];
    onAddBatch: (batch: Omit<InventoryBatch, 'id' | 'created_at' | 'ativo' | 'saldoAtual'>) => Promise<void>;
    onAddItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'saldoAtual'>) => Promise<void>;
}

const ReceivingManager: React.FC<ReceivingManagerProps> = ({ inventory, suppliers, onAddBatch, onAddItem }) => {
    // 0 = Seleção de Fornecedor, 1 = Itens da Nota
    const [step, setStep] = useState(0);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

    // Quick Add Product Form
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newProdName, setNewProdName] = useState('');
    const [newProdUnit, setNewProdUnit] = useState('KG');

    // Cart (Items in the current invoice)
    const [cart, setCart] = useState<{
        itemId: string,
        nome: string,
        qtd: number,
        lote: string,
        validade: number,
        unitCost: number,
        unidade: string
    }[]>([]);

    // Current Item Form
    const [currentItemId, setCurrentItemId] = useState('');
    const [currentQtd, setCurrentQtd] = useState<string | number>('');
    const [currentLote, setCurrentLote] = useState('');
    const [currentValidade, setCurrentValidade] = useState('');
    const [currentUnitCost, setCurrentUnitCost] = useState<string | number>('');

    const activeSuppliers = suppliers.filter(s => s.ativo);
    const activeItems = inventory.filter(i => i.ativo);

    const handleAddItemToCart = () => {
        if (!currentItemId) return;

        const qty = Number(currentQtd);
        const price = Number(currentUnitCost);

        if (isNaN(qty) || qty <= 0) return alert("Quantidade inválida.");
        if (!currentValidade) return alert("Validade é obrigatória.");

        const item = inventory.find(i => i.id === currentItemId);
        if (!item) return;

        const validadeTimestamp = new Date(currentValidade + 'T12:00:00').getTime();

        setCart(prev => [...prev, {
            itemId: item.id,
            nome: item.nome,
            qtd: qty,
            lote: currentLote.toUpperCase() || 'S/L',
            validade: validadeTimestamp,
            unitCost: isNaN(price) || price === 0 ? (item.costPerUnit || 0) : price,
            unidade: item.unidadeMedida
        }]);

        // Reset Item Form
        setCurrentItemId('');
        setCurrentQtd('');
        setCurrentLote('');
        setCurrentUnitCost('');
        setCurrentValidade('');
    };

    const handleFinish = async () => {
        if (cart.length === 0) return;

        try {
            // Processing items sequentially to ensure state updates and audit trail
            for (const item of cart) {
                await onAddBatch({
                    itemId: item.itemId,
                    supplierId: selectedSupplierId,
                    dataEntrada: new Date(entryDate + 'T12:00:00').getTime(),
                    validade: item.validade,
                    quantidadeInicial: item.qtd,
                    valorUnitario: item.unitCost,
                    loteCod: item.lote,
                    numeroNF: invoiceNumber
                });
            }

            setStep(0);
            setCart([]);
            setSelectedSupplierId('');
            setInvoiceNumber('');
            alert("Entrada registrada com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao finalizar entrada de nota.");
        }
    };

    const totalInvoice = cart.reduce((acc, i) => acc + (i.qtd * i.unitCost), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* PROGRESS STEPS */}
            <div className="flex items-center gap-4 mb-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${step === 0 ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">1</span>
                    Fornecedor
                </div>
                <div className="h-px w-8 bg-slate-200"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">2</span>
                    Itens da Nota
                </div>
            </div>

            {step === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-emerald-600" /> Selecione a Origem da Entrega
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeSuppliers.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelectedSupplierId(s.id); setStep(1); }}
                                        className="p-5 bg-slate-50 border-2 border-transparent hover:border-emerald-500 hover:bg-white transition-all rounded-[32px] text-left group flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                                            {s.tipo === 'AGRICULTURA_FAMILIAR' ? '🥬' : '🏢'}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.tipo.replace('_', ' ')}</span>
                                            <h4 className="text-sm font-black text-slate-800 uppercase mt-1 line-clamp-1 group-hover:text-emerald-700">{s.nome}</h4>
                                            <p className="text-[9px] text-slate-400 font-mono mt-2">{s.documento}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 self-center" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-emerald-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Instruções de Recebimento</h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/10 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-emerald-200">1</div>
                                        <p className="text-xs text-emerald-100/80 leading-relaxed">Selecione o fornecedor que está realizando a entrega física.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/10 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-emerald-200">2</div>
                                        <p className="text-xs text-emerald-100/80 leading-relaxed">Informe o número da nota fiscal ou recibo para rastreabilidade.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/10 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-emerald-200">3</div>
                                        <p className="text-xs text-emerald-100/80 leading-relaxed">Lance cada item especificando lote e validade para o controle <b>PVPS</b>.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        {/* INVOICE HEADER */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 space-y-1 w-full">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> Número da NF / Recibo
                                </label>
                                <input
                                    type="text"
                                    value={invoiceNumber}
                                    onChange={e => setInvoiceNumber(e.target.value)}
                                    placeholder="Ex: 001.234.567"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="flex-1 space-y-1 w-full">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Data de Recebimento
                                </label>
                                <input
                                    type="date"
                                    value={entryDate}
                                    onChange={e => setEntryDate(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>

                        {/* ITEM ENTRY FORM */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-focus-within:opacity-20 transition-opacity">
                                <Plus className="w-16 h-16 text-emerald-900" />
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <PackageCheck className="w-4 h-4 text-emerald-600" /> Adicionar Produto ao Recebimento
                                    </h3>
                                    <button
                                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                                        className="text-[10px] font-black text-emerald-600 uppercase hover:underline"
                                    >
                                        {showQuickAdd ? 'Fechar Cadastro Rápido' : '+ Cadastrar Novo Item'}
                                    </button>
                                </div>

                                {showQuickAdd && (
                                    <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4 items-end animate-in zoom-in duration-200">
                                        <div className="flex-[2]">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase mb-1 block">Nome do Produto</label>
                                            <input
                                                type="text"
                                                value={newProdName}
                                                onChange={e => setNewProdName(e.target.value.toUpperCase())}
                                                className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold uppercase"
                                                placeholder="NOME DO ALIMENTO"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-emerald-700 uppercase mb-1 block">Unidade</label>
                                            <select
                                                value={newProdUnit}
                                                onChange={e => setNewProdUnit(e.target.value)}
                                                className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold"
                                            >
                                                <option>KG</option>
                                                <option>L</option>
                                                <option>UN</option>
                                                <option>PCT</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (newProdName) {
                                                    await onAddItem({
                                                        nome: newProdName,
                                                        categoria: InventoryCategory.SECO,
                                                        unidadeMedida: newProdUnit as any,
                                                        estoqueMinimo: 0,
                                                        ativo: true,
                                                        kcal: 0, protein: 0, carbs: 0, fats: 0,
                                                        correctionFactor: 1, costPerUnit: 0, isUltraProcessed: false
                                                    });
                                                    setNewProdName('');
                                                    setShowQuickAdd(false);
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all"
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-8">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Selecionar Alimento</label>
                                        <select
                                            value={currentItemId}
                                            onChange={e => setCurrentItemId(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <option value="">Buscar no catálogo...</option>
                                            {activeItems.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidadeMedida})</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Quantidade</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={currentQtd}
                                                onChange={e => setCurrentQtd(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                                                {inventory.find(i => i.id === currentItemId)?.unidadeMedida || '---'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Código do Lote</label>
                                        <input
                                            type="text"
                                            value={currentLote}
                                            onChange={e => setCurrentLote(e.target.value.toUpperCase())}
                                            placeholder="S/L"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Data de Validade</label>
                                        <input
                                            type="date"
                                            value={currentValidade}
                                            onChange={e => setCurrentValidade(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Valor Unitário (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={currentUnitCost}
                                            onChange={e => setCurrentUnitCost(e.target.value)}
                                            placeholder="0,00"
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddItemToCart}
                                    disabled={!currentItemId || !currentQtd || !currentValidade}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-30 disabled:shadow-none translate-y-2 group-hover:translate-y-0"
                                >
                                    Adicionar à Listagem
                                </button>
                            </div>
                        </div>

                        {/* CART DISPLAY */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
                            <div className="bg-slate-50 px-8 py-4 flex justify-between items-center border-b border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens Pré-lançados ({cart.length})</h4>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Valor: R$ {totalInvoice.toFixed(2)}</span>
                            </div>

                            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {cart.length === 0 && (
                                    <div className="p-20 text-center text-slate-300 italic flex flex-col items-center gap-4">
                                        <FileText className="w-12 h-12 opacity-20" />
                                        <p className="text-sm">Nenhum item na nota ainda.</p>
                                    </div>
                                )}
                                {cart.map((item, idx) => (
                                    <div key={idx} className="px-8 py-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-800 uppercase text-xs">{item.nome}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                    LOTE: {item.lote} • VAL: {new Date(item.validade).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-800">{item.qtd} <span className="text-[10px] text-slate-400">{item.unidade}</span></p>
                                                <p className="text-[9px] font-bold text-emerald-500 uppercase">R$ {item.unitCost.toFixed(2)} /un</p>
                                            </div>
                                            <button
                                                onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Resumo Financeiro</h4>
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50 rounded-3xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Fornecedor</span>
                                    <p className="text-sm font-black text-slate-800 uppercase line-clamp-2">
                                        {suppliers.find(s => s.id === selectedSupplierId)?.nome}
                                    </p>
                                </div>
                                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase block mb-1 flex items-center gap-2">
                                        <BadgeDollarSign className="w-3 h-3" /> Valor Total da Nota
                                    </span>
                                    <p className="text-3xl font-black text-emerald-700">
                                        <span className="text-sm font-bold opacity-30 mr-1">R$</span>
                                        {totalInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 flex flex-col gap-3">
                                <button
                                    onClick={handleFinish}
                                    disabled={cart.length === 0}
                                    className="w-full py-4 bg-black text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-20"
                                >
                                    Confirmar e Arquivar
                                </button>
                                <button
                                    onClick={() => { setStep(0); setCart([]); setSelectedSupplierId(''); }}
                                    className="w-full py-3 text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-colors"
                                >
                                    Descartar Lançamento
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-900 rounded-[40px] p-8 text-white">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Check className="w-3 h-3" /> Validador PVPS
                            </h4>
                            <p className="text-xs text-indigo-100/70 leading-relaxed italic">
                                "Ao lançar lotes e validades corretamente, o sistema automatiza a saída pelo princípio 'Primeiro que Vence, Primeiro que Sai', garantindo conformidade com as normas sanitárias e minimizando desperdícios."
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceivingManager;
