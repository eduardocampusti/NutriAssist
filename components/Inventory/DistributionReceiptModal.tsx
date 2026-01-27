import React, { useState, useMemo } from 'react';
import { Distribution, DistributionStatus, InventoryItem, UserProfile } from '../../types';
import { X, CheckCircle2, AlertTriangle, PackageCheck, ClipboardCheck, ShieldCheck, FileImage, UserCheck } from 'lucide-react';
import { distributionService } from '../../services/distributionService';
import { useToast } from '../../contexts/ToastContext';

interface DistributionReceiptModalProps {
    distribution: Distribution;
    inventory: InventoryItem[];
    activeProfile: UserProfile;
    onClose: () => void;
    onSuccess: () => void;
}

const DistributionReceiptModal: React.FC<DistributionReceiptModalProps> = ({
    distribution,
    inventory,
    activeProfile,
    onClose,
    onSuccess
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [itemsConfirmation, setItemsConfirmation] = useState<{
        itemId: string,
        originalItemId: string,
        quantidadeRecebida: number,
        conforme: boolean,
        observacao?: string
    }[]>(
        (distribution.itens || []).map(it => ({
            itemId: it.id,
            originalItemId: it.produto_id,
            quantidadeRecebida: it.quantidade_enviada,
            conforme: true,
            observacao: ''
        }))
    );

    const [observacaoGeral, setObservacaoGeral] = useState('');
    const [aceitouDeclaracao, setAceitouDeclaracao] = useState(false);
    const [cargo, setCargo] = useState(activeProfile.role === 'ADMIN' ? 'Gestor(a) de Nutrição' : 'Diretor(a) Escolar');
    const [comprovante, setComprovante] = useState<File | null>(null);
    const { addToast } = useToast();

    const handleItemToggle = (idx: number) => {
        const newItems = [...itemsConfirmation];
        newItems[idx].conforme = !newItems[idx].conforme;
        if (newItems[idx].conforme) {
            const originalItem = distribution.itens![idx];
            newItems[idx].quantidadeRecebida = originalItem.quantidade_enviada;
        }
        setItemsConfirmation(newItems);
    };

    const handleQuantityChange = (idx: number, val: string) => {
        const newItems = [...itemsConfirmation];
        newItems[idx].quantidadeRecebida = Number(val);
        setItemsConfirmation(newItems);
    };

    const handleItemObsChange = (idx: number, val: string) => {
        const newItems = [...itemsConfirmation];
        newItems[idx].observacao = val;
        setItemsConfirmation(newItems);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setComprovante(e.target.files[0]);
        }
    };

    const handleConfirm = async () => {
        if (!aceitouDeclaracao) {
            return addToast("Você deve aceitar a declaração de recebimento.", 'error');
        }

        setIsLoading(true);
        try {
            await distributionService.confirmReceipt(
                distribution.id,
                activeProfile.id,
                itemsConfirmation.map(it => ({
                    itemId: it.itemId,
                    quantidadeRecebida: it.quantidadeRecebida,
                    observacao: it.observacao
                })),
                observacaoGeral,
                {
                    declaracaoAceite: "Declaro que os itens listados foram conferidos e recebidos conforme registrado.",
                    cargo: cargo,
                    comprovanteFile: comprovante || undefined
                }
            );

            addToast("Recebimento confirmado com assinatura digital simples!", 'success');
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast("Erro ao confirmar recebimento.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const hasDivergence = useMemo(() => itemsConfirmation.some(it => !it.conforme), [itemsConfirmation]);
    const isInvalid = useMemo(() => itemsConfirmation.some(it => !it.conforme && (!it.observacao || it.observacao.trim().length < 5)), [itemsConfirmation]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* HEADER */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                            Conferência de Recebimento
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Ordem de Distribuição: {distribution.id.slice(0, 8)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-4 items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Atenção ao Receber</p>
                            <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
                                Verifique a integridade das embalagens e a data de validade dos produtos. Caso haja divergência na quantidade, desmarque o "Conforme" e informe o valor real recebido.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Itens da Entrega ({itemsConfirmation.length})</h4>

                        <div className="space-y-3">
                            {itemsConfirmation.map((it, idx) => {
                                const originalItem = distribution.itens?.find(distIt => distIt.id === it.itemId);
                                const itemInfo = inventory.find(inv => inv.id === it.originalItemId);

                                return (
                                    <div key={it.itemId} className={`p-5 rounded-3xl border-2 transition-all ${it.conforme ? 'bg-white border-slate-100 shadow-sm' : 'bg-rose-50 border-rose-100 shadow-sm'}`}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-black text-slate-800 uppercase text-sm">{itemInfo?.nome}</h5>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded-full uppercase">
                                                        LOTE: {originalItem?.lote}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium mt-1">
                                                    Enviado: <span className="font-bold">{originalItem?.quantidade_enviada} {itemInfo?.unidadeMedida}</span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleItemToggle(idx)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${it.conforme ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-600 text-white shadow-lg shadow-rose-200'}`}
                                            >
                                                {it.conforme ? (
                                                    <><CheckCircle2 className="w-4 h-4" /> Conforme</>
                                                ) : (
                                                    <><AlertTriangle className="w-4 h-4" /> Divergência</>
                                                )}
                                            </button>
                                        </div>

                                        {!it.conforme && (
                                            <div className="mt-4 pt-4 border-t border-rose-100 grid grid-cols-12 gap-4 animate-in slide-in-from-top-2 duration-200">
                                                <div className="col-span-4">
                                                    <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1">Qtd Efetiva</label>
                                                    <input
                                                        type="number"
                                                        value={it.quantidadeRecebida}
                                                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                                        className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/20"
                                                    />
                                                </div>
                                                <div className="col-span-8">
                                                    <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1">Motivo da Divergência</label>
                                                    <input
                                                        type="text"
                                                        value={it.observacao}
                                                        onChange={(e) => handleItemObsChange(idx, e.target.value)}
                                                        placeholder="Ex: Embalagem danificada, falta de peso..."
                                                        className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/20"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Observações Gerais</label>
                        <textarea
                            value={observacaoGeral}
                            onChange={(e) => setObservacaoGeral(e.target.value)}
                            placeholder="Alguma informação adicional sobre a entrega?"
                            rows={2}
                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    {/* ASSINATURA DIGITAL SIMPLES */}
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl shadow-slate-200">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">Assinatura Digital Simples</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Validação Administrativa Integrada</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <UserCheck className="w-3 h-3" /> Responsável / Cargo
                                </label>
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                    <p className="text-sm font-black text-white uppercase">{activeProfile.nome}</p>
                                    <input
                                        type="text"
                                        value={cargo}
                                        onChange={e => setCargo(e.target.value)}
                                        className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-400 uppercase w-full outline-none focus:text-emerald-400 transition-colors"
                                        placeholder="Seu cargo..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FileImage className="w-3 h-3" /> Comprovante Físico (Opcional)
                                </label>
                                <label className="flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group">
                                    {comprovante ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">{comprovante.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">Upload JPG/PNG/PDF</p>
                                        </>
                                    )}
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                                </label>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl group cursor-pointer" onClick={() => setAceitouDeclaracao(!aceitouDeclaracao)}>
                            <div className={`mt-1 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${aceitouDeclaracao ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 bg-white/5'}`}>
                                {aceitouDeclaracao && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic">
                                "Declaro que os itens listados foram conferidos e recebidos conforme registrado, responsabilizando-me pelas informações prestadas sob as penas da lei."
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200/50 rounded-2xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={isLoading || isInvalid || !aceitouDeclaracao}
                        onClick={handleConfirm}
                        className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${isLoading || isInvalid || !aceitouDeclaracao ? 'bg-slate-300 cursor-not-allowed opacity-80' : hasDivergence ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
                    >
                        {isLoading ? 'Sincronizando...' : isInvalid ? 'Justificativa Obrigatória' : !aceitouDeclaracao ? 'Aceite a Declaração' : (
                            <><ShieldCheck className="w-5 h-5" /> Confirmar c/ Assinatura Digital</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DistributionReceiptModal;
