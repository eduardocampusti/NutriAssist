
import React from 'react';
import { School, InventoryMovement, InventoryItem, UserProfile, LetterheadConfig } from '../../types';
import { OfficialLetterhead } from '../OfficialLetterhead';

interface DistributionReportProps {
    school: School;
    movements: InventoryMovement[]; // Items in this shipment
    inventory: InventoryItem[];
    date: number;
    user: UserProfile;
    config?: LetterheadConfig;
    onClose: () => void;
}

const DistributionReport: React.FC<DistributionReportProps> = ({ school, movements, inventory, date, user, config, onClose }) => {

    const handlePrint = () => {
        window.print();
    };

    const totalItems = movements.length;
    const totalVolume = movements.reduce((acc, m) => acc + m.quantidade, 0);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="min-h-full flex items-center justify-center p-4 print:p-0 print:block">
                <div className="bg-white w-full max-w-4xl min-h-[297mm] p-12 shadow-2xl rounded-xl relative print:shadow-none print:w-full print:max-w-none print:rounded-none print:min-h-0">

                    {/* ACTIONS - HIDE ON PRINT */}
                    <div className="flex justify-between mb-8 print:hidden sticky top-0 bg-white/90 backdrop-blur pt-4 pb-4 z-10 border-b border-slate-100">
                        <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">
                            ← Voltar
                        </button>
                        <button onClick={handlePrint} className="px-6 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 shadow-lg flex items-center gap-2">
                            🖨️ Imprimir / Salvar PDF
                        </button>
                    </div>

                    {/* OFFICIAL HEADER (LETTERHEAD) */}
                    {config && (
                        <OfficialLetterhead
                            config={config}
                            title="Romaneio de Entrega"
                            className="mb-8"
                        />
                    )}

                    {/* INFO */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Destino (Unidade Escolar)</p>
                            <p className="text-lg font-black uppercase text-slate-900 leading-tight">{school.nome}</p>
                            <p className="text-xs uppercase text-slate-600 mt-1">{school.municipio} • {school.numAlunos} Alunos</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Dados da Carga</p>
                            <p className="text-sm font-bold text-slate-800">Responsável: <span className="font-normal uppercase">{user?.nome || 'Expedição Central'}</span></p>
                            <p className="text-sm font-bold text-slate-800">Data de Saída: <span className="font-normal">{new Date(date).toLocaleDateString('pt-BR')} às {new Date(date).toLocaleTimeString('pt-BR')}</span></p>
                            <p className="text-sm font-bold text-slate-800">Volumes: <span className="font-normal">{totalItems} itens ({totalVolume.toFixed(2)} un. total)</span></p>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="mb-12">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-y-2 border-slate-900">
                                    <th className="py-3 px-4 font-black uppercase w-16">Item</th>
                                    <th className="py-3 px-4 font-black uppercase">Descrição do Produto</th>
                                    <th className="py-3 px-4 font-black uppercase text-center w-24">Unid.</th>
                                    <th className="py-3 px-4 font-black uppercase text-right w-32">Qtd. Enviada</th>
                                    <th className="py-3 px-4 font-black uppercase text-right w-32">Qtd. Recebida</th>
                                    <th className="py-3 px-4 font-black uppercase text-right w-32">Conferência</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 border-b border-slate-900">
                                {movements.map((mov, idx) => {
                                    const item = inventory.find(i => i.id === mov.itemId);
                                    return (
                                        <tr key={idx} className="print:bg-transparent even:bg-slate-50">
                                            <td className="py-3 px-4 font-mono text-slate-500 text-center">{idx + 1}</td>
                                            <td className="py-3 px-4 font-bold uppercase text-slate-800">{item?.nome || 'Item Removido'}</td>
                                            <td className="py-3 px-4 text-center text-slate-600 uppercase text-xs">{item?.unidadeMedida}</td>
                                            <td className="py-3 px-4 text-right font-black text-slate-900 text-lg">{mov.quantidade}</td>
                                            <td className="py-3 px-4 text-right font-black text-emerald-600 text-lg">{(mov as any).quantidade_recebida || ''}</td>
                                            <td className="py-3 px-4 border-l border-slate-200"></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* SIGNATURES */}
                    <div className="grid grid-cols-2 gap-12 pt-12 break-inside-avoid">
                        <div className="text-center">
                            <div className="border-t border-slate-900 pt-2 h-20"></div>
                            <p className="font-bold uppercase text-sm">Responsável pela Entrega</p>
                            <p className="text-xs text-slate-500 uppercase">Transporte / Logística</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-slate-900 pt-2 h-20"></div>
                            <p className="font-bold uppercase text-sm">Recebido por</p>
                            <p className="text-xs text-slate-500 uppercase">{school.nome}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Data: ____/____/________</p>
                        </div>
                    </div>

                    {/* OFFICIAL FOOTER (LETTERHEAD) */}
                    {config && (
                        <OfficialLetterhead
                            config={config}
                            type="footer"
                            className="mt-auto pt-6 opacity-80"
                        />
                    )}

                </div>

            </div>
        </div >
    );
};

export default DistributionReport;
