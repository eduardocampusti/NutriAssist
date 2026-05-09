import React, { useMemo } from 'react';
import { useUsers } from '../contexts/UserContext';
import { useSchools } from '../contexts/SchoolContext';
import { useInventory } from '../contexts/InventoryContext';
import { useDocuments } from '../contexts/DocumentContext';
import { useMenu } from '../contexts/MenuContext';
import { usePNAE } from '../contexts/PNAEContext';
import {
  AlertTriangle,
  Calendar,
  TrendingDown,
  Download,
  TrendingUp,
  Eye,
  Check,
  Flag,
} from 'lucide-react';
import { Button } from './UI/Button';
import { Progress } from './UI/Progress';
import { APP_VERSION } from '../constants';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CARD: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const urgentFeed = [
  {
    id: 1,
    icon: AlertTriangle,
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    title: 'Vencimento Próximo',
    desc: '3 itens no Almoxarifado Central vencem em 15 dias.',
    action: 'Verificar',
  },
  {
    id: 2,
    icon: Calendar,
    iconColor: '#f97316',
    iconBg: '#fff7ed',
    title: 'Cardápio Pendente',
    desc: 'Cardápio de Julho/2026 aguarda aprovação técnica.',
    action: 'Revisar',
  },
  {
    id: 3,
    icon: TrendingDown,
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    title: 'Meta AF em Risco',
    desc: 'Cota de Agricultura Familiar está abaixo dos 30%.',
    action: 'Detalhes',
  },
];

const InstitutionalDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { activeProfile } = useUsers();
  const { schools, studentsNE } = useSchools();
  const { inventory, movements } = useInventory();
  const { formalDocs: documents } = useDocuments();
  const { menuPlans } = useMenu();
  const { letterhead } = usePNAE();

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
    const criticalStockCount = inventory.filter(i => (i.saldoAtual || 0) <= (i.estoqueMinimo || 0)).length;
    const neCount = studentsNE.length;
    const complianceStatus = criticalStockCount > 5 ? 'PENDENCIAS' : 'TOTAL';

    return { afPercent, criticalStockCount, neCount, complianceStatus, totalSpent };
  }, [movements, inventory, studentsNE]);

  const chartData = [
    { name: 'Jan', previsto: 50000, real: 45000 },
    { name: 'Fev', previsto: 50000, real: 52000 },
    { name: 'Mar', previsto: 55000, real: 48000 },
    { name: 'Abr', previsto: 60000, real: 61000 },
    { name: 'Mai', previsto: 65000, real: stats.totalSpent > 0 ? stats.totalSpent / 5 : 58000 },
    { name: 'Jun', previsto: 70000, real: 0 },
  ];

  const fmtBRL = (v: number) =>
    v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v}`;

  return (
    <div className="space-y-5 animate-in fade-in duration-700">

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* KPI 1 */}
        <div className="p-5" style={CARD}>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Conformidade Legal
          </p>
          <p className="text-[36px] font-black text-slate-900 leading-none tracking-tighter">
            100%
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(29,158,117,0.1)', color: '#0d4f2e' }}
            >
              <TrendingUp size={10} /> +12%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">vs mês anterior</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5" style={CARD}>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Conformidade Total
          </p>
          <p className="text-[36px] font-black text-slate-900 leading-none tracking-tighter">
            0
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#1D9E75' }}>
            escolas em alerta
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-5" style={CARD}>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Itens Abaixo do Mínimo
          </p>
          <p className="text-[36px] font-black text-slate-900 leading-none tracking-tighter">
            {stats.criticalStockCount}
          </p>
          <p className="mt-3 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
            estoque crítico
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-5" style={CARD}>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Mínimo Exigido AF
          </p>
          <p className="text-[36px] font-black text-slate-900 leading-none tracking-tighter">
            {stats.afPercent.toFixed(1)}%
          </p>
          <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            meta: 30% obrigatório
          </p>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT — gráfico + ações */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Chart card */}
          <div style={CARD}>
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">
                  Execução Orçamentária — Consolidado
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Previsto vs Realizado por mês (R$)
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                style={{ border: '1px solid #eeecea' }}
                title="Exportar gráfico"
              >
                <Download size={13} />
              </button>
            </div>

            <div className="px-5 pb-1">
              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      tickFormatter={fmtBRL}
                      width={52}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(13,79,46,0.04)' }}
                      contentStyle={{
                        borderRadius: '10px',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                      formatter={(value: any, name: string) => [
                        `R$ ${Number(value).toLocaleString('pt-BR')}`,
                        name === 'previsto' ? 'Previsto' : 'Realizado',
                      ]}
                    />
                    <Bar
                      dataKey="previsto"
                      name="previsto"
                      fill="#0d4f2e"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                      fillOpacity={0.85}
                    />
                    <Line
                      type="monotone"
                      dataKey="real"
                      name="real"
                      stroke="#1D9E75"
                      strokeWidth={2.5}
                      dot={{ fill: '#1D9E75', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#1D9E75', strokeWidth: 0 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legenda */}
            <div
              className="mx-5 mb-5 mt-1 pt-3 flex items-center justify-center gap-8"
              style={{ borderTop: '1px solid #f1f5f4' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0d4f2e' }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previsto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-[2.5px] rounded-full" style={{ backgroundColor: '#1D9E75' }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Realizado</span>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onNavigate('elaborar')}
              className="font-black text-[10px] uppercase tracking-widest px-6 h-10 active:scale-95 transition-all"
              style={{ backgroundColor: '#0d4f2e', color: '#ffffff' }}
            >
              Nova Redação IA
            </Button>
            <Button
              onClick={() => onNavigate('estoque')}
              variant="outline"
              className="font-black text-[10px] uppercase tracking-widest px-6 h-10 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}
            >
              Gestão de Estoque
            </Button>
            <Button
              onClick={() => onNavigate('cardapio')}
              variant="outline"
              className="font-black text-[10px] uppercase tracking-widest px-6 h-10 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
              style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}
            >
              Planejamento PNAE
            </Button>
          </div>
        </div>

        {/* RIGHT — alertas + conformidade */}
        <div className="flex flex-col gap-4">

          {/* Urgent Feed */}
          <div style={CARD}>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f5f5f4' }}>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                Urgent Feed
              </h3>
              <span
                className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}
              >
                {urgentFeed.length} alertas
              </span>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
              {urgentFeed.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: item.iconBg }}
                    >
                      <Icon size={15} style={{ color: item.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                    <button
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded flex-shrink-0 transition-colors hover:opacity-80"
                      style={{ backgroundColor: '#f5f5f4', color: '#475569' }}
                    >
                      {item.action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabela de conformidade */}
          <div className="flex-1 overflow-hidden" style={CARD}>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f5f5f4' }}>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                Conformidade
              </h3>
              <button
                className="text-[9px] font-black uppercase tracking-wider transition-opacity hover:opacity-70"
                style={{ color: '#1D9E75' }}
              >
                Ver todas
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f5f5f4' }}>
                    <th className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Escola</th>
                    <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Zona</th>
                    <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta</th>
                    <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody>
                  {schools.slice(0, 5).map((school, i) => {
                    const abbr = school.nome.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
                    const isPending = i % 3 === 0;
                    const progress = Math.min(70 + i * 6, 100);
                    return (
                      <tr
                        key={school.id}
                        className="hover:bg-slate-50/60 transition-colors"
                        style={{ borderBottom: i < 4 ? '1px solid #f5f5f4' : undefined }}
                      >
                        {/* ESCOLA */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                              style={{ backgroundColor: '#0d4f2e' }}
                            >
                              {abbr}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[80px]">
                              {school.nome.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                        </td>
                        {/* ZONA */}
                        <td className="px-3 py-3">
                          <span className="text-[10px] font-medium text-slate-500">
                            {(school as any).zona_escolar || 'Urbana'}
                          </span>
                        </td>
                        {/* STATUS */}
                        <td className="px-3 py-3">
                          <span
                            className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={
                              isPending
                                ? { backgroundColor: 'rgba(245,158,11,0.12)', color: '#d97706' }
                                : { backgroundColor: 'rgba(29,158,117,0.1)', color: '#0d4f2e' }
                            }
                          >
                            {isPending ? 'Pendente' : 'Conforme'}
                          </span>
                        </td>
                        {/* META */}
                        <td className="px-3 py-3" style={{ minWidth: 72 }}>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold" style={{ color: '#1D9E75' }}>
                              {progress}%
                            </span>
                            <Progress value={progress} className="h-1" />
                          </div>
                        </td>
                        {/* AÇÕES */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                              <Eye size={12} />
                            </button>
                            <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <Check size={12} />
                            </button>
                            <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                              <Flag size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default InstitutionalDashboard;
