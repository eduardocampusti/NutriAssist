
import React from 'react';
import { InventoryItem, InventoryBatch, Supplier, InventoryMovement, LetterheadConfig, School, MovementType, InventoryCategory, SupplierType } from '../../types';
import { OfficialLetterhead } from '../OfficialLetterhead';

interface InventoryReportViewProps {
    type: 'BALANCE' | 'VALIDITY' | 'MOVEMENTS' | 'MAPA_DIARIO' | 'LOW_STOCK' | 'FULL_STOCK' | 'PERISHABLE' | 'FAMILY_AGRI';
    inventory: InventoryItem[];
    batches: InventoryBatch[];
    movements: InventoryMovement[];
    suppliers: Supplier[];
    schools: School[];
    config?: LetterheadConfig;
    onClose: () => void;
}

const InventoryReportView: React.FC<InventoryReportViewProps> = ({
    type,
    inventory,
    batches,
    movements,
    suppliers,
    schools,
    config,
    onClose
}) => {

    const now = Date.now();

    const handlePrint = () => {
        window.print();
    };

    const getReportTitle = () => {
        switch (type) {
            case 'BALANCE': return 'Relatório de Posição de Estoque';
            case 'VALIDITY': return 'Relatório de Alertas de Validade (PVPS)';
            case 'MOVEMENTS': return 'Histórico de Movimentações';
            case 'MAPA_DIARIO': return 'Mapa Diário de Depósito Central';
            case 'LOW_STOCK': return 'Relatório de Itens em Ruptura (Estoque Baixo)';
            case 'FULL_STOCK': return 'Relatório de Itens em Conformidade (Estoque Cheio)';
            case 'PERISHABLE': return 'Relatório de Itens Perecíveis / Higenização';
            case 'FAMILY_AGRI': return 'Relatório de Agricultura Familiar (PNAE)';
            default: return 'Relatório de Inventário';
        }
    };

    // Helper functions for filtering
    const calculateItemBalance = (itemId: string) => {
        return batches.filter(b => b.itemId === itemId && b.ativo).reduce((acc, b) => acc + b.saldoAtual, 0);
    };

    const isPerishable = (cat: InventoryCategory) => {
        return [InventoryCategory.PEREATIVEL, InventoryCategory.HORTIFRUTI, InventoryCategory.CONGELADO].includes(cat);
    };

    const getFilteredItems = () => {
        switch (type) {
            case 'LOW_STOCK':
                return inventory.filter(i => calculateItemBalance(i.id) < i.estoqueMinimo);
            case 'FULL_STOCK':
                return inventory.filter(i => calculateItemBalance(i.id) >= i.estoqueMinimo);
            case 'PERISHABLE':
                return inventory.filter(i => isPerishable(i.categoria));
            case 'FAMILY_AGRI':
                // For Family Agri, we might want to list either items that usually come from AF 
                // OR batches that ARE currently from AF. Let's do batches for a real "inventory" report.
                return []; // We handle this separately below with a different table structure
            default:
                return inventory.filter(i => i.ativo);
        }
    };

    const filteredItems = getFilteredItems();

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="min-h-full flex items-center justify-center p-8 print:p-0 print:block">
                <div className="bg-white w-full max-w-5xl min-h-[297mm] p-16 shadow-2xl rounded-[40px] relative print:shadow-none print:w-full print:max-w-none print:rounded-none print:p-8">

                    {/* TOP ACTIONS */}
                    <div className="flex justify-between items-center mb-10 print:hidden border-b border-slate-100 pb-6">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all uppercase text-[10px] tracking-widest"
                        >
                            ← Fechar Relatório
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl transition-all uppercase text-[10px] tracking-widest"
                        >
                            🖨️ Exportar / Imprimir PDF
                        </button>
                    </div>

                    {/* OFFICIAL HEADER (LETTERHEAD) */}
                    {config && (
                        <OfficialLetterhead
                            config={config}
                            title={getReportTitle()}
                            className="mb-10"
                        />
                    )}

                    {/* CONTENT DYNAMICS */}
                    <div className="min-h-[600px]">

                        {/* ITEM-BASED REPORTS (BALANCE, LOW, FULL, PERISHABLE) */}
                        {['BALANCE', 'LOW_STOCK', 'FULL_STOCK', 'PERISHABLE'].includes(type) && (
                            <table className="w-full text-left border-collapse border-b-2 border-slate-900">
                                <thead>
                                    <tr className="bg-slate-50 border-y-2 border-slate-900">
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Alimento</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Categoria</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Saldo Atual</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Mínimo</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-center">Situação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map(item => {
                                        const saldo = calculateItemBalance(item.id);
                                        const isLow = saldo < item.estoqueMinimo;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4 font-bold uppercase text-slate-800 text-xs">{item.nome}</td>
                                                <td className="py-4 px-4 text-slate-500 uppercase text-[10px] font-bold">{item.categoria}</td>
                                                <td className="py-4 px-4 text-right font-black text-slate-900">
                                                    {saldo} <span className="text-[9px] text-slate-400 ml-1">{item.unidadeMedida}</span>
                                                </td>
                                                <td className="py-4 px-4 text-right text-slate-500 font-bold">
                                                    {item.estoqueMinimo} {item.unidadeMedida}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {isLow ? (saldo === 0 ? 'RUPTURA' : 'ABAIXO') : (saldo > item.estoqueMinimo * 2 ? 'CHEIO' : 'OK')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* AGRICULTURE FAMILY REPORT (Specific Logic) */}
                        {type === 'FAMILY_AGRI' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-200">🌱</div>
                                    <div>
                                        <h4 className="text-lg font-black text-emerald-900 text-sm">Controle de Aquisições - Agricultura Familiar</h4>
                                        <p className="text-sm text-emerald-700/80 uppercase font-bold tracking-tight">Listagem de lotes originários da Chamada Pública (PNAE 45%).</p>
                                    </div>
                                </div>
                                <table className="w-full text-left border-collapse border-b-2 border-slate-900">
                                    <thead>
                                        <tr className="bg-slate-50 border-y-2 border-slate-900">
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Produto</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Produtor / Origem</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Qtd. Atual</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Valor Unit.</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {batches
                                            .filter(b => {
                                                const s = suppliers.find(sup => sup.id === b.supplierId);
                                                return b.ativo && b.saldoAtual > 0 && s?.tipo === SupplierType.AGRICULTURA_FAMILIAR;
                                            })
                                            .map(batch => {
                                                const item = inventory.find(i => i.id === batch.itemId);
                                                const supplier = suppliers.find(sup => sup.id === batch.supplierId);
                                                return (
                                                    <tr key={batch.id}>
                                                        <td className="py-4 px-4 font-bold uppercase text-slate-800 text-xs">{item?.nome}</td>
                                                        <td className="py-4 px-4 text-slate-500 uppercase text-[10px] font-bold">{supplier?.nome || 'PRODUTOR LOCAL'}</td>
                                                        <td className="py-4 px-4 text-right font-black text-slate-900">{batch.saldoAtual} {item?.unidadeMedida}</td>
                                                        <td className="py-4 px-4 text-right text-slate-500 font-bold">R$ {batch.valorUnitario.toFixed(2)}</td>
                                                        <td className="py-4 px-4 text-right font-black text-emerald-600">
                                                            R$ {(batch.saldoAtual * batch.valorUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-emerald-50 font-black">
                                            <td colSpan={4} className="py-4 px-4 uppercase text-[10px] tracking-widest text-emerald-900">Total Investido em Agricultura Familiar</td>
                                            <td className="py-4 px-4 text-right text-emerald-900 text-lg">
                                                R$ {batches
                                                    .filter(b => {
                                                        const s = suppliers.find(sup => sup.id === b.supplierId);
                                                        return b.ativo && b.saldoAtual > 0 && s?.tipo === SupplierType.AGRICULTURA_FAMILIAR;
                                                    })
                                                    .reduce((acc, b) => acc + (b.saldoAtual * b.valorUnitario), 0)
                                                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {type === 'VALIDITY' && (
                            <div className="space-y-8">
                                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-orange-200">⚠️</div>
                                    <div>
                                        <h4 className="text-lg font-black text-orange-900">Análise Proativa de Validade (PVPS)</h4>
                                        <p className="text-sm text-orange-700/80 uppercase font-bold tracking-tight">Listagem de lotes com vencimento nos próximos 90 dias ou já expirados.</p>
                                    </div>
                                </div>
                                <table className="w-full text-left border-collapse border-b-2 border-slate-900">
                                    <thead>
                                        <tr className="bg-slate-50 border-y-2 border-slate-900">
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Produto</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-center">Lote</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-center">Vencimento</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Saldo</th>
                                            <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-center">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {batches
                                            .filter(b => b.ativo && b.saldoAtual > 0)
                                            .sort((a, b) => a.validade - b.validade)
                                            .map(batch => {
                                                const item = inventory.find(i => i.id === batch.itemId);
                                                const days = Math.ceil((batch.validade - now) / (1000 * 60 * 60 * 24));
                                                const status = days < 0 ? 'VENCIDO' : days < 30 ? 'CRÍTICO' : 'ALERTA';
                                                return (
                                                    <tr key={batch.id}>
                                                        <td className="py-4 px-4 font-bold uppercase text-slate-800 text-xs">{item?.nome}</td>
                                                        <td className="py-4 px-4 text-center font-mono text-slate-500">{batch.loteCod}</td>
                                                        <td className="py-4 px-4 text-center">
                                                            <p className="font-bold text-slate-800">{new Date(batch.validade).toLocaleDateString('pt-BR')}</p>
                                                            <p className={`text-[9px] font-black uppercase ${days < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                                                {days < 0 ? 'EXPIRADO' : `Faltam ${days} dias`}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-black text-slate-900">{batch.saldoAtual} {item?.unidadeMedida}</td>
                                                        <td className="py-4 px-4 text-center">
                                                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${days < 0 ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {type === 'MOVEMENTS' && (
                            <table className="w-full text-left border-collapse border-b-2 border-slate-900">
                                <thead>
                                    <tr className="bg-slate-50 border-y-2 border-slate-900">
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Data</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Tipo</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Produto</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-center">Destino/Origem</th>
                                        <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest text-right">Qtd.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...movements].reverse().slice(0, 50).map(mov => {
                                        const item = inventory.find(i => i.id === mov.itemId);
                                        const school = schools.find(s => s.id === mov.schoolId);
                                        return (
                                            <tr key={mov.id}>
                                                <td className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase">{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`text-[8px] font-black px-2 py-1 rounded-full ${mov.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {mov.tipo}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-bold uppercase text-slate-800 text-xs">{item?.nome}</td>
                                                <td className="py-4 px-4 text-center text-[10px] font-black text-slate-400">
                                                    {school?.nome || mov.purpose || '--'}
                                                </td>
                                                <td className="py-4 px-4 text-right font-black text-slate-900">
                                                    {mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.quantidade}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* SIGNATURES AREA */}
                    <div className="grid grid-cols-2 gap-20 mt-20 pt-10 border-t-2 border-slate-100 break-inside-avoid">
                        <div className="text-center space-y-4">
                            <div className="border-t border-slate-900 w-full mx-auto pt-4 h-24"></div>
                            <div>
                                <p className="font-black uppercase text-xs text-slate-900">Responsável Técnico / Estoquista</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Almoxarifado</p>
                            </div>
                        </div>
                        <div className="text-center space-y-4">
                            <div className="border-t border-slate-900 w-full mx-auto pt-4 h-24"></div>
                            <div>
                                <p className="font-black uppercase text-xs text-slate-900">Visto Nutricionista Responsável</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNAE Compliance</p>
                            </div>
                        </div>
                    </div>

                    {/* OFFICIAL FOOTER (LETTERHEAD) */}
                    {config && (
                        <OfficialLetterhead
                            config={config}
                            type="footer"
                            className="mt-16 opacity-80"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryReportView;
