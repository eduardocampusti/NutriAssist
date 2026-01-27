import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryMovement, Supplier, School, UserProfile, LetterheadConfig, InventoryBatch, UserRole } from '../types';
import SupplierManager from './Inventory/SupplierManager';
import ProductCatalog from './Inventory/ProductCatalog';
import NormativeBaseManager from './NormativeBaseManager';
import ReceivingManager from './Inventory/ReceivingManager';
import DistributionManager from './Inventory/DistributionManager';
import DistributionReceiver from './Inventory/DistributionReceiver';
import SchoolStockManager from './Inventory/SchoolStockManager';
import InventoryDashboard from './Inventory/InventoryDashboard';
import ReplenishmentDashboard from './Inventory/ReplenishmentDashboard';
import ShortageAnalyticsDashboard from './Inventory/ShortageAnalyticsDashboard';
import { useInventory } from '../contexts/InventoryContext';
import { useSchools } from '../contexts/SchoolContext';
import { useUsers } from '../contexts/UserContext';
import { usePNAE } from '../contexts/PNAEContext';
import {
   LayoutDashboard,
   Users,
   Package,
   Truck,
   MoveRight,
   BarChart3,
   Settings2,
   X,
   ChevronRight,
   Search,
   Bell,
   LogOut,
   ArrowLeftRight,
   Scale,
   ClipboardList,
   AlertCircle,
   ShieldCheck,
   Clock,
   ShieldAlert
} from 'lucide-react';
import AlertManager from './AlertManager';
import SanitaryManager from './SanitaryManager';
import SchoolServiceHistory from './SchoolServiceHistory';
import JustificationManager from './JustificationManager';

