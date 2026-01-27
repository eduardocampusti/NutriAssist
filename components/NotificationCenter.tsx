
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, AlertTriangle, Scale, FileText, ChevronRight, X, UtensilsCrossed, Clock } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useNutrition } from '../contexts/NutritionContext';
import { useDocuments } from '../contexts/DocumentContext';
import { useMenu } from '../contexts/MenuContext';
import { useUsers } from '../contexts/UserContext';
import { DocStatus, UserRole, DistributionStatus, OccurrenceStatus } from '../types';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { inventory, batches, distributions, occurrences } = useInventory();
  const { evaluations } = useNutrition();
  const { formalDocs } = useDocuments();
  const { menuPlans } = useMenu();
  const { activeProfile } = useUsers();

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alerts = useMemo(() => {
    const list: any[] = [];

    // 1. Low Stock
    const lowStock = inventory.filter(i => (i.saldoAtual || 0) <= (i.estoqueMinimo || 0));
    if (lowStock.length > 0) {
      list.push({
        id: 'low-stock',
        type: 'inventory',
        title: 'Estoque Crítico',
        description: `${lowStock.length} itens com saldo abaixo do mínimo.`,
        icon: Package,
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        path: '/estoque/catalogo'
      });
    }

    // 2. Expiring Batches (30 days)
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
    const now = Date.now();
    const expiring = batches.filter(b => Number(b.saldoAtual) > 0 && Number(b.validade) > 0 && (Number(b.validade) - now) < thirtyDays);
    if (expiring.length > 0) {
      list.push({
        id: 'expiring-batches',
        type: 'inventory',
        title: 'Produtos a Vencer',
        description: `${expiring.length} lotes com validade próxima (30 dias).`,
        icon: AlertTriangle,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        path: '/estoque/catalogo'
      });
    }

    // 3. Nutritional Risk
    const risks = evaluations.filter(e => e.riscoIdentificado);
    if (risks.length > 0) {
      list.push({
        id: 'nutritional-risks',
        type: 'nutrition',
        title: 'Risco Nutricional',
        description: `${risks.length} alunos identificados com risco no SISVAN.`,
        icon: Scale,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        path: '/avaliacao-nutricional'
      });
    }

    // 4. Pending Documents
    const pending = formalDocs.filter(d => d.status === DocStatus.ELABORACAO);
    if (pending.length > 0) {
      list.push({
        id: 'pending-docs',
        type: 'docs',
        title: 'Documentos Pendentes',
        description: `${pending.length} minutas aguardando revisão ou finalização.`,
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        path: '/arquivo'
      });
    }

    // 5. Pending Menus (Approvers Only)
    const isApprover = activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.SECRETARIO || activeProfile?.role === UserRole.SECRETARIA;
    const pendingMenus = menuPlans.filter(p => p.status === DocStatus.ENVIADO);

    if (isApprover && pendingMenus.length > 0) {
      list.push({
        id: 'pending-menus',
        type: 'menu',
        title: 'Homologação de Cardápio',
        description: `${pendingMenus.length} cardápios aguardando sua aprovação final.`,
        icon: UtensilsCrossed,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        path: '/cardapio'
      });
    }

    // 6. Distribution Issues (SME/Nutricionista)
    const isSME = activeProfile?.role === UserRole.ADMIN || activeProfile?.role === UserRole.NUTRICIONISTA;
    if (isSME) {
      // 6.1 Delayed Confirmations (> 48h)
      const nowTs = Date.now();
      const fortyEightHours = 1000 * 60 * 60 * 48;
      const delayed = distributions.filter(d =>
        d.status === DistributionStatus.AGUARDANDO_CONFIRMACAO &&
        d.created_at && (nowTs - new Date(d.created_at).getTime()) > (fortyEightHours as number)
      );

      if (delayed.length > 0) {
        list.push({
          id: 'delayed-distributions',
          type: 'inventory',
          title: 'ODs sem Confirmação',
          description: `${delayed.length} distribuições enviadas há mais de 48h sem retorno das escolas.`,
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          path: '/estoque/distribuicao'
        });
      }

      // 6.2 New Divergences
      const divergences = distributions.filter(d => d.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA);
      if (divergences.length > 0) {
        list.push({
          id: 'divergent-distributions',
          type: 'inventory',
          title: 'Divergências na Entrega',
          description: `Existem ${divergences.length} recebimentos com divergência quantitativa registrada.`,
          icon: AlertTriangle,
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          path: '/estoque/distribuicao'
        });
      }

      // 6.3 Recurrence Alert (per school)
      const schoolDivergences: Record<string, number> = {};
      const thirtyDaysAgo = nowTs - (1000 * 60 * 60 * 24 * 30);
      distributions.forEach(d => {
        if (d.status === DistributionStatus.ENTREGUE_COM_DIVERGENCIA && d.created_at && new Date(d.created_at).getTime() > thirtyDaysAgo) {
          schoolDivergences[d.escola_id] = (schoolDivergences[d.escola_id] || 0) + 1;
        }
      });

      const recurringSchools = Object.values(schoolDivergences).filter(count => count >= 3).length;
      if (recurringSchools > 0) {
        list.push({
          id: 'recurring-divergences',
          type: 'inventory',
          title: 'Recorrência de Erros',
          description: `${recurringSchools} unidades com 3+ divergências nos últimos 30 dias. Recomendada auditoria local.`,
          icon: Package,
          color: 'text-rose-700',
          bg: 'bg-rose-100',
          path: '/estoque/distribuicao'
        });
      }

      // 6.4 New Operational Occurrences
      const pendingOccurrences = occurrences.filter(o => o.status === OccurrenceStatus.PENDENTE);
      if (pendingOccurrences.length > 0) {
        list.push({
          id: 'pending-occurrences',
          type: 'inventory',
          title: 'Intercorrências Pendentes',
          description: `Existem ${pendingOccurrences.length} intercorrências operacionais aguardando seu parecer técnico.`,
          icon: AlertTriangle,
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          path: '/estoque/contingencia'
        });
      }
    }

    return list;
  }, [inventory, batches, evaluations, formalDocs, menuPlans, activeProfile]);

  return (
    <div className="fixed top-6 right-8 z-[100] print:hidden" ref={dropdownRef}>
      {/* Target Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-slate-900 text-white shadow-2xl scale-110' : 'bg-white text-slate-400 shadow-xl hover:text-slate-900 hover:scale-110 border border-slate-100'
          }`}
      >
        <Bell className={`w-6 h-6 ${alerts.length > 0 && !isOpen ? 'animate-bounce' : ''}`} />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in duration-300">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-[400px] bg-white rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Alertas do Sistema</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Notificações prioritárias</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {alerts.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => {
                      navigate(alert.path);
                      setIsOpen(false);
                    }}
                    className="w-full p-6 text-left hover:bg-slate-50 transition-all flex items-start gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${alert.bg} ${alert.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <alert.icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{alert.title}</h4>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{alert.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={40} />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tudo em conformidade</h4>
                <p className="text-xs text-slate-400 font-medium mt-2">Nenhum alerta crítico pendente no momento.</p>
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-4 bg-slate-50 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
              >
                Ver Dashboard Executivo completo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
