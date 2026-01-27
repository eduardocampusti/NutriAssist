import React, { useState, useMemo, useEffect } from 'react';
import {
  Cook,
  School,
  InventoryItem,
  InventoryMovement,
  MovementType,
  MovementPurpose,
  UserProfile,
  UserRole
} from '../types';
import { stockService } from '../services/stockService';
import { PageHeader } from './UI/PageHeader';
import { Card } from './UI/Card';
import { Utensils, ClipboardPaste, PackageSearch } from 'lucide-react';

interface MerendeiraTerminalProps {
  activeProfile: UserProfile;
  school?: School;
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  onRegisterConsumption: (mov: Omit<InventoryMovement, 'id' | 'authorId' | 'data'>) => Promise<void>;
  onClose: () => void;
}

const MerendeiraTerminal: React.FC<MerendeiraTerminalProps> = ({
  activeProfile,
  school,
  inventory,
  movements,
  onRegisterConsumption,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'MENU' | 'MANUAL' | 'ESTOQUE'>('MENU');

  // STATE: MENU EXECUTION
  const [dailyMenu, setDailyMenu] = useState<any>(null);
  const [studentsServed, setStudentsServed] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);

  // STATE: MANUAL
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Daily Menu
  useEffect(() => {
    if (activeProfile.school_id) {
      stockService.getDailyMenu(activeProfile.school_id).then(setDailyMenu);
    }
  }, [activeProfile.school_id]);

  const schoolHistory = useMemo(() =>
    movements.filter(m => m.schoolId === activeProfile.school_id)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10),
    [movements, activeProfile.school_id]);

  const schoolInventory = useMemo(() => {
    if (!activeProfile.school_id) return [];

    return inventory.map(item => {
      const itemMovs = movements.filter(m => m.itemId === item.id && m.schoolId === activeProfile.school_id);

      const entradas = itemMovs
        .filter(m => m.type === MovementType.ENTRADA || (m.type === MovementType.AJUSTE && m.quantity > 0))
        .reduce((acc, m) => acc + m.quantity, 0);

      const saidas = itemMovs
        .filter(m => m.type === MovementType.SAIDA || (m.type === MovementType.AJUSTE && m.quantity < 0))
        .reduce((acc, m) => acc + Math.abs(m.quantity), 0);

      return {
        ...item,
        saldoEscola: (entradas - saidas)
      };
    }).filter(i => i.saldoEscola > 0 || i.estoque_minimo! > 0);
  }, [inventory, movements, activeProfile.school_id]);

  const handleExecuteMenu = async () => {
    if (!dailyMenu || studentsServed <= 0) return;
    setIsExecuting(true);

    try {
      // Auto-Match Items: In real app, IDs match. Here we try to find by Name similarity or Mock ID
      // Mock: We use the first 3 items of inventory for demo if not found
      const itemIds: string[] = [];
      const quantities: number[] = [];

      dailyMenu.items.forEach((menuItem: any, idx: number) => {
        // Find inventory item
        // Find inventory item: Try exact ID match first, then Normative ID match
        const invItem = inventory.find(i => i.id === menuItem.id) ||
          inventory.find(i => i.alimento_normativo_id === menuItem.id) ||
          inventory[idx]; // Fallback to index for demo
        if (invItem) {
          itemIds.push(invItem.id);
          quantities.push(menuItem.perCapita * studentsServed);
        }
      });

      await stockService.executeMenu(
        activeProfile.school_id!,
        itemIds,
        quantities,
        activeProfile.id,
        studentsServed,
        dailyMenu.menuId
      );

      alert("Execução Registrada e Estoque Baixado!");
      setStudentsServed(0);
    } catch (err) {
      console.error(err);
      alert("Erro ao executar cardápio.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleConfirmManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await onRegisterConsumption({
        itemId: selectedItemId,
        type: MovementType.SAIDA,
        quantity: quantity,
        date: Date.now(),
        schoolId: activeProfile.school_id,
        finalidade: MovementPurpose.REGULAR,
        observacao: observation || `Consumo Manual por ${activeProfile.nome}`
      });

      setSelectedItemId('');
      setQuantity(0);
      setObservation('');
      alert("Consumo manual registrado!");
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <PageHeader
        title={school?.nome || 'Minha Unidade'}
        subtitle={`Terminal de Cozinha • ${new Date().toLocaleDateString()}`}
        icon={<Utensils className="w-8 h-8 text-emerald-500" />}
        actions={
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => setViewMode('MENU')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MENU' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              Cardápio
            </button>
            <button
              onClick={() => setViewMode('MANUAL')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MANUAL' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              Manual
            </button>
            <button
              onClick={() => setViewMode('ESTOQUE')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ESTOQUE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              Estoque
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT PANEL */}
        <div className="lg:col-span-7 space-y-6">

          {viewMode === 'MENU' && dailyMenu && (
            <Card variant="elevated" padding="lg" className="space-y-8 animate-in slide-in-from-left-4 duration-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase leading-tight">
                    {dailyMenu.title}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refeição Planejada</p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100">PNAE</span>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Itens do Cardápio</p>
                <div className="space-y-3">
                  {dailyMenu.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-white pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase">{item.name}</span>
                      <span className="text-xs font-black text-emerald-600">{item.perCapita} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase block px-1 tracking-widest">Alunos Servidos</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="number"
                    value={studentsServed || ''}
                    onChange={e => setStudentsServed(parseInt(e.target.value))}
                    className="flex-1 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl px-6 py-4 text-3xl font-black text-emerald-600 outline-none text-center shadow-inner transition-all"
                    placeholder="000"
                  />
                  <button
                    onClick={handleExecuteMenu}
                    disabled={isExecuting || studentsServed <= 0}
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50 disabled:grayscale"
                  >
                    {isExecuting ? 'Processando...' : 'Baixar Estoque'}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Baixa automática proporcional aos per-capitas</p>
              </div>
            </Card>
          )}

          {viewMode === 'MANUAL' && (
            <Card variant="elevated" padding="lg" className="space-y-8 animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3">
                <ClipboardPaste className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Baixa Avulsa</h3>
              </div>
              <form onSubmit={handleConfirmManual} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Produto</label>
                  <select
                    value={selectedItemId}
                    onChange={e => setSelectedItemId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none transition-all appearance-none shadow-sm"
                  >
                    <option value="">Selecione o Item...</option>
                    {schoolInventory.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quantidade</label>
                    <input
                      type="number"
                      value={quantity || ''}
                      onChange={e => setQuantity(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none shadow-sm transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 active:scale-95 text-white px-8 py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-900/10">
                      Registrar
                    </button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {viewMode === 'ESTOQUE' && (
            <Card variant="elevated" padding="lg" className="space-y-8 animate-in slide-in-from-left-4 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <PackageSearch className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Inventário Atual</h3>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo Real-time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schoolInventory.map(item => (
                  <Card key={item.id} variant="flat" padding="md" className="bg-slate-50/50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-emerald-200 transition-all cursor-default">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.unidade_medida || item.unidadeMedida || 'UN'}</p>
                      <h4 className="font-bold text-slate-800 uppercase text-xs truncate max-w-[120px]">{item.nome}</h4>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item.saldoEscola < (item.estoque_minimo || 5) ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {item.saldoEscola.toFixed(1)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card variant="flat" padding="lg" className="border border-slate-100 space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Histórico de Movimentação</h4>
            <div className="space-y-3">
              {schoolHistory.length > 0 ? schoolHistory.map(mov => (
                <div key={mov.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-800 uppercase">
                      {inventory.find(i => i.id === mov.itemId)?.nome || 'Item Desconhecido'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(mov.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${mov.type === 'SAIDA' ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {mov.type === 'SAIDA' ? '-' : '+'}{mov.quantity}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-400 uppercase font-black text-center py-10 tracking-widest">Nenhuma movimentação</p>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default MerendeiraTerminal;
