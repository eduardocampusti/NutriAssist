
import React, { useState } from 'react';
import {
    ProcurementProcess,
    Contract,
    ProcessStatus,
    ContractStatus
} from '../types';
import { useToast } from '../contexts/ToastContext';

// MOCK DATA FOR UI DEVELOPMENT
const MOCK_PROCESSES: ProcurementProcess[] = [
    {
        id: '1',
        year: 2025,
        protocolNumber: '001/2025',
        modeId: 'dispensa_id',
        modeName: 'DISPENSA LEI 14.133',
        object: 'Aquisição de Hortifruti para o Mês de Fevereiro',
        estimatedValue: 15000.00,
        status: ProcessStatus.ANDAMENTO,
        afRequired: true,
        created_at: Date.now()
    },
    {
        id: '2',
        year: 2025,
        protocolNumber: '002/2025',
        modeId: 'chamada_id',
        modeName: 'CHAMADA PÚBLICA PNAE',
        object: 'Fornecimento de Gêneros da Agricultura Familiar (Anual)',
        estimatedValue: 120000.00,
        status: ProcessStatus.PLANEJAMENTO,
        afRequired: true,
        created_at: Date.now()
    }
];

const MOCK_CONTRACTS: Contract[] = [
    {
        id: 'c1',
        procurementId: '1',
        supplierId: 's1',
        supplierName: 'Cooperativa Agrícola Regional',
        contractNumber: '10/2024',
        startDate: '2024-02-01',
        endDate: '2025-02-01', // Expiring soon!
        totalValue: 50000,
        balanceRemaining: 1500, // Low balance
        status: ContractStatus.ATIVO,
        created_at: Date.now()
    }
];

export const LegalDashboard: React.FC = () => {
    const { addToast } = useToast();
    const [processes] = useState<ProcurementProcess[]>(MOCK_PROCESSES);
    const [contracts] = useState<Contract[]>(MOCK_CONTRACTS);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        ⚖️ Dashboard Jurídico & Gestão
                    </h1>
                    <p className="text-gray-500">Controle de Processos, Contratos e Conformidade PNAE</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    + Novo Processo
                </button>
            </header>

            {/* ALERTS SECTION */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">🚨 Alertas de Conformidade</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contracts.map(c => {
                        const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysLeft < 30;
                        const isLowBalance = c.balanceRemaining < (c.totalValue * 0.1);

                        if (!isExpiring && !isLowBalance) return null;

                        return (
                            <div key={c.id} className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h3 className="font-bold text-red-800">Atenção Contratual: {c.contractNumber}</h3>
                                    <p className="text-sm text-red-700">Fornecedor: {c.supplierName}</p>
                                    <ul className="text-sm mt-1 list-disc list-inside text-red-600">
                                        {isExpiring && <li>Vence em {daysLeft} dias ({c.endDate})</li>}
                                        {isLowBalance && <li>Saldo Baixo: R$ {c.balanceRemaining.toFixed(2)}</li>}
                                    </ul>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ACTIVE PROCESSES */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        📜 Processos em Andamento
                    </h2>
                    <div className="space-y-4">
                        {processes.map(proc => (
                            <div key={proc.id} className="border border-gray-100 rounded p-4 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                                        {proc.modeName}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${proc.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {proc.status}
                                    </span>
                                </div>
                                <h3 className="font-medium text-gray-900">{proc.protocolNumber} - {proc.object}</h3>
                                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                    <span>Valor Est.: R$ {proc.estimatedValue.toLocaleString('pt-BR')}</span>
                                    {proc.afRequired && <span className="text-green-600 font-bold">🌾 Agricultura Familiar</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTRACTS */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🤝 Contratos Vigentes
                    </h2>
                    <div className="space-y-4">
                        {contracts.map(contract => (
                            <div key={contract.id} className="border border-gray-100 rounded p-4 hover:shadow-md transition bg-gray-50">
                                <div className="flex justify-between mb-2">
                                    <span className="font-mono text-xs text-gray-500">#{contract.contractNumber}</span>
                                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                        {contract.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-800">{contract.supplierName}</h4>
                                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                    <div className="bg-white p-2 rounded border">
                                        <span className="block text-gray-400 text-xs">Valor Total</span>
                                        R$ {contract.totalValue.toLocaleString('pt-BR')}
                                    </div>
                                    <div className="bg-white p-2 rounded border">
                                        <span className="block text-gray-400 text-xs">Saldo Restante</span>
                                        <span className={contract.balanceRemaining < 1000 ? 'text-red-500 font-bold' : 'text-gray-700'}>
                                            R$ {contract.balanceRemaining.toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-gray-500 text-center">
                                    Vigência: {contract.startDate} a {contract.endDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI STRIP */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-emerald-500">
                    <h4 className="text-gray-500 text-sm">Execução PNAE (AF)</h4>
                    <p className="text-2xl font-bold text-gray-800">42% <span className="text-xs text-green-500">Meta: 45%</span></p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
                    <h4 className="text-gray-500 text-sm">Processos Abertos</h4>
                    <p className="text-2xl font-bold text-gray-800">2</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-yellow-500">
                    <h4 className="text-gray-500 text-sm">Contratos Vencendo</h4>
                    <p className="text-2xl font-bold text-gray-800">1</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-purple-500">
                    <h4 className="text-gray-500 text-sm">Total Comprometido</h4>
                    <p className="text-2xl font-bold text-gray-800">R$ 171k</p>
                </div>
            </div>
        </div>
    );
};
