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
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center text-4xl shadow-inner border border-white/30 font-black">👩‍🍳</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">{school?.nome || 'Minha Unidade'}</h2>
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest opacity-80">Terminal de Cozinha • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => setViewMode('MENU')}
            className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${viewMode === 'MENU' ? 'bg-white text-emerald-900 shadow-lg' : 'bg-emerald-700 text-emerald-100'}`}
          >
            Cardápio do Dia
          </button>
          <button
            onClick={() => setViewMode('MANUAL')}
            className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${viewMode === 'MANUAL' ? 'bg-white text-emerald-900 shadow-lg' : 'bg-emerald-700 text-emerald-100'}`}
          >
            Baixa Manual
          </button>
          <button
            onClick={() => setViewMode('ESTOQUE')}
            className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${viewMode === 'ESTOQUE' ? 'bg-white text-emerald-900 shadow-lg' : 'bg-emerald-700 text-emerald-100'}`}
          >
            Estoque / Entradas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT PANEL */}
        <div className="lg:col-span-7 space-y-6">

          {viewMode === 'MENU' && dailyMenu && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-slate-800 uppercase leading-none">
                  {dailyMenu.title}
                </h3>
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">FNDE/PNAE</span>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Ingredientes Previstos (Per Capita)</p>
                <div className="space-y-3">
                  {dailyMenu.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2">
                      <span className="text-sm font-bold text-slate-700 uppercase">{item.name}</span>
                      <span className="text-xs font-black text-emerald-600">{item.perCapita} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase block ml-1">Quantos alunos foram servidos?</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={studentsServed || ''}
                    onChange={e => setStudentsServed(parseInt(e.target.value))}
                    className="flex-1 bg-slate-50 border-none rounded-[24px] px-6 py-5 text-3xl font-black text-emerald-600 outline-none text-center"
                    placeholder="0"
                  />
                  <button
                    onClick={handleExecuteMenu}
                    disabled={isExecuting || studentsServed <= 0}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50 disabled:grayscale"
                  >
                    {isExecuting ? '...' : 'Confirmar Execução'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 italic text-center">Isso dará baixa automática proporcional em todos os ingredientes.</p>
              </div>
            </div>
          )}

          {viewMode === 'MANUAL' && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Baixa Avulsa / Ajuste</h3>
              <form onSubmit={handleConfirmManual} className="space-y-6">
                {/* ... Existing Manual Form Logic ... */}
                <div className="space-y-2">
                  <select
                    value={selectedItemId}
                    onChange={e => setSelectedItemId(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-4 text-sm font-bold text-slate-800 outline-none"
                  >
                    <option value="">Selecione o Item...</option>
                    {schoolInventory.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={quantity || ''}
                    onChange={e => setQuantity(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-4 text-xl font-black text-slate-800 outline-none"
                    placeholder="Qtd"
                  />
                  <button type="submit" className="bg-slate-900 text-white px-8 rounded-[24px] font-black uppercase tracking-widest text-xs">
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          )}

          {viewMode === 'ESTOQUE' && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 uppercase">Estoque da Unidade</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo em Tempo Real</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schoolInventory.map(item => (
                  <div key={item.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-emerald-200 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.unidade_medida || item.unidadeMedida || 'UN'}</p>
                      <h4 className="font-bold text-slate-800 uppercase text-sm truncate max-w-[150px]">{item.nome}</h4>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${item.saldoEscola < (item.estoque_minimo || 5) ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {item.saldoEscola.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - HISTORY */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico Recente</h4>
            {/* ... List ... */}
            <div className="space-y-2">
              {schoolHistory.map(mov => (
                <div key={mov.id} className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">
                    {inventory.find(i => i.id === mov.itemId)?.nome || 'Item'}
                  </span>
                  <span className="text-[10px] font-black text-slate-800">
                    {mov.quantidade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MerendeiraTerminal;
