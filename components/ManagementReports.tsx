
import React, { useState, useMemo } from 'react';
import { usePNAE } from '../contexts/PNAEContext';
import { FormalDocument, InventoryItem, InventoryMovement, NutritionalEvaluation, TrainingSession, ProcurementPlan, UserProfile, UserRole, School, DocStatus } from '../types';

interface ManagementReportsProps {
  documents: FormalDocument[];
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  evaluations: NutritionalEvaluation[];
  trainings: TrainingSession[];
  procurements: ProcurementPlan[];
  schools: School[];
  activeProfile?: UserProfile;
  onClose: () => void;
}

const ManagementReports: React.FC<ManagementReportsProps> = ({
  documents,
  inventory,
  movements,
  evaluations,
  trainings,
  procurements,
  schools,
  activeProfile,
  onClose
}) => {
  const { letterhead } = usePNAE();
  const [activeTab, setActiveTab] = useState<'docs' | 'inventory' | 'nutrition' | 'summary'>('summary');

  // ACCESS CONTROL
  const isAdmin = activeProfile?.role === UserRole.ADMIN;
  const isNutricionista = activeProfile?.role === UserRole.NUTRICIONISTA;
  const isTecnico = activeProfile?.role === UserRole.TECNICO;

  // DATA AGGREGATIONS
  const stats = useMemo(() => {
    // Documents
    const docCount = documents.length;
    const docByStatus = documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Inventory
    const stockItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.saldoAtual <= i.estoqueMinimo).length;

    // Consumption by school
    const consumptionBySchool = movements
      .filter(m => m.tipo === 'SAIDA' && m.schoolId)
      .reduce((acc, mov) => {
        const schoolName = schools.find(s => s.id === mov.schoolId)?.nome || 'Outros';
        acc[schoolName] = (acc[schoolName] || 0) + mov.quantidade;
        return acc;
      }, {} as Record<string, number>);

    // Nutrition
    const evalCount = evaluations.length;
    const riskCount = evaluations.filter(e => e.riscoIdentificado).length;

    // Trainings
    const trainingSessions = trainings.length;
    const totalParticipations = trainings.reduce((acc, t) => acc + t.numParticipantes, 0);

    // Bidding
    const procurementCount = procurements.length;

    return {
      docCount, docByStatus, stockItems, lowStockItems,
      consumptionBySchool, evalCount, riskCount,
      trainingSessions, totalParticipations, procurementCount
    };
  }, [documents, inventory, movements, evaluations, trainings, procurements, schools]);

  const SimpleBarChart = ({ data, color }: { data: Record<string, number>, color: string }) => {
    const maxVal = Math.max(...Object.values(data), 1);
    return (
      <div className="space-y-3">
        {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
              <span>{key.replace(/_/g, ' ')}</span>
              <span>{val}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-1000`}
                style={{ width: `${(val / maxVal) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-700 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg font-black border border-emerald-600">📊</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Painel de Gestão e Relatórios</h2>
            <p className="text-slate-500 text-sm italic">Consolidado Institucional • {letterhead.municipio || 'Brotas de Macaúbas'}/{letterhead.uf || 'BA'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['summary', 'docs', 'inventory', 'nutrition'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab === 'summary' ? 'Visão Geral' : tab === 'docs' ? 'Documentos' : tab === 'inventory' ? 'Estoque' : 'Saúde'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* TAB: SUMMARY (DASHBOARD) */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Eficiência Documental</span>
            <span className="text-5xl font-black text-slate-900">{stats.docCount}</span>
            <span className="text-[9px] font-bold text-emerald-600 mt-2 uppercase">Atos Redigidos</span>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Status de Suprimentos</span>
            <span className={`text-5xl font-black ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-slate-900'}`}>{stats.lowStockItems}</span>
            <span className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Itens em Alerta Crítico</span>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Impacto Nutricional</span>
            <span className="text-5xl font-black text-slate-900">{stats.evalCount}</span>
            <span className="text-[9px] font-bold text-amber-600 mt-2 uppercase">Alunos Avaliados</span>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Educação Permanente</span>
            <span className="text-5xl font-black text-slate-900">{stats.trainingSessions}</span>
            <span className="text-[9px] font-bold text-indigo-600 mt-2 uppercase">Sessões de Formação</span>
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Consumo Consolidado por Unidade Escolar (KG/L)</h3>
            {Object.keys(stats.consumptionBySchool).length === 0 ? (
              <p className="text-center text-slate-300 py-10 italic">Nenhum dado de movimentação para gerar o gráfico.</p>
            ) : (
              <SimpleBarChart data={stats.consumptionBySchool} color="bg-emerald-500" />
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">Planejamento Público</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Processos de Compra</span>
                <span className="text-xl font-black">{stats.procurementCount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Participações Merendeiras</span>
                <span className="text-xl font-black">{stats.totalParticipations}</span>
              </div>
              <button className="w-full bg-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                Gerar Relatório de Gestão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DOCS */}
      {activeTab === 'docs' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Fluxo de Trabalho de Atos Administrativos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <SimpleBarChart data={stats.docByStatus} color="bg-blue-500" />
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              <p className="font-black text-slate-800 uppercase mb-2">Análise de Produtividade Técnica:</p>
              <p>O monitoramento do status dos documentos permite identificar gargalos na análise técnica e homologação institucional. Documentos em "Ajuste" indicam a necessidade de maior alinhamento técnico entre a nutrição e o setor de validação.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Itens Abaixo do Estoque Mínimo</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {inventory.filter(i => i.saldoAtual <= i.estoqueMinimo).map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-xs font-black text-red-900 uppercase truncate max-w-[200px]">{item.nome}</span>
                  <span className="text-[10px] font-bold text-red-700">SALDO: {item.saldoAtual} {item.unidadeMedida}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Métricas de Suprimentos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <span className="block text-[9px] font-black text-slate-400 uppercase">Itens no Catálogo</span>
                <span className="text-2xl font-black text-slate-900">{stats.stockItems}</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <span className="block text-[9px] font-black text-emerald-800 uppercase">Saídas Registradas</span>
                <span className="text-2xl font-black text-emerald-900">{movements.filter(m => m.tipo === 'SAIDA').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: NUTRITION */}
      {activeTab === 'nutrition' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Estado Nutricional da Rede</h3>
            <div className="flex gap-12 items-center">
              <div className="relative w-32 h-32 rounded-full border-[16px] border-emerald-500 flex items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{((stats.evalCount - stats.riskCount) / (stats.evalCount || 1) * 100).toFixed(0)}%</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-black uppercase text-slate-600">Eutrofia / Normalidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-[10px] font-black uppercase text-slate-600">Alertas de Risco ({stats.riskCount})</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-indigo-900 p-8 rounded-2xl shadow-xl text-white">
            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4">Ações de Saúde Escolar</h3>
            <p className="text-[11px] leading-relaxed opacity-80 mb-6">
              O monitoramento nutricional subsidia a adequação dos cardápios para alunos com necessidades específicas e doenças crônicas não transmissíveis.
            </p>
            <button className="w-full bg-white text-indigo-900 py-2.5 rounded-lg text-[10px] font-black uppercase shadow-lg">Extrair Dados SISVAN</button>
          </div>
        </div>
      )}

      {/* FOOTER: ADMINISTRATIVE NEUTRALITY */}
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Reserva de Neutralidade Institucional</p>
        <p className="text-[10px] text-slate-500 max-w-2xl mx-auto leading-relaxed italic">
          "Este painel gerencial fornece dados consolidados para fins estritamente administrativos e de planejamento da alimentação escolar. Os valores apresentados são de natureza técnica, isentos de juízos de valor pessoal, visando a eficiência do Programa Nacional de Alimentação Escolar no município."
        </p>
      </div>
    </div>
  );
};

export default ManagementReports;
