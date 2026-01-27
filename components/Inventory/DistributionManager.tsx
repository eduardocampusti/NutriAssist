import React, { useState, useMemo, useEffect } from 'react';
import {
    InventoryItem,
    School,
    MovementType,
    MovementPurpose,
    UserProfile,
    LetterheadConfig,
    InventoryBatch,
    Distribution,
    DistributionStatus
} from '../../types';
import {
    School as SchoolIcon,
    ShoppingCart,
    ArrowRight,
    PackageX,
    Minus,
    FileText,
    Printer,
    Calendar,
    Truck,
    Search,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Briefcase,
    Plus,
    User,
    ClipboardList,
    BarChart3
} from 'lucide-react';
import DistributionReport from './DistributionReport';
import { DistributionAnalyticsView } from '../Reporting/DistributionAnalyticsView';
import { distributionService } from '../../services/distributionService';
import { useToast } from '../../contexts/ToastContext';
import { useMenu } from '../../contexts/MenuContext';

interface DistributionManagerProps {
    inventory: InventoryItem[];
    batches: InventoryBatch[];
    schools: School[];
    activeProfile?: UserProfile;
    letterhead?: LetterheadConfig;
    // Keep old props for compatibility if needed, but we'll use our service
    onAddMovement?: (mov: any) => Promise<void>;
}

