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
  Download,
  Eye,
  Check,
  Flag,
  MoreVertical,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';

const InstitutionalDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { schools } = useSchools();
  const { inventory, movements } = useInventory();
  const { activeProfile } = useUsers();

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
    { name: 'Jan', previsto: 260000, real: 230000 },
    { name: 'Fev', previsto: 310000, real: 250000 },
    { name: 'Mar', previsto: 380000, real: 320000 },
    { name: 'Abr', previsto: 420000, real: 360000 },
    { name: 'Mai', previsto: 500000, real: 450000 },
    { name: 'Jun', previsto: 550000, real: 480000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* ── KPI GRID (4 COLUNAS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Conformidade Legal */}
        <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-[32px] font-black text-slate-900 leading-none">100%</h2>
            <Badge variant="success" className="bg-[#e8f7f1] text-[#1D9E75] border-none font-black text-[10px]">
              +12%
            </Badge>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            CONFORMIDADE LEGAL
          </p>
        </Card>

        {/* KPI 2: Conformidade Total */}
        <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-[32px] font-black text-slate-900 leading-none">0</h2>
            <Badge variant="success" className="bg-[#e8f7f1] text-[#1D9E75] border-none font-black text-[10px]">
              TOTAL
            </Badge>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            CONFORMIDADE TOTAL
          </p>
        </Card>

        {/* KPI 3: Itens Abaixo do Mínimo */}
        <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-6">
          <h2 className="text-[32px] font-black text-slate-900 leading-none mb-2">
            {stats.criticalStockCount}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            ITENS ABAIXO DO MÍNIMO
          </p>
        </Card>

        {/* KPI 4: Mínimo Exigido */}
        <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-6">
          <h2 className="text-[32px] font-black text-slate-900 leading-none mb-2">
            {stats.afPercent.toFixed(1)}%
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            MÍNIMO EXIGIDO
          </p>
        </Card>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico (8 colunas) */}
        <div className="lg:col-span-7">
          <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] h-full">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">
                  EXECUÇÃO ORÇAMENTÁRIA - Consolidado
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">
                  Mensal: Previsto vs Realizado (R$)
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl">
                <Download className="w-4 h-4 text-slate-400" />
              </Button>
            </div>

            <div className="h-[320px] px-4 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(13,79,46,0.04)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="previsto" fill="#0d4f2e" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="real" fill="#1D9E75" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line 
                    type="monotone" 
                    dataKey="real" 
                    stroke="#0d4f2e" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#0d4f2e' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend exata da imagem */}
            <div className="px-8 pb-8 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-[4px] bg-[#0d4f2e]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PREVISTO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-[4px] bg-[#1D9E75]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REAL</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Urgent Feed */}
          <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[12px] font-black text-slate-900 uppercase tracking-widest">
                URGENT FEED
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-3">
              {[
                { id: 1, type: 'error', title: 'Vencimento Próximo:', desc: '3 itens no Almoxarifado Central vencem em 15 dias.' },
                { id: 2, type: 'warning', title: 'Planejamento Pendente:', desc: 'Cardápio de Julho/2026 requer revisão técnica.' }
              ].map(alert => (
                <div key={alert.id} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className={`mt-1 p-2 rounded-xl ${alert.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[12px] font-black text-slate-900">{alert.title}</span>
                      <span className="text-[10px] font-bold text-slate-300">toast</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 leading-tight">
                      {alert.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tabela de Conformidade */}
          <Card className="bg-white border-none shadow-[0px_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[12px] font-black text-slate-900 uppercase tracking-widest">
                TABELA DE CONFORMIDADE
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">ESCOLA</th>
                    <th className="py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">ZONA</th>
                    <th className="py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">STATUS AUDITORIA</th>
                    <th className="py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">META EXECUÇÃO</th>
                    <th className="py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schools.slice(0, 2).map((school, i) => {
                    const isPending = i === 0;
                    return (
                      <tr key={school.id} className="group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                              <img src={school.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${school.nome}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 leading-tight max-w-[120px]">
                              {school.nome.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-[11px] font-bold text-slate-500">1</span>
                        </td>
                        <td className="py-4 px-2">
                          <Badge 
                            className={`border-none font-black text-[9px] py-1 px-3 ${
                              isPending ? 'bg-[#e8f7f1] text-[#1D9E75]' : 'bg-[#0d4f2e] text-white'
                            }`}
                          >
                            {isPending ? 'PENDENTE' : 'CONCLUÍDO'}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={isPending ? 45 : 85} 
                              className="h-1.5 w-16 bg-slate-100" 
                              indicatorClassName="bg-[#1D9E75]" 
                            />
                            <button className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                             <button className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                               <Eye className="w-4 h-4" />
                             </button>
                             <button className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${!isPending ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                               <Check className="w-4 h-4" />
                             </button>
                             <button className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isPending ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-300'}`}>
                               <Flag className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* ── BOTTOM ACTIONS ── */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Button 
          onClick={() => onNavigate('elaborar')}
          className="bg-[#e8f7f1] text-[#1D9E75] hover:bg-[#d5f0e6] border-none font-black text-[11px] px-8 h-12 uppercase tracking-widest rounded-xl transition-all"
        >
          NOVA REDAÇÃO IA
        </Button>
        <Button 
          onClick={() => onNavigate('estoque')}
          className="bg-[#e8f7f1] text-[#1D9E75] hover:bg-[#d5f0e6] border-none font-black text-[11px] px-8 h-12 uppercase tracking-widest rounded-xl transition-all"
        >
          GESTÃO DE ESTOQUE
        </Button>
        <Button 
          onClick={() => onNavigate('cardapio')}
          className="bg-[#e8f7f1] text-[#1D9E75] hover:bg-[#d5f0e6] border-none font-black text-[11px] px-8 h-12 uppercase tracking-widest rounded-xl transition-all"
        >
          PLANEJAMENTO PNAE
        </Button>
      </div>

    </div>
  );
};

export default InstitutionalDashboard;
