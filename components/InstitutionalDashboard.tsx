import React, { useMemo } from 'react';
import { useSchools } from '../contexts/SchoolContext';
import { useInventory } from '../contexts/InventoryContext';
import { useUsers } from '../contexts/UserContext';
import { 
  AlertTriangle, 
  Download, 
  Eye, 
  Check, 
  Flag, 
  ArrowUpRight,
  TrendingUp,
  Users,
  Package,
  ShieldCheck
} from 'lucide-react';
import { Button } from './UI/Button';
import { Card, CardHeader, CardTitle, CardContent } from './UI/Card';
import { Badge } from './UI/Badge';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const InstitutionalDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { schools } = useSchools();
  const { inventory, movements, occurrences } = useInventory();
  
  // ── CÁLCULO DE MÉTRICAS (KPIs) ──
  const stats = useMemo(() => {
    // 1. Governança PNAE: Escolas ativas/concluídas vs total
    const activeSchools = schools.filter(s => s.ativo).length;
    const governancaPercentage = schools.length > 0 ? Math.round((activeSchools / schools.length) * 100) : 100;

    // 2. Escolas em Alerta: Nível Crítico ou Alta Prioridade
    const alertSchoolsCount = schools.filter(s => s.prioridade_nivel === 'ALTA' || s.prioridade_nivel === 'CRITICA').length;
    
    // 3. Itens Críticos: Saldo abaixo do mínimo
    const criticalStockCount = inventory.filter(i => (i.saldoAtual || 0) <= (i.estoqueMinimo || 0)).length;
    
    // 4. Alunos Atendidos: Soma total
    const totalStudents = schools.reduce((acc, s) => acc + (s.numAlunos || 0), 0);
    
    return { 
      governancaPercentage, 
      alertSchoolsCount, 
      criticalStockCount, 
      totalStudents 
    };
  }, [schools, inventory]);

  // ── DADOS DO GRÁFICO (SIMULADO BASEADO EM MOVIMENTAÇÕES REAIS SE DISPONÍVEIS) ──
  const chartData = [
    { name: 'Jan', previsto: 260000, real: 230000 },
    { name: 'Fev', previsto: 310000, real: 250000 },
    { name: 'Mar', previsto: 380000, real: 320000 },
    { name: 'Abr', previsto: 420000, real: 360000 },
    { name: 'Mai', previsto: 500000, real: 450000 },
    { name: 'Jun', previsto: 550000, real: 480000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── KPI GRID: 4 COLUNAS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Governança PNAE */}
        <Card className="bg-white border-none shadow-[0px_4px_24px_rgba(0,0,0,0.04)] p-6 rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={48} className="text-slate-900" />
          </div>
          <div className="flex justify-between items-start mb-1 relative z-10">
            <h2 className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">
              {stats.governancaPercentage}%
            </h2>
            <Badge className="bg-[#e8f7f1] text-[#1D9E75] border-none font-black text-[10px] px-2 py-0.5 rounded-lg flex gap-1 items-center">
              <TrendingUp size={10} />
              +12%
            </Badge>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Governança PNAE
          </p>
        </Card>

        {/* KPI 2: Escolas em Alerta */}
        <Card className="bg-white border-none shadow-[0px_4px_24px_rgba(0,0,0,0.04)] p-6 rounded-2xl relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle size={48} className="text-slate-900" />
          </div>
          <div className="flex justify-between items-start mb-1 relative z-10">
            <h2 className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">
              {stats.alertSchoolsCount}
            </h2>
            <Badge className={`border-none font-black text-[10px] px-2 py-0.5 rounded-lg ${stats.alertSchoolsCount === 0 ? 'bg-[#e8f7f1] text-[#1D9E75]' : 'bg-rose-50 text-rose-500'}`}>
              {stats.alertSchoolsCount === 0 ? 'CONFORMIDADE TOTAL' : 'REQUER ATENÇÃO'}
            </Badge>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Escolas em Alerta
          </p>
        </Card>

        {/* KPI 3: Itens Críticos */}
        <Card className="bg-white border-none shadow-[0px_4px_24px_rgba(0,0,0,0.04)] p-6 rounded-2xl relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package size={48} className="text-slate-900" />
          </div>
          <div className="flex justify-between items-start mb-1 relative z-10">
            <h2 className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">
              {stats.criticalStockCount}
            </h2>
            {stats.criticalStockCount > 0 ? (
              <Badge className="bg-rose-50 text-rose-500 border-none font-black text-[10px] px-2 py-0.5 rounded-lg">
                RUPTURA
              </Badge>
            ) : (
              <Badge className="bg-[#e8f7f1] text-[#1D9E75] border-none font-black text-[10px] px-2 py-0.5 rounded-lg">
                ESTÁVEL
              </Badge>
            )}
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Itens Críticos (Estoque)
          </p>
        </Card>

        {/* KPI 4: Alunos Atendidos */}
        <Card className="bg-white border-none shadow-[0px_4px_24px_rgba(0,0,0,0.04)] p-6 rounded-2xl relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={48} className="text-slate-900" />
          </div>
          <div className="flex justify-between items-start mb-1 relative z-10">
            <h2 className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">
              {stats.totalStudents.toLocaleString()}
            </h2>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Alunos Atendidos
          </p>
        </Card>
      </div>

      {/* ── MAIN CONTENT GRID: 7 + 5 COLUNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LADO ESQUERDO: GRÁFICO (7 COLUNAS) */}
        <div className="lg:col-span-7">
          <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] h-full overflow-hidden flex flex-col">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">
                  EXECUÇÃO ORÇAMENTÁRIA - Consolidado
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Mensal: Previsto vs Realizado (R$)
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                <Download className="w-4 h-4 text-slate-400" />
              </Button>
            </div>

            <div className="flex-1 min-h-[340px] px-4 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(13,79,46,0.02)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '16px' }}
                  />
                  <Bar dataKey="previsto" fill="#0d4f2e" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="real" fill="#1D9E75" radius={[6, 6, 0, 0]} barSize={24} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="px-8 pb-8 flex items-center gap-6 border-t border-slate-50 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px] bg-[#0d4f2e]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previsto (SME)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px] bg-[#1D9E75]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realizado (PNAE)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* LADO DIREITO: FEED + CONFORMIDADE (5 COLUNAS) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* URGENT FEED */}
          <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-6 flex-shrink-0">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              URGENT FEED
            </h3>
            <div className="space-y-4">
              {occurrences.length > 0 ? (
                occurrences.slice(0, 2).map(occ => (
                  <div key={occ.id} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 transition-colors ${occ.type === 'RUPTURA' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{occ.title}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase">AGORA</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 leading-snug">
                        {occ.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                [
                  { id: 1, type: 'error', title: 'Vencimento Próximo:', desc: '3 itens no Almoxarifado Central vencem em 15 dias.' },
                  { id: 2, type: 'warning', title: 'Planejamento Pendente:', desc: 'Cardápio de Julho/2026 requer revisão técnica.' }
                ].map(alert => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 transition-colors ${alert.type === 'error' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100' : 'bg-amber-50 text-amber-500 group-hover:bg-amber-100'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{alert.title}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase">AGORA</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 leading-snug line-clamp-2">
                        {alert.desc}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* TABELA DE CONFORMIDADE */}
          <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-6 flex-1">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-5">
              TABELA DE CONFORMIDADE
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="pb-3 text-[9px] font-black text-slate-300 uppercase tracking-widest w-[45%]">UNIDADE ESCOLAR</th>
                    <th className="pb-3 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">ZONA</th>
                    <th className="pb-3 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">STATUS</th>
                    <th className="pb-3 text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schools.slice(0, 4).map((school, i) => (
                    <tr key={school.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${school.nome}&backgroundColor=0d4f2e&textColor=ffffff`} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 leading-tight uppercase tracking-tighter truncate max-w-[120px]">
                            {school.nome}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">{school.zona?.slice(0, 4)}</span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge 
                          className={`border-none font-black text-[8px] py-0.5 px-2 rounded-md ${
                            school.ativo ? 'bg-[#e8f7f1] text-[#1D9E75]' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {school.ativo ? 'OK' : 'PEND'}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                           <button className="w-7 h-7 flex items-center justify-center bg-white border border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-slate-400 transition-all shadow-sm">
                             <Eye size={12} />
                           </button>
                           <button className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all shadow-sm ${school.ativo ? 'bg-[#e8f7f1] text-[#1D9E75] border-[#d5f0e6]' : 'bg-white text-slate-200 border-slate-100'}`}>
                             <Check size={12} />
                           </button>
                           <button className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all shadow-sm ${!school.ativo ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-white text-slate-200 border-slate-100'}`}>
                             <Flag size={12} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* ── AÇÕES RÁPIDAS PREMIUM ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
        {[
          {
            label: 'Nova Redação IA',
            desc: 'Gerar documentos institucionais com inteligência artificial',
            icon: ArrowUpRight,
            accentColor: '#7c3aed',
            bgColor: '#f5f3ff',
            borderColor: '#ddd6fe',
            path: 'elaborar',
          },
          {
            label: 'Gestão de Estoque',
            desc: 'Controlar entrada, saída e alertas de insumos escolares',
            icon: Package,
            accentColor: '#0891b2',
            bgColor: '#ecfeff',
            borderColor: '#a5f3fc',
            path: 'estoque',
          },
          {
            label: 'Planejamento PNAE',
            desc: 'Cardápios escolares e conformidade com as normas FNDE',
            icon: ShieldCheck,
            accentColor: '#059669',
            bgColor: '#f0fdf4',
            borderColor: '#bbf7d0',
            path: 'cardapio',
          },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 18,
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.07)',
              transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'translateY(-4px) scale(1.01)';
              el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.11)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'translateY(0) scale(1)';
              el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.07)';
            }}
          >
            {/* Barra de cor no topo */}
            <div style={{ height: 4, background: item.accentColor, width: '100%' }} />
            <div style={{ padding: '16px 20px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: item.bgColor,
                  border: `1px solid ${item.borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                }}>
                  <item.icon style={{ width: 19, height: 19, color: item.accentColor }} />
                </div>
                <ArrowUpRight style={{ width: 16, height: 16, color: '#cbd5e1', marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 5, letterSpacing: '-0.01em' }}>
                {item.label}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};

export default InstitutionalDashboard;