const DistributionManager: React.FC<DistributionManagerProps> = ({
    inventory,
    batches,
    schools,
    activeProfile,
    letterhead
}) => {
    // 0 = Dashboard/History, 1 = Nova Distribuição (Seleção de Escola), 2 = Montagem de Carga
    const [step, setStep] = useState(0);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<Distribution[]>([]);

    // Shipment Data
    const [motorista, setMotorista] = useState('');
    const [placa, setPlaca] = useState('');
    const [cartItems, setCartItems] = useState<{ itemId: string, lote: string, validade: string, qtd: number }[]>([]);

    // Form Item
    const [currentItemId, setCurrentItemId] = useState('');
    const [currentLote, setCurrentLote] = useState('');
    const [currentValidade, setCurrentValidade] = useState('');
    const [currentQtd, setCurrentQtd] = useState<string | number>('');

    // Report Viewing
    const [viewingDistId, setViewingDistId] = useState<string | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedMenuId, setSelectedMenuId] = useState('');

    const { addToast } = useToast();
    const { menuPlans } = useMenu();

    const approvedMenus = useMemo(() =>
        menuPlans.filter(p => (p.escolaId === selectedSchoolId || p.escolaId === 'REDE_GERAL') && p.status === 'APROVADO'),
        [menuPlans, selectedSchoolId]
    );

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await distributionService.listDistributions();
            setHistory(data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar histórico de distribuições.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // PVPS Logic
    const availableBatches = useMemo(() => {
        if (!currentItemId) return [];
        return batches
            .filter(b => b.itemId === currentItemId && (Number(b.saldoAtual) || 0) > 0 && b.ativo)
            .sort((a, b) => {
                const dateA = new Date(a.validade || 0).getTime();
                const dateB = new Date(b.validade || 0).getTime();
                return dateA - dateB;
            });
    }, [currentItemId, batches]);

    const activeItems = inventory.filter(i => i.ativo);

    const handleAddToCart = () => {
        if (!currentItemId || !currentQtd) return;

        const qty = Number(currentQtd);
        if (qty <= 0) return addToast("Quantidade inválida.", 'error');

        // Check stock
        const batch = batches.find(b => b.loteCod === currentLote && b.itemId === currentItemId);
        const inCart = cartItems.filter(c => c.itemId === currentItemId && c.lote === currentLote).reduce((ac, c) => ac + c.qtd, 0);

        if (batch && (Number(batch.saldoAtual) || 0) < (qty + inCart)) {
            return addToast(`Estoque insuficiente no lote selecionado.`, 'error');
        }

        setCartItems(prev => [...prev, {
            itemId: currentItemId,
            lote: currentLote,
            validade: currentValidade,
            qtd: qty
        }]);

        setCurrentItemId('');
        setCurrentLote('');
        setCurrentValidade('');
        setCurrentQtd('');
    };

    const handleFinish = async () => {
        if (cartItems.length === 0 || !selectedSchoolId || !activeProfile) return;

        setIsLoading(true);
        try {
            const distData = {
                escola_id: selectedSchoolId,
                cardapio_id: selectedMenuId || null,
                responsavel_logistica_id: activeProfile.id,
                motorista: motorista,
                placa_veiculo: placa,
                status: DistributionStatus.EM_TRANSITO
            };

            const items = cartItems.map(item => ({
                produto_id: item.itemId,
                lote: item.lote || '',
                validade: item.validade || '',
                quantidade_enviada: item.qtd
            }));

            await distributionService.createDistribution(distData as any, items, activeProfile.id);

            addToast("Ordem de Distribuição emitida com sucesso!", 'success');
            setCartItems([]);
            setMotorista('');
            setPlaca('');
            setStep(0);
            loadHistory();
        } catch (error) {
            console.error(error);
            addToast("Erro ao processar distribuição.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedSchool = schools.find(s => s.id === selectedSchoolId);

    if (viewingDistId && activeProfile) {
        const dist = history.find(d => d.id === viewingDistId);

        if (dist && dist.escola) {
            const reportMovements = dist.itens?.map(it => ({
                itemId: it.produto_id,
                quantidade: it.quantidade_enviada,
                data: new Date(dist.created_at || Date.now()).getTime(),
            })) || [];

            return (
                <DistributionReport
                    school={dist.escola}
                    movements={reportMovements as any}
                    inventory={inventory}
                    date={new Date(dist.created_at || Date.now()).getTime()}
                    user={activeProfile}
                    config={letterhead}
                    onClose={() => setViewingDistId(null)}
                />
            )
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Truck className="w-5 h-5 text-purple-600" />
                        </div>
                        Logística de Distribuição
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {step === 0 ? 'Monitoramento e Romaneios' : `Remessa para: ${selectedSchool?.nome}`}
                    </p>
                </div>

                {step === 0 ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAnalytics(true)}
                            className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Relatórios Analíticos
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-200 transition-all"
                        >
                            Emitir Nova Ordem
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => { setStep(0); setCartItems([]); }} className="px-4 py-2 border border-slate-200 text-slate-400 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase">
                        Cancelar Operação
                    </button>
                )}
            </div>

            {step === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" /> Ordens Emitidas
                                </h3>
                                <div className="text-[10px] font-bold text-slate-300 uppercase">{history.length} Entregas</div>
                            </div>

                            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {isLoading ? (
                                    <div className="p-20 text-center text-slate-300 animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando...</div>
                                ) : history.length === 0 ? (
                                    <div className="p-20 text-center text-slate-300 italic flex flex-col items-center gap-4">
                                        <PackageX className="w-12 h-12 opacity-10" />
                                        <p className="text-sm">Nenhuma distribuição ativa no momento.</p>
                                    </div>
                                ) : (
                                    history.map((dist) => {
                                        const school = schools.find(s => s.id === dist.escola_id);
                                        const totalItems = dist.itens?.length || 0;
                                        const totalVol = dist.itens?.reduce((a, b) => a + Number(b.quantidade_enviada), 0) || 0;

                                        return (
                                            <div key={dist.id} className="px-8 py-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">
                                                            {dist.created_at ? new Date(dist.created_at).toLocaleDateString('pt-BR', { month: 'short' }) : '---'}
                                                        </span>
                                                        <span className="text-xl font-black text-slate-800 leading-none">
                                                            {dist.created_at ? new Date(dist.created_at).getDate() : '--'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-black text-slate-800 uppercase line-clamp-1">{school?.nome || 'Unidade'}</h4>
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${dist.status === DistributionStatus.ENTREGUE ? 'bg-green-50 text-green-600' :
                                                                dist.status === DistributionStatus.EM_TRANSITO ? 'bg-blue-50 text-blue-600' :
                                                                    'bg-slate-50 text-slate-400'
                                                                }`}>
                                                                {dist.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
                                                            ID: {dist.id.slice(0, 8)} • {totalItems} Itens • {totalVol.toFixed(1)} Unidades
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setViewingDistId(dist.id)}
                                                    className="px-5 py-3 bg-white border-2 border-slate-100 hover:border-purple-500 hover:text-purple-600 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center gap-3"
                                                >
                                                    <Printer className="w-4 h-4" /> Romaneio
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-purple-900 rounded-[40px] p-8 text-white shadow-xl shadow-purple-200">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6 border-b border-purple-800 pb-4">Status Logístico</h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-purple-800/50 pb-2">
                                    <span className="text-xs text-purple-200 font-bold uppercase">Ordens Emitidas</span>
                                    <span className="text-2xl font-black">{history.length}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-purple-800/50 pb-2">
                                    <span className="text-xs text-purple-200 font-bold uppercase">Aguardando Recebimento</span>
                                    <span className="text-2xl font-black">{history.filter(d => d.status === DistributionStatus.EM_TRANSITO).length}</span>
                                </div>
                                <p className="text-[10px] text-purple-300 italic leading-relaxed mt-4">
                                    O fluxo digital elimina romaneios manuais e garante que a escola confirme a entrada para alimentar o estoque setorial.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Destino da Carga</h3>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Procurar escola..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium w-64 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {schools.filter(s => s.ativo && s.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { setSelectedSchoolId(s.id); setStep(2); }}
                                    className="p-6 bg-slate-50 border-2 border-transparent hover:border-purple-500 hover:bg-white transition-all rounded-[32px] text-left group flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                                        🏫
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.tipo_unidade || 'Escola'}</span>
                                        <h4 className="text-sm font-black text-slate-800 uppercase mt-1 line-clamp-1 group-hover:text-purple-700">{s.nome}</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{s.numAlunos} Alunos • {s.localidade}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 self-center" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Vincular ao Cardápio (Planejamento)</label>
                                <select
                                    value={selectedMenuId}
                                    onChange={e => setSelectedMenuId(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="">Nenhum cardápio específico vinculado</option>
                                    {approvedMenus.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.titulo} ({p.etapa.replace('_', ' ')})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Motorista Responsável</label>
                                <input
                                    type="text"
                                    value={motorista}
                                    onChange={e => setMotorista(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Placa do Veículo</label>
                                <input
                                    type="text"
                                    value={placa}
                                    onChange={e => setPlaca(e.target.value)}
                                    placeholder="Ex: ABC-1234"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-lg relative overflow-hidden group">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-purple-600" /> Itens da Carga
                                </h3>

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Produto</label>
                                        <select
                                            value={currentItemId}
                                            onChange={e => { setCurrentItemId(e.target.value); setCurrentLote(''); }}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                                        >
                                            <option value="">Buscar no estoque central...</option>
                                            {activeItems.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Lote (PVPS)</label>
                                        <select
                                            value={currentLote}
                                            onChange={e => {
                                                const b = batches.find(x => x.loteCod === e.target.value && x.itemId === currentItemId);
                                                setCurrentLote(e.target.value);
                                                setCurrentValidade(String(b?.validade || ''));
                                            }}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                                            disabled={!currentItemId}
                                        >
                                            <option value="">{currentItemId ? 'Selecionar Lote' : '---'}</option>
                                            {availableBatches.map(b => (
                                                <option key={b.id} value={b.loteCod}>
                                                    Lote {b.loteCod} (Exp: {new Date(b.validade || 0).toLocaleDateString()}) - Saldo: {b.saldoAtual}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-12">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Quantidade</label>
                                        <div className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    value={currentQtd}
                                                    onChange={e => setCurrentQtd(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">
                                                    {inventory.find(i => i.id === currentItemId)?.unidade_medida || ''}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={!currentLote || !currentQtd}
                                                className="px-8 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[40px] p-8 min-h-[300px] border-2 border-dashed border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" /> Carga Configurada
                                </h4>
                                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[9px] font-black">{cartItems.length} Itens</span>
                            </div>

                            <div className="space-y-3">
                                {cartItems.length === 0 ? (
                                    <div className="py-16 text-center text-slate-300 italic flex flex-col items-center gap-4">
                                        <PackageX className="w-12 h-12 opacity-10" />
                                        <p className="text-sm">Nenhum item adicionado à carga.</p>
                                    </div>
                                ) : (
                                    cartItems.map((c, idx) => {
                                        const item = inventory.find(i => i.id === c.itemId);
                                        return (
                                            <div key={idx} className="bg-white p-5 rounded-3xl border border-white hover:border-purple-200 shadow-sm flex justify-between items-center transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setCartItems(prev => prev.filter((_, i) => i !== idx))}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex flex-shrink-0 items-center justify-center hover:bg-red-500 hover:text-white transition-all font-black text-lg"
                                                    >
                                                        -
                                                    </button>
                                                    <div>
                                                        <h5 className="font-black text-slate-800 uppercase text-xs">{item?.nome}</h5>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">LOTE: {c.lote} • VAL: {new Date(c.validade).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-purple-600 leading-none">{c.qtd}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{item?.unidade_medida}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex-1">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 bg-purple-50 rounded-[32px] flex items-center justify-center text-3xl shadow-sm mb-4">
                                    🏢
                                </div>
                                <h3 className="text-lg font-black text-slate-800 uppercase leading-tight line-clamp-2">{selectedSchool?.nome}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedSchool?.municipio}</p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                                    <span>Total Itens:</span>
                                    <span className="text-slate-800">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                                    <span>Unid. Totais:</span>
                                    <span className="text-slate-800">{cartItems.reduce((a, b) => a + b.qtd, 0).toFixed(1)}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-10 flex flex-col gap-3">
                                <button
                                    onClick={handleFinish}
                                    disabled={cartItems.length === 0 || isLoading}
                                    className="w-full py-5 bg-black text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                                >
                                    {isLoading ? '...' : 'Emitir Ordem'}
                                </button>
                                <button
                                    onClick={() => { setStep(1); setSelectedSchoolId(''); setCartItems([]); }}
                                    className="w-full py-4 text-slate-400 font-black text-[10px] uppercase hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    Alterar Destino
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributionManager;
