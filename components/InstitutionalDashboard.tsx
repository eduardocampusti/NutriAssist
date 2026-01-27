import React, { useMemo, useState } from 'react';
import { AccessGate } from './Security/AccessGate';
import SMEExecutiveDashboard from './SMEExecutiveDashboard';
import { EducationalStage } from '../types';
import { FormalDocument, InventoryItem, NutritionalEvaluation, TrainingSession, ProcurementPlan, UserProfile, School, DocStatus, UserRole, MenuPlan, MenuExecution, StudentNE } from '../types';
import { hasPermission } from '../utils/permissions';
import { useDocuments } from '../contexts/DocumentContext';
import { useInventory } from '../contexts/InventoryContext';
import { useNutrition } from '../contexts/NutritionContext';
import { usePNAE } from '../contexts/PNAEContext';
import { useSchools } from '../contexts/SchoolContext';
import { useMenu } from '../contexts/MenuContext';
import { useUsers } from '../contexts/UserContext';
import { replenishmentService } from '../services/replenishmentService';
import { occurrenceService } from '../services/occurrenceService';
import { distributionService } from '../services/distributionService';
import { StockAudit, ReplenishmentRequest, OperationalOccurrence, Distribution } from '../types';
import AlertWidget from './AlertWidget';
import SchoolServiceHistory from './SchoolServiceHistory';
import { priorityEngine } from '../services/priorityEngine';

const InstitutionalDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { formalDocs: documents } = useDocuments();
  const { inventory, movements } = useInventory();
  const { evaluations, trainings } = useNutrition();
  const { procurements, letterhead } = usePNAE();
  const { schools, studentsNE } = useSchools();
  const { menuPlans, executions } = useMenu();
  const { activeProfile } = useUsers();
  const [activeTab, setActiveTab] = useState<'operational' | 'executive'>('operational');

  // Adicionais para o executivo
  const [audits, setAudits] = useState<StockAudit[]>([]);
  const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
  const [occurrences, setOccurrences] = useState<OperationalOccurrence[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);

  React.useEffect(() => {
    const fetchAnalyticalData = async () => {
      try {
        const [audData, reqData, occData, distData] = await Promise.all([
          replenishmentService.getAllAudits(),
          replenishmentService.getRequests(),
          occurrenceService.list(),
          distributionService.listDistributions()
        ]);
        setAudits(audData);
        setRequests(reqData);
        setOccurrences(occData);
        setDistributions(distData);

        // Recalcular prioridades técnicas para garantir dados frescos no dashboard
        if ([UserRole.ADMIN, UserRole.SECRETARIO].includes(activeProfile?.role as UserRole)) {
          await priorityEngine.recalculateAllPriorities();
        }
      } catch (err) {
        console.error("Erro ao carregar dados executivos:", err);
      }
    };
    fetchAnalyticalData();
  }, []);

  // Set default tab based on profile when it loads
  React.useEffect(() => {
    if ([UserRole.ADMIN, UserRole.SECRETARIO, UserRole.SECRETARIA].includes(activeProfile?.role as UserRole)) {
      setActiveTab('executive');
    }
  }, [activeProfile?.role]);

  // Filters State
  const [filters, setFilters] = useState({
    schoolId: '',
    stage: '' as EducationalStage | '',
    period: new Date().getFullYear().toString()
  });

  // Filtered Data
  const filteredData = useMemo(() => {
    let fDocs = [...documents];
    let fInventory = [...inventory];
    let fEvaluations = [...evaluations];
    let fExecutions = [...executions];
    let fPlans = [...menuPlans];
    let fStudentsNE = [...studentsNE];

    if (filters.schoolId) {
      fDocs = fDocs.filter(d => {
        const dest = d.content?.destinatario || '';
        return dest.includes(filters.schoolId) || d.responsavel_id === filters.schoolId;
      });
      fEvaluations = fEvaluations.filter(e => e.escolaId === filters.schoolId);
      fExecutions = fExecutions.filter(ex => ex.schoolId === filters.schoolId);
      fPlans = fPlans.filter(p => p.escolaId === filters.schoolId);
      fStudentsNE = fStudentsNE.filter(s => s.escolaId === filters.schoolId);
    }

    if (filters.stage) {
      fEvaluations = fEvaluations.filter(e => e.etapa === filters.stage);
      fPlans = fPlans.filter(p => p.etapa === filters.stage);
    }

    return { fDocs, fInventory, fEvaluations, fExecutions, fPlans, fStudentsNE };
  }, [filters, documents, inventory, evaluations, executions, menuPlans, studentsNE]);

  const stats = useMemo(() => {
    // Calculate Family Agriculture Percentage based on Entry movements and current batch data
    const totalSpent = movements
      .filter(m => m.tipo === 'ENTRADA' && (m.valuePerUnit || 0) > 0)
      .reduce((acc, m) => acc + (m.quantidade * (m.valuePerUnit || 0)), 0);

    const afSpent = movements
      .filter(m => {
        if (m.tipo !== 'ENTRADA') return false;
        const item = inventory.find(i => i.id === m.itemId);
        return item?.origemPadrao === 'AGRICULTURA_FAMILIAR';
      })
      .reduce((acc, m) => acc + (m.quantidade * (m.valuePerUnit || 0)), 0);

    const afPercent = totalSpent > 0 ? (afSpent / totalSpent) * 100 : 0;

    // Fallback if no real movement data exists yet for AF
    const effectiveAFPercent = afPercent > 0 ? afPercent : 0;

    return {
      totalDocs: filteredData.fDocs.length,
      lowStock: inventory.filter(i => (i.saldoAtual || 0) <= (i.estoqueMinimo || 0)).length,
      evals: filteredData.fEvaluations.length,
      schools: schools.filter(s => s.ativo).length,
      trainings: trainings.length,
      activeProc: procurements.length,
      afPercent: effectiveAFPercent,
      ultraProcessedCount: inventory.filter(i => i.isUltraProcessed).length,
      sisvanRisk: filteredData.fEvaluations.filter(e => e.riscoIdentificado).length
    };
  }, [filteredData, inventory, movements, schools, trainings, procurements]);

  const StatCard = ({ title, value, icon, color, onClick }: any) => (
    <button
      onClick={onClick}
      className="glass-card soft-shadow p-8 rounded-[32px] text-left hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] -mr-8 -mt-8 rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity`}></div>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        </div>
      </div>
      <div className="text-4xl font-extrabold text-slate-900 tracking-tighter mb-1">{value}</div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoramento Ativo</p>
      </div>
    </button>
  );

  return (
    <div className="page-transition space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-full tracking-widest">{letterhead.municipio || 'SME'}</span>
            <span className="text-slate-300 text-lg">•</span>
            <span className="text-slate-400 text-sm font-semibold italic">Gestão Inteligente PNAE</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Bem-vindo(a), <span className="text-emerald-600">{activeProfile?.nome?.split(' ')[0] || 'Visitante'}</span>.
          </h1>
        </div>

        <div className="flex flex-col md:items-end gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab('operational')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'operational' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Visão Operacional
            </button>
            <button
              onClick={() => setActiveTab('executive')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'executive' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Painel Executivo
            </button>
          </div>

          <div className="flex gap-2">
            {activeProfile?.role !== UserRole.SECRETARIO && (
              <button
                onClick={() => onNavigate('form')}
                className="bg-slate-900 text-white px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
              >
                <span>✍️</span> Nova Redação
              </button>
            )}
            <button
              onClick={() => onNavigate('archive')}
              className="bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
            >
              <span>👁️</span> Arquivo
            </button>
          </div>
        </div>
      </header >

      {/* GLOBAL FILTERS */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Unidade Escolar</label>
          <select
            value={filters.schoolId}
            onChange={(e) => setFilters({ ...filters, schoolId: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            <option value="">Todas as Escolas</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Modalidade / Faixa</label>
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value as any })}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            <option value="">Todas as Etapas</option>
            {Object.values(EducationalStage).map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="w-32">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ano Exercício</label>
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {activeTab === 'operational' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AlertWidget
              activeProfile={activeProfile!}
              onViewAll={() => onNavigate('inventory')}
            />
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Monitoramento Ativo</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                O sistema está analisando automaticamente o estoque e o consumo planejado para prevenir faltas.
                Verifique os alertas ao lado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Atos Oficiais" value={stats.totalDocs} icon="📄" color="bg-blue-500" onClick={() => onNavigate('archive')} />
            <StatCard title="Almoxarifado" value={stats.lowStock > 0 ? `${stats.lowStock} CRÍTICOS` : 'ESTÁVEL'} icon="📦" color="bg-orange-500" onClick={() => onNavigate('inventory')} />
            <StatCard title="Saúde Escolar" value={stats.evals} icon="⚖️" color="bg-amber-500" onClick={() => onNavigate('nutritional')} />
            {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && (
              <StatCard title="Unidades" value={stats.schools} icon="🏫" color="bg-indigo-500" onClick={() => onNavigate('schools')} />
            )}
          </div>

          {/* HIGH PRIORITY SCHOOLS SECTION */}
          {activeTab === 'operational' && (
            <div className="bg-white p-10 rounded-[44px] border border-slate-100 soft-shadow">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Prioridade Técnica de Atendimento</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Classificação Automática por Alertas e Demanda</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atenção Imediata</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools
                  .filter(s => s.prioridade_nivel === 'ALTA' && s.ativo)
                  .slice(0, 3)
                  .map(s => (
                    <div key={s.id} className="p-6 bg-red-50 rounded-3xl border border-red-100 flex justify-between items-center group hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer" onClick={() => onNavigate('schools')}>
                      <div>
                        <h4 className="text-sm font-black text-red-900 group-hover:text-white uppercase transition-colors">{s.nome}</h4>
                        <p className="text-[10px] font-bold text-red-500 group-hover:text-red-100 uppercase tracking-widest transition-colors mt-1">{s.prioridade_score} Pontos Técnicos</p>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">🚨</div>
                    </div>
                  ))
                }
                {schools.filter(s => s.prioridade_nivel === 'ALTA' && s.ativo).length === 0 && (
                  <div className="col-span-full py-8 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhuma unidade em nível de prioridade ALTA no momento.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card rounded-[40px] p-10 soft-shadow">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Atividades Prioritárias</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 30 dias</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && (
                  <div className="flex gap-6 items-start group">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-[24px] flex items-center justify-center text-3xl shadow-xl transition-all group-hover:scale-110">👩‍🍳</div>
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.trainings}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Capacitações</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Treinamentos realizados com a equipe de merenda.</p>
                    </div>
                  </div>
                )}
                {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
                  <div className="flex gap-6 items-start group cursor-pointer" onClick={() => onNavigate('pnae')}>
                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center text-3xl shadow-xl transition-all group-hover:scale-110">📑</div>
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.activeProc}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Editais PNAE</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Chamadas públicas da Agricultura Familiar.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6">🚩</div>
                <h3 className="text-2xl font-black tracking-tighter mb-4 leading-tight">Diretriz da Agricultura Familiar</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Meta PNAE: Mínimo de 45% dos recursos destinados à compra direta do produtor local (Lei 15.226/2025).
                </p>
              </div>
              <div className="relative z-10 pt-10">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-black text-white">{stats.afPercent.toFixed(1)}%</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${stats.afPercent >= 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {stats.afPercent >= 30 || stats.afPercent === 0 ? 'Monitorando' : 'Abaixo da Meta'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${stats.afPercent >= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.max(stats.afPercent, 5)}%` }}></div>
                  </div>
                </div>
                {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
                  <button
                    onClick={() => onNavigate('pnae')}
                    className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all outline-none"
                  >
                    Auditar Cota Municipal
                  </button>
                )}
              </div>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500 opacity-[0.05] rounded-full blur-[80px] group-hover:opacity-[0.15] transition-opacity"></div>
            </div>
          </div>

          <section className="bg-white rounded-[44px] p-12 border border-slate-100 soft-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Conformidade e Triagem</h2>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Vigilância Nutricional SISVAN e Qualidade PNAE</p>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Tempo Real</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between group hover:border-emerald-200 transition-colors">
                <div>
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">🌾</span>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto na Economia Local</h4>
                  <p className="text-sm text-slate-600 font-medium mb-4">Investimento direto no produtor rural de Brotas.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-slate-900">{stats.afPercent.toFixed(1)}%</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Agricultura Familiar</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.max(stats.afPercent, 5)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between group hover:border-amber-200 transition-colors">
                <div>
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">🚫</span>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Qualidade Nutricional</h4>
                  <p className="text-sm text-slate-600 font-medium mb-4">Restrição de ultraprocessados (Res. 06/2020).</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-slate-900">{String(stats.ultraProcessedCount).padStart(2, '0')}</span>
                    <span className="text-[10px] font-black text-amber-600 uppercase">Alertas Ativos</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(stats.ultraProcessedCount / Math.max(inventory.length, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between border-b-4 border-b-rose-500 group hover:border-rose-200 transition-colors">
                <div>
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">🩺</span>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Risco SISVAN (Antropometria)</h4>
                  <p className="text-sm text-slate-600 font-medium mb-4">Avaliações com desvio de curva identificado.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Alunos em Risco</span>
                    <span className="bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">{stats.sisvanRisk}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('nutritional')}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                  >
                    Inspecionar SISVAN
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AccessGate permission="MANAGE_DISTRIBUTION">
              <button
                onClick={() => onNavigate('inventory')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl text-purple-600 transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  🚚
                </div>
                <span className="text-[10px] font-black uppercase">Distribuição</span>
              </button>
            </AccessGate>
          </div>
          <div className="mt-12">
            <SchoolServiceHistory activeProfile={activeProfile!} />
          </div>
        </>
      ) : (
        <SMEExecutiveDashboard
          menuPlans={filteredData.fPlans}
          executions={filteredData.fExecutions}
          studentsNE={filteredData.fStudentsNE}
          inventory={inventory}
          evaluations={filteredData.fEvaluations}
          schools={schools}
          audits={audits}
          requests={requests}
          occurrences={occurrences}
          distributionsByStatus={{}} // Opcional se for usar mais detalhes depois
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

export default InstitutionalDashboard;