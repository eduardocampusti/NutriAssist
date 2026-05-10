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
            style={{background:'#fff',borderRight:'1px solid #e2e8f0',boxShadow:'4px 0 20px rgba(0,0,0,0.06)'}}
            className={`${isSidebarOpen ? 'w-72' : 'w-20'} h-full flex flex-col transition-all duration-300 ease-in-out z-30`}
         >
            {/* BRANDING */}
            <div className="p-4 flex items-center gap-3" style={{borderBottom:'1px solid #f1f5f9',background:'#fafafa',flexShrink:0}}>
               <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{background:'linear-gradient(135deg,#1e40af,#1d4ed8)',boxShadow:'0 4px 14px rgba(29,78,216,0.3)',flexShrink:0}}>
                  <Package className="w-6 h-6" />
               </div>
               {isSidebarOpen && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                     <h1 className="text-sm font-black uppercase tracking-tight" style={{color:'#0f172a',letterSpacing:'-0.01em'}}>PNAE Logística</h1>
                     <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:'#1d4ed8'}}>Controle de Estoque</p>
                  </div>
               )}
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                     style={{background: activeTab === item.id ? '#eff6ff' : 'transparent', marginBottom:2, border:'none', cursor:'pointer', fontFamily:'inherit', width:'100%', display:'flex', alignItems:'center', gap:9, padding:'7px 10px', borderRadius:9, transition:'all 0.15s', boxShadow: activeTab === item.id ? '0 1px 4px rgba(29,78,216,0.10)' : 'none'}} className={`flex items-center gap-3 rounded-xl transition-all group ${activeTab === item.id
                        ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
                        }`}
                  >
                     <item.icon style={{width:15,height:15,color: activeTab === item.id ? '#1d4ed8' : '#94a3b8',flexShrink:0}} />
                     {isSidebarOpen && (
                        <span style={{fontSize:12,fontWeight:600,flex:1,textAlign:'left',letterSpacing:'-0.01em'}}>
                           {item.label}
                        </span>
                     )}
                     {isSidebarOpen && activeTab === item.id && (
                        <ChevronRight style={{width:13,height:13,opacity:0.5,color:'#1d4ed8'}} />
                     )}
                  </button>
               ))}
            </nav>

            {/* USER PROFILE & FOOTER */}
            <div className="p-3 space-y-2" style={{borderTop:'1px solid #f1f5f9',flexShrink:0}}>
               {isSidebarOpen && activeProfile && (
                  <div className="p-2 rounded-xl flex items-center gap-2" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                     <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{background:'linear-gradient(135deg,#1e40af,#1d4ed8)',color:'#fff',flexShrink:0}}>
                        {activeProfile.nome.substring(0, 2).toUpperCase()}
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black uppercase truncate" style={{color:'#0f172a'}}>{activeProfile.nome}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest" style={{color:'#94a3b8'}}>{activeProfile.role}</p>
                     </div>
                  </div>
               )}

               <button
                  onClick={onClose}
                  className="w-full flex items-center gap-3 rounded-xl transition-all group" style={{padding:'7px 10px',background:'transparent',border:'none',cursor:'pointer',fontFamily:'inherit',color:'#94a3b8',fontSize:12,fontWeight:600}}
               >
                  <LogOut style={{width:14,height:14}} />
                  {isSidebarOpen && (
                     <span className="text-xs font-bold uppercase tracking-tight" style={{color:'inherit'}}>Sair do Módulo</span>
                  )}
               </button>

               <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="w-full flex items-center justify-center p-2 transition-colors" style={{color:'#cbd5e1',fontSize:10,border:'none',background:'transparent',cursor:'pointer'}}
               >
                  {isSidebarOpen ? 'Esconder Menu' : 'Expandir'}
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT AREA */}
         <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* TOOLBAR */}
            <header className="bg-white flex items-center justify-between px-6 z-20 shrink-0" style={{height:56,borderBottom:'1px solid #f1f5f9',boxShadow:'0 1px 8px rgba(0,0,0,0.04)'}}>
               <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg" style={{background:'#f0fdf4'}}>
                     {React.createElement(menuItems.find(m => m.id === activeTab)?.icon || LayoutDashboard, { className: "w-5 h-5 text-slate-600" })}
                  </div>
                  <div>
                     <h2 className="font-black text-slate-900 uppercase tracking-tight" style={{fontSize:15,letterSpacing:'-0.01em'}}>
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
                  <button onClick={onClose} className="p-2 text-white rounded-lg transition-colors" style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>
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
