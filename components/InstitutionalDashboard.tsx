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
  TrendingUp,
  Download,
  Eye,
  Check,
  Flag,
  ShieldCheck,
  Package,
  Leaf,
  Users,
} from 'lucide-react';
import { Button } from './UI/Button';
import { Progress } from './UI/Progress';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CARD: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  border: '0.5px solid #e8e8e6',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const DIVIDER: React.CSSProperties = { borderBottom: '0.5px solid #f0f0ee' };

const urgentFeed = [
  {
    id: 1,
    icon: AlertTriangle,
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    title: 'Vencimento Próximo',
    desc: '3 itens no Almoxarifado Central vencem em 15 dias.',
    action: 'VERIFICAR',
  },
  {
    id: 2,
    icon: Calendar,
    iconColor: '#f97316',
    iconBg: '#fff7ed',
    title: 'Cardápio Pendente',
    desc: 'Cardápio de Julho/2026 aguarda aprovação técnica.',
    action: 'REVISAR',
  },
  {
    id: 3,
    icon: TrendingDown,
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    title: 'Meta AF em Risco',
    desc: 'Cota de Agricultura Familiar está abaixo dos 30%.',
    action: 'DETALHES',
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

    return { afPercent, criticalStockCount, totalSpent };
  }, [movements, inventory]);

  const chartData = [
    { name: 'Jan', previsto: 50000, real: 45000 },
    { name: 'Fev', previsto: 50000, real: 52000 },
    { name: 'Mar', previsto: 55000, real: 48000 },
    { name: 'Abr', previsto: 60000, real: 61000 },
    { name: 'Mai', previsto: 65000, real: stats.totalSpent > 0 ? stats.totalSpent / 5 : 58000 },
    { name: 'Jun', previsto: 70000, real: 0 },
  ];

  const fmtBRL = (v: number) =>
    v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`;

  return (
    <div style={{ backgroundColor: '#f5f6f4', margin: '-24px', padding: 24, minHeight: 'calc(100% + 48px)' }}>
      <div className="space-y-5 animate-in fade-in duration-700">

        {/* ── BANNER ── */}
        <div style={{ background: 'linear-gradient(135deg, #0a3d22 0%, #1D9E75 100%)', padding: '16px 20px', borderRadius: 12 }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, letterSpacing: '0.03em' }}>
                {letterhead?.nomeMunicipio || 'Secretaria Municipal de Educação'} — Exercício 2026
              </p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Painel de Gestão Nutricional
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Escolas Ativas
              </p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1, marginTop: 2 }}>
                {schools.length}
              </p>
            </div>
          </div>
        </div>

        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* KPI 1 — Conformidade */}
          <div style={{ ...CARD, borderTop: '2.5px solid #1D9E75', position: 'relative', padding: '16px 20px' }}>
            <div style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={14} style={{ color: '#1D9E75' }} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#111111', lineHeight: 1, display: 'block' }}>100%</span>
            <p style={{ fontSize: 10, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 4 }}>
              Conformidade Legal
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: 'rgba(22,101,52,0.1)', color: '#166534', marginTop: 6 }}>
              <TrendingUp size={8} /> +12%
            </span>
          </div>

          {/* KPI 2 — Escolas */}
          <div style={{ ...CARD, borderTop: '2.5px solid #6366f1', position: 'relative', padding: '16px 20px' }}>
            <div style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={14} style={{ color: '#6366f1' }} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#111111', lineHeight: 1, display: 'block' }}>{schools.length}</span>
            <p style={{ fontSize: 10, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 4 }}>
              Escolas Ativas
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', marginTop: 6 }}>
              Rede Municipal
            </span>
          </div>

          {/* KPI 3 — Estoque Crítico */}
          <div style={{ ...CARD, borderTop: '2.5px solid #f59e0b', position: 'relative', padding: '16px 20px' }}>
            <div style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={14} style={{ color: '#f59e0b' }} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#111111', lineHeight: 1, display: 'block' }}>{stats.criticalStockCount}</span>
            <p style={{ fontSize: 10, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 4 }}>
              Itens Críticos
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', marginTop: 6 }}>
              <TrendingDown size={8} /> Abaixo do mín.
            </span>
          </div>

          {/* KPI 4 — AF% */}
          <div style={{ ...CARD, borderTop: '2.5px solid #0d9488', position: 'relative', padding: '16px 20px' }}>
            <div style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={14} style={{ color: '#0d9488' }} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#111111', lineHeight: 1, display: 'block' }}>{stats.afPercent.toFixed(1)}%</span>
            <p style={{ fontSize: 10, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 4 }}>
              Agricultura Familiar
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: stats.afPercent >= 30 ? 'rgba(22,101,52,0.1)' : 'rgba(239,68,68,0.1)', color: stats.afPercent >= 30 ? '#166534' : '#dc2626', marginTop: 6 }}>
              {stats.afPercent >= 30 ? 'Meta atingida' : 'Abaixo de 30%'}
            </span>
          </div>

        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT — chart + actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Chart card */}
            <div style={{ ...CARD, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', ...DIVIDER, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 800, color: '#333333', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Execução Orçamentária — Consolidado
                  </h3>
                  <p style={{ fontSize: 10, color: '#aaaaaa', fontWeight: 500, marginTop: 2 }}>
                    Previsto vs Realizado por mês (R$)
                  </p>
                </div>
                <button
                  style={{ width: 32, height: 32, borderRadius: 8, border: '0.5px solid #e8e8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaaaaa', backgroundColor: 'transparent', cursor: 'pointer', flexShrink: 0 }}
                  title="Exportar gráfico"
                >
                  <Download size={13} />
                </button>
              </div>

              <div style={{ padding: '16px 20px 8px' }}>
                <div style={{ height: 210 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      barGap={3}
                      barCategoryGap="25%"
                    >
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
                        width={50}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(13,79,46,0.04)' }}
                        contentStyle={{
                          borderRadius: 10,
                          border: 'none',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                          fontSize: 11,
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
                        fillOpacity={0.3}
                        radius={[4, 4, 0, 0]}
                        barSize={22}
                      />
                      <Bar
                        dataKey="real"
                        name="real"
                        fill="#1D9E75"
                        radius={[4, 4, 0, 0]}
                        barSize={22}
                        animationDuration={1000}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend */}
              <div style={{ padding: '8px 20px 12px', borderTop: '0.5px solid #f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#0d4f2e', opacity: 0.35 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Previsto</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#1D9E75' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Realizado</span>
                </div>
              </div>

              {/* Dark block */}
              <div style={{ backgroundColor: '#0a3d22', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                      Volume Total
                    </p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', lineHeight: 1, marginTop: 4 }}>
                      {stats.totalSpent > 0
                        ? `R$ ${(stats.totalSpent / 1000).toFixed(0)}k`
                        : 'R$ —'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 110 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 6 }}>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                        AF%
                      </p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#1D9E75', lineHeight: 1 }}>
                        {stats.afPercent.toFixed(1)}%
                      </p>
                    </div>
                    <Progress value={stats.afPercent} max={100} className="h-1" indicatorClassName="bg-emerald-400" />
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                      Mínimo exigido: 30%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
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

          {/* RIGHT — alerts + compliance */}
          <div className="flex flex-col gap-4">

            {/* Urgent Feed */}
            <div style={CARD}>
              <div style={{ padding: '16px 20px 12px', ...DIVIDER, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: '#333333', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Urgent Feed
                </h3>
                <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 8px', borderRadius: 99, backgroundColor: '#fef2f2', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {urgentFeed.length} alertas
                </span>
              </div>
              <div>
                {urgentFeed.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, ...(idx < urgentFeed.length - 1 ? DIVIDER : {}) }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} style={{ color: item.iconColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#333333' }}>{item.title}</p>
                        <p style={{ fontSize: 10, color: '#aaaaaa', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{item.desc}</p>
                      </div>
                      <button
                        style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#475569', flexShrink: 0, cursor: 'pointer' }}
                      >
                        {item.action}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conformidade table */}
            <div style={{ ...CARD, flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', ...DIVIDER, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: '#333333', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Conformidade
                </h3>
                <button style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#166534', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Ver Todas
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={DIVIDER}>
                      <th style={{ padding: '8px 16px', fontSize: 9, fontWeight: 800, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Escola</th>
                      <th style={{ padding: '8px 8px', fontSize: 9, fontWeight: 800, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Zona</th>
                      <th style={{ padding: '8px 8px', fontSize: 9, fontWeight: 800, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '8px 8px', fontSize: 9, fontWeight: 800, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Meta</th>
                      <th style={{ padding: '8px 8px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.slice(0, 5).map((school, i) => {
                      const s = school as any;
                      const abbr = school.nome
                        .split(' ')
                        .filter((w: string) => w.length > 2)
                        .slice(0, 2)
                        .map((w: string) => w[0])
                        .join('')
                        .toUpperCase() || school.nome.slice(0, 2).toUpperCase();
                      const schoolLogo: string | null = s.logoUrl || s.logo || s.foto || null;
                      const isPending = i % 3 === 0;
                      const progress = Math.min(70 + i * 6, 100);

                      return (
                        <tr key={school.id} style={i < 4 ? DIVIDER : {}}>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {schoolLogo ? (
                                <img
                                  src={schoolLogo}
                                  alt=""
                                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                />
                              ) : (
                                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                                  {abbr}
                                </div>
                              )}
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#444444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 72 }}>
                                {school.nome.split(' ').slice(0, 2).join(' ')}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span style={{ fontSize: 10, color: '#888888', fontWeight: 500 }}>
                              {s.zona_escolar || 'Urbana'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 99, ...(isPending ? { backgroundColor: 'rgba(245,158,11,0.12)', color: '#b45309' } : { backgroundColor: 'rgba(22,101,52,0.08)', color: '#166534' }) }}>
                              {isPending ? 'Pendente' : 'Conforme'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', minWidth: 68 }}>
                            <div>
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#1D9E75' }}>{progress}%</span>
                              <div style={{ marginTop: 3 }}>
                                <Progress value={progress} className="h-1" />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <button title="Visualizar" style={{ width: 24, height: 24, borderRadius: 4, border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaaaaa', cursor: 'pointer' }}>
                                <Eye size={12} />
                              </button>
                              <button title="Aprovar" style={{ width: 24, height: 24, borderRadius: 4, border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaaaaa', cursor: 'pointer' }}>
                                <Check size={12} />
                              </button>
                              <button title="Sinalizar" style={{ width: 24, height: 24, borderRadius: 4, border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaaaaa', cursor: 'pointer' }}>
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
    </div>
  );
};

export default InstitutionalDashboard;