interface InventoryManagerProps {
   onClose: () => void;
   initialTab?: string;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
   onClose,
   initialTab = 'DASHBOARD'
}) => {
   const { inventory, movements, batches, suppliers, addItem: onAddItem, updateItem: onUpdateItem, addMovement: onAddMovement, addBatch: onAddBatch, updateBatch: onUpdateBatch, addSupplier: onAddSupplier, updateSupplier: onUpdateSupplier } = useInventory();
   const { schools } = useSchools();
   const { activeProfile } = useUsers();
   const { letterhead } = usePNAE();
   const isDirector = activeProfile?.role === UserRole.DIRETOR;
   const isNucleo = activeProfile?.role === UserRole.NUCLEO_ESCOLAR;
   const isRestricted = isDirector || isNucleo;

   const [activeTab, setActiveTab] = useState(isRestricted ? 'SCHOOL_STOCK' : initialTab);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   useEffect(() => {
      // Priority: Restriction > initialTab
      if (isRestricted) {
         setActiveTab('SCHOOL_STOCK');
      } else if (initialTab) {
         setActiveTab(initialTab);
      }
   }, [initialTab, isRestricted]);

   const menuItems = [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
      { id: 'SUPPLIERS', label: 'Fornecedores', icon: Users, color: 'text-indigo-500' },
      { id: 'CATALOG', label: 'Catálogo Master', icon: Package, color: 'text-orange-500' },
      { id: 'RECEIVING', label: 'Entrada Central', icon: Truck, color: 'text-emerald-500' },
      { id: 'DISTRIBUTION', label: 'Distribuição', icon: MoveRight, color: 'text-purple-500' },
      { id: 'RECEIVING_SCHOOL', label: 'Receber Carga', icon: Truck, color: 'text-purple-600' },
      { id: 'SCHOOL_STOCK', label: 'Estoque Escolar', icon: ArrowLeftRight, color: 'text-pink-500' },
      { id: 'REPLENISHMENT_MGMT', label: 'Gestão de Reposição', icon: ClipboardList, color: 'text-blue-600' },
      { id: 'ALERTS', label: 'Alertas Inteligentes', icon: AlertCircle, color: 'text-red-500' },
      { id: 'SANITARY', label: 'Checklist Sanitário', icon: ShieldCheck, color: 'text-emerald-500' },
      { id: 'JUSTIFICATIONS', label: 'Justificativas Formais', icon: ShieldAlert, color: 'text-blue-600' },
      { id: 'HISTORY', label: 'Histórico de Atendimento', icon: Clock, color: 'text-indigo-600' },
      { id: 'SHORTAGE_ANALYTICS', label: 'Análise de Faltas', icon: BarChart3, color: 'text-rose-600' },
      { id: 'NORMATIVE', label: 'Base Legal (PNAE)', icon: Scale, color: 'text-emerald-600' },
   ];

   return (
      <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
         {/* NEW SIDEBAR */}
         <aside
            className={`${isSidebarOpen ? 'w-72' : 'w-20'} h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-30 shadow-xl shadow-slate-200/50`}
         >
            {/* BRANDING */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-50">
               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Package className="w-6 h-6" />
               </div>
               {isSidebarOpen && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                     <h1 className="text-sm font-black uppercase tracking-tight text-slate-800">PNAE Logística</h1>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de Estoque</p>
                  </div>
               )}
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
               {menuItems.filter(item => {
                  if (isRestricted) {
                     // Diretor e Núcleo não compram merenda (SME envia), logo não vêem Dashboard Global nem Base Legal (Gestão Técnica)
                     return ['SCHOOL_STOCK', 'RECEIVING_SCHOOL', 'REPLENISHMENT_MGMT'].includes(item.id);
                  }
                  if (activeProfile?.role === UserRole.TECNICO) {
                     return ['REPLENISHMENT_MGMT', 'RECEIVING', 'DISTRIBUTION', 'SCHOOL_STOCK', 'CATALOG'].includes(item.id);
                  }
                  if (activeProfile?.role === UserRole.NUTRICIONISTA) {
                     return item.id !== 'RECEIVING_SCHOOL';
                  }
                  if (isDirector) {
                     return ['SCHOOL_STOCK', 'RECEIVING_SCHOOL', 'REPLENISHMENT_MGMT', 'ALERTS', 'SANITARY', 'HISTORY', 'JUSTIFICATIONS'].includes(item.id);
                  }
                  return item.id !== 'RECEIVING_SCHOOL'; // Oculta recebimento da sede para outros perfis
               }).map((item) => (
                  <button
                     key={item.id}
                     onClick={() => setActiveTab(item.id)}
                     className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                  >
                     <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? item.color : 'text-slate-400'}`} />
                     {isSidebarOpen && (
                        <span className="text-sm font-bold uppercase tracking-tight flex-1 text-left">
                           {item.label}
                        </span>
                     )}
                     {isSidebarOpen && activeTab === item.id && (
                        <ChevronRight className="w-4 h-4 opacity-50" />
                     )}
                  </button>
               ))}
            </nav>

            {/* USER PROFILE & FOOTER */}
            <div className="p-4 border-t border-slate-50 space-y-4">
               {isSidebarOpen && activeProfile && (
                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100">
                     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-black text-blue-600 border border-slate-200 shadow-sm">
                        {activeProfile.nome.substring(0, 2).toUpperCase()}
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-slate-700 truncate">{activeProfile.nome}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{activeProfile.role}</p>
                     </div>
                  </div>
               )}

               <button
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group`}
               >
                  <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  {isSidebarOpen && (
                     <span className="text-sm font-bold uppercase tracking-tight">Sair do Módulo</span>
                  )}
               </button>

               <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="w-full flex items-center justify-center p-2 text-slate-300 hover:text-slate-600 transition-colors"
               >
                  {isSidebarOpen ? 'Esconder Menu' : 'Expandir'}
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT AREA */}
         <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* TOOLBAR */}
            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shadow-sm shrink-0">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-xl">
                     {React.createElement(menuItems.find(m => m.id === activeTab)?.icon || LayoutDashboard, { className: "w-5 h-5 text-slate-600" })}
                  </div>
                  <div>
                     <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        {menuItems.find(m => m.id === activeTab)?.label}
                     </h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal de Gestão Logística</p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Pesquisar no estoque..."
                        className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20 w-64 outline-none transition-all"
                     />
                  </div>
                  <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors relative group">
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  <div className="h-8 w-px bg-slate-200 mx-2"></div>
                  <button onClick={onClose} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </header>

            {/* CONTENT OVERFLOW */}
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
               <div className="p-6 md:p-10 max-w-7xl mx-auto h-full">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     {activeTab === 'DASHBOARD' && (
                        <InventoryDashboard
                           inventory={inventory}
                           batches={batches}
                           suppliers={suppliers}
                           movements={movements}
                           schools={schools}
                           config={letterhead}
                        />
                     )}

                     {activeTab === 'SUPPLIERS' && (
                        <SupplierManager
                           suppliers={suppliers}
                           onAddSupplier={onAddSupplier}
                           onUpdateSupplier={onUpdateSupplier}
                        />
                     )}

                     {activeTab === 'CATALOG' && (
                        <ProductCatalog
                           inventory={inventory}
                           batches={batches}
                           onAddItem={onAddItem}
                           onUpdateItem={onUpdateItem}
                        />
                     )}

                     {activeTab === 'RECEIVING' && (
                        <ReceivingManager
                           inventory={inventory}
                           suppliers={suppliers}
                           onAddBatch={onAddBatch}
                           onAddItem={onAddItem}
                        />
                     )}

                     {activeTab === 'DISTRIBUTION' && (
                        <DistributionManager
                           inventory={inventory}
                           batches={batches}
                           schools={schools}
                           activeProfile={activeProfile}
                           letterhead={letterhead}
                           onAddMovement={async (mov) => await onAddMovement(mov, activeProfile?.id || 'system')}
                        />
                     )}

                     {activeTab === 'SCHOOL_STOCK' && (
                        <SchoolStockManager
                           inventory={inventory}
                           movements={movements}
                           schools={schools}
                           lockedSchoolId={isDirector ? activeProfile?.school_id : undefined}
                        />
                     )}

                     {activeTab === 'RECEIVING_SCHOOL' && activeProfile && (
                        <DistributionReceiver
                           activeProfile={activeProfile}
                           school={schools.find(s => s.id === activeProfile.school_id)}
                        />
                     )}

                     {activeTab === 'REPLENISHMENT_MGMT' && activeProfile && (
                        <ReplenishmentDashboard activeProfile={activeProfile} />
                     )}

                     {activeTab === 'ALERTS' && activeProfile && (
                        <AlertManager activeProfile={activeProfile} />
                     )}

                     {activeTab === 'SANITARY' && activeProfile && (
                        <SanitaryManager activeProfile={activeProfile} />
                     )}

                     {activeTab === 'HISTORY' && activeProfile && (
                        <SchoolServiceHistory activeProfile={activeProfile} />
                     )}

                     {activeTab === 'SHORTAGE_ANALYTICS' && (
                        <ShortageAnalyticsDashboard />
                     )}

                     {activeTab === 'NORMATIVE' && (
                        <div className="h-[calc(100vh-140px)]">
                           <NormativeBaseManager
                              onClose={() => setActiveTab('DASHBOARD')}
                           />
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default InventoryManager;
