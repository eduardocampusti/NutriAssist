import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, InventoryMovement, School, MovementType, MovementPurpose, UserRole } from '../../types';
import {
    School as SchoolIcon,
    Search,
    Package,
    ArrowLeft,
    ArrowUpRight,
    ArrowDownLeft,
    PieChart,
    ChevronRight,
    ClipboardList,
    History,
    FileSearch,
    PlusCircle
} from 'lucide-react';
import StockAuditModal from './StockAuditModal';
import ReplenishmentRequestModal from './ReplenishmentRequestModal';
import { useUsers } from '../../contexts/UserContext';
import { useInventory } from '../../contexts/InventoryContext';
import { replenishmentService } from '../../services/replenishmentService';
import { StockAudit, ReplenishmentRequest } from '../../types';

interface SchoolStockManagerProps {
    inventory: InventoryItem[]; // Central Catalog info
    movements: InventoryMovement[];
    schools: School[];
    lockedSchoolId?: string;
}

const SchoolStockManager: React.FC<SchoolStockManagerProps> = ({ inventory, movements, schools, lockedSchoolId }) => {
    const [selectedSchoolId, setSelectedSchoolId] = useState(lockedSchoolId || '');
    const [searchTerm, setSearchTerm] = useState('');
    const { activeProfile } = useUsers();
    const { inventory: catalog } = useInventory(); // Catalog

    // Modals
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // History Data
    const [recentAudits, setRecentAudits] = useState<StockAudit[]>([]);
    const [recentRequests, setRecentRequests] = useState<ReplenishmentRequest[]>([]);

    useEffect(() => {
        if (selectedSchoolId) {
            refreshHistory();
        }
    }, [selectedSchoolId]);

    const refreshHistory = async () => {
        const audits = await replenishmentService.getAuditsBySchool(selectedSchoolId);
        const requests = await replenishmentService.getRequests({ schoolId: selectedSchoolId });
        setRecentAudits(audits);
        setRecentRequests(requests);
    };

    const allActiveSchools = schools.filter(s => s.ativo);
    const isNucleo = activeProfile?.role === UserRole.NUCLEO_ESCOLAR;

    const activeSchools = useMemo(() => {
        if (isNucleo && activeProfile?.zona_id) {
            return allActiveSchools.filter(s => s.zona_id === activeProfile.zona_id);
        }
        return allActiveSchools;
    }, [allActiveSchools, isNucleo, activeProfile?.zona_id]);

    // Calculate Stock for Selected School
    const schoolStock = useMemo(() => {
        if (!selectedSchoolId) return [];

        // 1. Filter movements related to this school
        const schoolMovs = movements.filter(m => m.schoolId === selectedSchoolId);

        // 2. Map items
        return inventory.map(item => {
            const entradas = schoolMovs
                .filter(m => m.itemId === item.id && m.tipo === MovementType.SAIDA && m.finalidade === MovementPurpose.REPOSICAO)
                .reduce((acc, m) => acc + m.quantidade, 0);

            const saidas = schoolMovs
                .filter(m => m.itemId === item.id && (m.tipo === MovementType.SAIDA && m.finalidade === MovementPurpose.REGULAR))
                .reduce((acc, m) => acc + m.quantidade, 0);

            const saldo = entradas - saidas;

            return {
                ...item,
                saldoEscola: saldo,
                entradas,
                saidas
            };
        }).filter(i => i.saldoEscola > 0 || i.entradas > 0);
    }, [selectedSchoolId, movements, inventory]);

    const filteredStock = schoolStock.filter(i => i.nome.includes(searchTerm.toUpperCase()));

    const currentSchool = schools.find(s => s.id === selectedSchoolId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HERO HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                            <SchoolIcon className="w-5 h-5 text-pink-600" />
                        </div>
                        Estoque por Escola
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {selectedSchoolId ? `Visualizando: ${currentSchool?.nome}` : 'Selecione uma unidade escolar'}
                    </p>
                </div>

                {selectedSchoolId && (
                    <div className="flex flex-wrap gap-4">
                        {/* SEARCH */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar item..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-48 md:w-64 outline-none transition-all focus:ring-2 focus:ring-pink-500/20 shadow-sm"
                            />
                        </div>

                        {/* ACTIONS FOR DIRECTOR */}
                        {lockedSchoolId && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAuditModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95"
                                >
                                    <FileSearch className="w-4 h-4" />
                                    Nova Auditoria
                                </button>
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Solicitar Reposição
                                </button>
                            </div>
                        )}

                        {!lockedSchoolId && (
                            <button
                                onClick={() => setSelectedSchoolId('')}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Mudar Escola
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!selectedSchoolId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSchools.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedSchoolId(s.id)}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <SchoolIcon className="w-24 h-24 text-pink-900" />
                            </div>

                            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                🏫
                            </div>

                            <h3 className="text-sm font-black text-slate-800 uppercase leading-snug mb-2 group-hover:text-pink-700">{s.nome}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {s.municipio} • {s.localidade}
                            </p>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">Acessar Inventário</span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* STATS OVERVIEW */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ArrowDownLeft className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recebido</p>
                                <h4 className="text-xl font-black text-slate-800">
                                    {schoolStock.reduce((acc, i) => acc + i.entradas, 0).toFixed(1)}
                                    <span className="text-[10px] ml-1 opacity-50 uppercase font-bold text-slate-400">un</span>
                                </h4>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Consumido</p>
                                <h4 className="text-xl font-black text-slate-800 text-red-500">
                                    - {schoolStock.reduce((acc, i) => acc + i.saidas, 0).toFixed(1)}
                                    <span className="text-[10px] ml-1 opacity-50 uppercase font-bold text-slate-400">un</span>
                                </h4>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo em Estoque</p>
                                <h4 className="text-xl font-black text-emerald-700">
                                    {schoolStock.reduce((acc, i) => acc + i.saldoEscola, 0).toFixed(1)}
                                    <span className="text-[10px] ml-1 opacity-50 uppercase font-bold text-slate-400">un</span>
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* INVENTORY TABLE */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-slate-400" /> Itens no Depósito da Unidade
                                </h3>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{filteredStock.length} Alimentos Identificados</div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Produto</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Entradas</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Saídas</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Posição Atual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStock.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic">
                                                    Nenhum alimento em estoque ou em trânsito para esta unidade.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStock.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-black text-slate-800 uppercase text-xs">{item.nome}</h5>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tight">Categoria: {item.categoria}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <p className="text-xs font-black text-blue-600">{item.entradas.toFixed(2)}</p>
                                                        <p className="text-[8px] font-bold text-slate-300 uppercase">{item.unidadeMedida}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right text-red-400">
                                                        <p className="text-xs font-black">- {item.saidas.toFixed(2)}</p>
                                                        <p className="text-[8px] font-bold text-slate-300 uppercase">{item.unidadeMedida}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className={`inline-flex px-4 py-2 rounded-2xl font-black text-xs ${item.saldoEscola <= 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100'
                                                            }`}>
                                                            {item.saldoEscola.toFixed(2)} <span className="ml-1 opacity-60 text-[10px]">{item.unidadeMedida}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTION */}
                    <div className="lg:col-span-12 flex justify-between items-center text-slate-400">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <History className="w-4 h-4" /> Última movimentação há 4 horas
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest hover:text-pink-600 transition-colors">
                            Exportar Balancete Escolar (.PDF)
                        </button>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {showAuditModal && activeProfile && (
                <StockAuditModal
                    schoolId={selectedSchoolId}
                    activeProfile={activeProfile}
                    items={schoolStock as any}
                    onClose={() => setShowAuditModal(false)}
                    onSuccess={refreshHistory}
                />
            )}

            {showRequestModal && activeProfile && (
                <ReplenishmentRequestModal
                    schoolId={selectedSchoolId}
                    activeProfile={activeProfile}
                    inventory={catalog}
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={refreshHistory}
                />
            )}
        </div>
    );
};

export default SchoolStockManager;
