import React, { useState, useEffect } from 'react';
import {
    Distribution,
    DistributionStatus,
    UserProfile,
    School,
    DistributionItem,
    UserRole
} from '../../types';
import {
    Truck,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    User,
    FileText,
    ChevronRight,
    PackageCheck,
    ClipboardList
} from 'lucide-react';
import { distributionService } from '../../services/distributionService';
import { useToast } from '../../contexts/ToastContext';
import { useSchools } from '../../contexts/SchoolContext';

interface DistributionReceiverProps {
    activeProfile: UserProfile;
    school?: School;
}

const DistributionReceiver: React.FC<DistributionReceiverProps> = ({ activeProfile, school }) => {
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [selectedDist, setSelectedDist] = useState<Distribution | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationData, setConfirmationData] = useState<{ [key: string]: { qty: number, obs: string } }>({});
    const [observacoesGerais, setObservacoesGerais] = useState('');
    const { addToast } = useToast();

    const { schools } = useSchools();
    const [selectedSchoolId, setSelectedSchoolId] = useState(school?.id || '');

    useEffect(() => {
        if (selectedSchoolId) {
            loadDistributions();
        }
    }, [selectedSchoolId]);

    const loadDistributions = async () => {
        setIsLoading(true);
        try {
            const data = await distributionService.listDistributions({
                escola_id: selectedSchoolId,
                status: DistributionStatus.EM_TRANSITO
            });
            setDistributions(data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar entregas pendentes.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDistribution = (dist: Distribution) => {
        setSelectedDist(dist);
        // Initialize confirmation data with sent quantities
        const initialData: { [key: string]: { qty: number, obs: string } } = {};
        dist.itens?.forEach(item => {
            initialData[item.id] = { qty: item.quantidade_enviada, obs: '' };
        });
        setConfirmationData(initialData);
    };

    const handleConfirmReceipt = async () => {
        if (!selectedDist) return;

        const confirmationList = selectedDist.itens?.map(item => ({
            itemId: item.id,
            quantidadeRecebida: confirmationData[item.id].qty,
            observacao: confirmationData[item.id].obs
        })) || [];

        try {
            await distributionService.confirmReceipt(
                selectedDist.id,
                activeProfile.id,
                confirmationList,
                observacoesGerais
            );
            addToast("Recebimento confirmado com sucesso!", 'success');
            setSelectedDist(null);
            loadDistributions();
        } catch (error) {
            console.error(error);
            addToast("Erro ao confirmar recebimento.", 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <header className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <PackageCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Recebimento de Gêneros</h1>
                    {school ? (
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{school.nome}</p>
                    ) : (
                        <div className="mt-2">
                            <select
                                value={selectedSchoolId}
                                onChange={(e) => setSelectedSchoolId(e.target.value)}
                                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="">Selecionar Unidade Administrativa...</option>
                                {schools.filter(s => s.ativo && (activeProfile.role === UserRole.NUCLEO_ESCOLAR ? s.zona_id === activeProfile.zona_id : true)).map(s => (
                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </header>

            {!selectedSchoolId ? (
                <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-100 italic text-slate-300">
                    Selecione uma unidade escolar acima para gerenciar as entregas.
                </div>
            ) : !selectedDist ? (
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-2">Entregas em Trânsito</h2>
                    {distributions.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-slate-100 italic text-slate-300">
                            Não há nenhuma entrega pendente para confirmação no momento nesta unidade.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {distributions.map(dist => (
                                <button
                                    key={dist.id}
                                    onClick={() => handleSelectDistribution(dist)}
                                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-left flex items-center justify-between group"
                                >
                                    <div className="flex gap-6 items-center">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center font-black">
                                            <span className="text-[10px] text-slate-400 uppercase leading-none mb-1">
                                                {dist.data_envio ? new Date(dist.data_envio).toLocaleDateString('pt-BR', { month: 'short' }) : '---'}
                                            </span>
                                            <span className="text-lg text-slate-700">
                                                {dist.data_envio ? new Date(dist.data_envio).getDate() : '--'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-800 uppercase">Ordem #{dist.id.slice(0, 8)}</span>
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase">Em Trânsito</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                Motorista: {dist.motorista || 'Não informado'} • Placa: {dist.placa_veiculo || '---'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in slide-in-from-right duration-300 space-y-6">
                    <button
                        onClick={() => setSelectedDist(null)}
                        className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 hover:text-slate-600 transition-colors"
                    >
                        ← Voltar para lista
                    </button>

                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="bg-slate-50 p-8 border-b border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase">Confirmar Recebimento</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ordem de Distribuição: {selectedDist.id}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase block">Despachado em</span>
                                    <span className="text-xs font-black text-slate-700">{selectedDist.data_envio ? new Date(selectedDist.data_envio).toLocaleString() : '---'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ClipboardList className="w-3 h-3" /> Conferência de Itens
                                </h4>

                                <div className="divide-y divide-slate-50 border border-slate-100 rounded-[32px] overflow-hidden">
                                    {selectedDist.itens?.map(item => (
                                        <div key={item.id} className="p-6 bg-white hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-black text-slate-800 uppercase text-sm">{item.produto?.nome}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                                    LOTE: {item.lote || '---'} • VAL: {item.validade ? new Date(item.validade).toLocaleDateString() : '---'}
                                                </p>
                                                <div className="mt-2 text-[10px] font-black text-purple-600 uppercase">
                                                    Enviado: {item.quantidade_enviada} {item.produto?.unidade_medida}
                                                </div>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <div className="w-32">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Qtd. Recebida</label>
                                                    <input
                                                        type="number"
                                                        value={confirmationData[item.id].qty}
                                                        onChange={(e) => setConfirmationData(prev => ({
                                                            ...prev,
                                                            [item.id]: { ...prev[item.id], qty: Number(e.target.value) }
                                                        }))}
                                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-500 rounded-xl px-3 py-2 text-sm font-black text-slate-800 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-[200px]">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Divergências/Obs</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Embalagem danificada..."
                                                        value={confirmationData[item.id].obs}
                                                        onChange={(e) => setConfirmationData(prev => ({
                                                            ...prev,
                                                            [item.id]: { ...prev[item.id], obs: e.target.value }
                                                        }))}
                                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observações Gerais de Recebimento</label>
                                <textarea
                                    rows={3}
                                    value={observacoesGerais}
                                    onChange={(e) => setObservacoesGerais(e.target.value)}
                                    placeholder="Informações sobre o estado geral da entrega, veículos, horários, etc..."
                                    className="w-full bg-slate-50 border-none rounded-[24px] p-4 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleConfirmReceipt}
                                    className="flex items-center gap-3 px-10 py-5 bg-black text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    Confirmar Recebimento Digital
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributionReceiver;
