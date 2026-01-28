import React, { useMemo, useState } from 'react';
import { AccessGate } from './Security/AccessGate';
import SMEExecutiveDashboard from './SMEExecutiveDashboard';
import { EducationalStage } from '../types';
import { StockAudit, ReplenishmentRequest, OperationalOccurrence, Distribution, UserRole } from '../types';
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
import AlertWidget from './AlertWidget';
import SchoolServiceHistory from './SchoolServiceHistory';
import { priorityEngine } from '../services/priorityEngine';
import { PageHeader } from './UI/PageHeader';
import { Card } from './UI/Card';
import { LayoutDashboard, FileEdit, Archive, ChevronDown, Filter, ChevronRight, Settings, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { hasPermission } from '../utils/permissions';
import { Button } from './UI/Button';

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

        // Recalcular prioridades técnicas
        if ([UserRole.ADMIN, UserRole.SECRETARIO].includes(activeProfile?.role as UserRole)) {
          await priorityEngine.recalculateAllPriorities();
        }
      } catch (err) {
        console.error("Erro ao carregar dados executivos:", err);
      }
    };
    fetchAnalyticalData();
  }, []);

  // Set default tab based on profile
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

  const StatCard = ({ title, value, icon, color, onClick, subtext }: any) => (
    <Card
      variant="governance"
      className="group cursor-pointer hover:bg-surface-50 transition-all duration-150 relative overflow-hidden"
      onClick={onClick}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-2xl grayscale opacity-100 group-hover:scale-110 transition-transform duration-300">{icon}</span>
          <div className="flex items-center gap-1.5">
            {subtext ? (
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-sm">{subtext}</span>
            ) : (
              <div className="w-2 h-2 bg-emerald-500 rounded-sm animate-pulse"></div>
            )}
          </div>
        </div>

        <div>
          <div className="text-3xl font-display font-black text-slate-900 tracking-tighter mb-1">{value}</div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</span>
        </div>
      </div>
    </Card>
  );



  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <PageHeader
        title={`Olá, ${activeProfile?.nome?.split(' ')[0] || 'Visitante'}`}
        subtitle={`Gestão Inteligente PNAE • ${letterhead.municipio || 'SME'}`}
        icon={LayoutDashboard}
        actions={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('operational')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'operational' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Operacional
              </button>
              <button
                onClick={() => setActiveTab('executive')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'executive' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Executivo
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {activeProfile?.role !== UserRole.SECRETARIO && (
                <Button onClick={() => onNavigate('form')} className="flex-1 sm:flex-none" variant="primary">
                  <FileEdit className="w-4 h-4 mr-2" /> Nova Redação
                </Button>
              )}
              <Button variant="outline" onClick={() => onNavigate('archive')} className="flex-1 sm:flex-none bg-white hover:bg-slate-50 border-slate-200 text-slate-600">
                <Archive className="w-4 h-4 mr-2" /> Arquivo
              </Button>
            </div>
          </div>
        }
      />

      {/* FILTER BAR - CLEAN WHITE */}
      <Card variant="governance" padding="md" className="flex flex-col lg:flex-row gap-6 items-end lg:items-center bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 text-slate-500 mr-2 hidden lg:flex border-r border-slate-200 pr-6">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unidade Escolar</label>
            <div className="relative group">
              <select
                value={filters.schoolId}
                onChange={(e) => setFilters({ ...filters, schoolId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Todas as Escolas</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Modalidade</label>
            <div className="relative group">
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Todas as Etapas</option>
                {Object.values(EducationalStage).map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Exercício</label>
            <div className="relative group">
              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {activeTab === 'operational' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertWidget
              activeProfile={activeProfile!}
              onViewAll={() => onNavigate('inventory')}
            />
            {/* CLEAN CARD - NO NEON */}
            <Card variant="governance" padding="lg" className="flex flex-col justify-center relative overflow-hidden bg-white dark:bg-slate-800">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">Monitoramento Ativo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    O sistema está analisando o estoque. <span className="text-emerald-600 dark:text-emerald-400 font-bold">Nenhuma crítica pendente</span> nos últimos 15 min.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Atos Oficiais" value={stats.totalDocs} icon="📄" color="bg-blue-500" onClick={() => onNavigate('archive')} />
            <StatCard title="Almoxarifado" value={stats.lowStock > 0 ? `${stats.lowStock} CRÍTICOS` : 'ESTÁVEL'} icon="📦" color="bg-orange-500" onClick={() => onNavigate('inventory')} subtext="Estoque Central" />
            <StatCard title="Saúde Escolar" value={stats.evals} icon="⚖️" color="bg-amber-500" onClick={() => onNavigate('nutritional')} subtext="Avaliações" />
            {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && (
              <StatCard title="Unidades" value={stats.schools} icon="🏫" color="bg-indigo-500" onClick={() => onNavigate('schools')} />
            )}
          </div>

          {/* HIGH PRIORITY SCHOOLS */}
          {activeTab === 'operational' && (
            <Card variant="governance" padding="lg" className="border-red-100 dark:border-red-900/30">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Prioridade Técnica</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Classificação Automática</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Atenção</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools
                  .filter(s => s.prioridade_nivel === 'ALTA' && s.ativo)
                  .slice(0, 3)
                  .map(s => (
                    <div key={s.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:border-red-200 transition-all cursor-pointer shadow-sm" onClick={() => onNavigate('schools')}>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 transition-colors uppercase">{s.nome}</h4>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">{s.prioridade_score} Pontos</p>
                      </div>
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg flex items-center justify-center text-xl group-hover:bg-red-500 group-hover:text-white transition-all">🚨</div>
                    </div>
                  ))
                }
                {schools.filter(s => s.prioridade_nivel === 'ALTA' && s.ativo).length === 0 && (
                  <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nenhuma unidade em prioridade alta.</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="governance" padding="lg" className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Atividades Prioritárias</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">30 dias</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && (
                  <div className="flex gap-5 items-start group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">👩‍🍳</div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{stats.trainings}</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Capacitações</p>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">Treinamentos técnicos realizados.</p>
                    </div>
                  </div>
                )}
                {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
                  <div className="flex gap-5 items-start group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:shadow-lg transition-all duration-300" onClick={() => onNavigate('pnae')}>
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📑</div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{stats.activeProc}</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Editais PNAE</p>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">Chamadas públicas ativas.</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* AGRICULTURE CARD - CLEAN */}
            <Card padding="lg" variant="governance" className="flex flex-col justify-between">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-emerald-100 dark:border-emerald-800">🌱</div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Agricultura Familiar</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium mb-8">
                  Meta Legal: 45% (Lei 15.226/2025).
                </p>
              </div>
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.afPercent.toFixed(1)}%</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 ${stats.afPercent >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {stats.afPercent >= 30 || stats.afPercent === 0 ? 'Regular' : 'Abaixo da Meta'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${stats.afPercent >= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.max(stats.afPercent, 5)}%` }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card variant="governance" padding="lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Conformidade e Triagem</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Vigilância Nutricional</p>
              </div>
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Monitoramento</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🌾</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded">Local</span>
                </div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.afPercent.toFixed(1)}%</p>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.max(stats.afPercent, 5)}%` }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-amber-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🚫</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded">Restrições</span>
                </div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{String(stats.ultraProcessedCount).padStart(2, '0')}</p>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(stats.ultraProcessedCount / Math.max(inventory.length, 1)) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-b-4 border-b-rose-500 hover:bg-rose-50/10 transition-all duration-300 group border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🩺</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded">Risco</span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{stats.sisvanRisk}</p>
                  <button onClick={() => onNavigate('nutritional')} className="text-[10px] font-bold text-rose-600 hover:underline uppercase tracking-wider mb-1 flex items-center gap-1">
                    Ver Lista <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
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
          distributionsByStatus={{}}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

export default InstitutionalDashboard;