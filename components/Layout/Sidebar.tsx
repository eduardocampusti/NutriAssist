import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePNAE } from '../../contexts/PNAEContext';
import {
  UserRole, UserProfile
} from '../../types';
import {
  Home, FileText, Sparkles, FolderLock, Utensils, ShoppingBag, Truck, Package,
  Users, Heart, Scale, GraduationCap, Users2, Settings, History, Shield, ShieldCheck,
  Menu, Info, BookOpen, LogOut, ChevronRight, LayoutDashboard, Database, ClipboardList, Zap, BarChart3,
  X
} from 'lucide-react';
import { hasPermission } from '../../utils/permissions';
import { Button } from '../UI/Button';

export interface SidebarProps {
  profiles: UserProfile[];
  currentProfileId: string;
  onProfileChange: (profileId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profiles, currentProfileId, onProfileChange, isOpen, onClose, onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { letterhead } = usePNAE();
  const activeProfile = profiles.find(p => p.id === currentProfileId);

  const MenuItem = ({ icon: Icon, label, path, badge, variant = 'default', sub = false }: any) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    let baseStyles = "w-full group flex items-center justify-between px-4 py-3 rounded-none border-l-2 border-transparent text-sm transition-all duration-150 relative overflow-hidden active:translate-x-1";

    // Variant Styles
    let normalStyle = isActive
      ? "bg-slate-800 border-emerald-500 text-emerald-400 font-bold"
      : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border-slate-700";

    let logoutStyle = "mt-8 text-red-400 hover:bg-red-900/20 hover:text-red-300 border-l-2 border-transparent hover:border-red-500";

    const activeClass = variant === 'logout' ? logoutStyle : normalStyle;

    return (
      <button
        onClick={() => { navigate(path); if (window.innerWidth < 1024) onClose(); }}
        className={`${baseStyles} ${activeClass} ${sub ? 'pl-11 py-2 text-[12px]' : ''}`}
      >
        <div className="flex items-center gap-3 relative z-10">
          {!sub && <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-100' : 'group-hover:scale-100'}`} />}
          <span className="tracking-tight">{label}</span>
        </div>

        {badge && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider relative z-10 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 mt-8 mb-3 flex items-center gap-2">
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{label}</span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-900 border-r border-slate-800 shadow-2xl lg:shadow-none flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >

        {/* Header / Brand */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between lg:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white"><X className="w-5 h-5" /></Button>
          </div>

          <div className="flex items-center gap-4 relative group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-600 rounded-sm flex items-center justify-center text-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] text-white ring-2 ring-emerald-900">
              {letterhead.logoEmoji || '🥗'}
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-white tracking-tighter leading-none">
                NutriAssist
              </h1>
              <span className="text-emerald-400 block text-[10px] font-bold uppercase tracking-[0.2em] mt-1">SME Digital</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-6 mb-6">
          <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 flex items-center gap-4 group hover:border-brand-200 transition-colors shadow-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface-900 flex items-center justify-center font-bold text-lg text-brand-600 shadow-sm border border-surface-100">
                {activeProfile?.nome.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-500 rounded-full border-2 border-white dark:border-surface-800"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-700 transition-colors">{activeProfile?.nome}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{activeProfile?.role}</p>
            </div>
            <Settings className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors" />
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pb-8 custom-scrollbar space-y-0.5">
          <SectionLabel label="Visão Geral" />
          <MenuItem icon={LayoutDashboard} label="Dashboard" path="/" />

          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') || hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN')) && (
            <MenuItem icon={ClipboardList} label="Painel de Controle" path="/controle-nutricional" badge="Estratégico" />
          )}

          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') || hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL')) && (
            <SectionLabel label="Documentação" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') && <MenuItem icon={Sparkles} label="Nova Redação IA" path="/elaborar" badge="AI" />}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') && <MenuItem icon={FolderLock} label="Arquivo Digital" path="/arquivo" />}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') && <MenuItem icon={FileText} label="Relatórios SME" path="/relatorios" />}

          <SectionLabel label="Gestão PNAE" />
          {hasPermission(activeProfile?.role, 'VIEW_MENUS') && <MenuItem icon={Utensils} label="Cardápios" path="/cardapio" />}
          {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && <MenuItem icon={ShoppingBag} label="Compras (Cota)" path="/pnae" />}
          {hasPermission(activeProfile?.role, 'VIEW_STOCK') && <MenuItem icon={Truck} label="Estoque & Logística" path="/estoque" />}
          {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && <MenuItem icon={Zap} label="Simulador" path="/simulador-nutricional" badge="Beta" />}
          {hasPermission(activeProfile?.role, 'VIEW_RISK_INDICATORS') && <MenuItem icon={BarChart3} label="Risco por Zona" path="/risco-nutricional" />}

          {(hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') || hasPermission(activeProfile?.role, 'MANAGE_STUDENTS')) && (
            <MenuItem icon={Scale} label="Avaliação Nutricional" path="/avaliacao-nutricional" />
          )}

          <SectionLabel label="Administrativo" />
          {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && <MenuItem icon={Users2} label="Escolas" path="/escolas" />}
          {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && <MenuItem icon={Users2} label="Merendeiras" path="/merendeiras" />}
          {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && <MenuItem icon={Heart} label="Alunos" path="/alunos" />}
          {hasPermission(activeProfile?.role, 'MANAGE_STUDENTS_IMPORT') && <MenuItem icon={ClipboardList} label="Importar" path="/importar-alunos" badge="CSV" />}
          {hasPermission(activeProfile?.role, 'MANAGE_SYSTEM_SETTINGS') && (
            <MenuItem icon={GraduationCap} label="Capacitações" path="/treinamentos" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && (
            <MenuItem icon={ShieldCheck} label="Conformidade" path="/conformidade" />
          )}

          <SectionLabel label="Sistema" />
          {hasPermission(activeProfile?.role, 'MANAGE_SYSTEM_SETTINGS') && (
            <MenuItem icon={Settings} label="Configurações" path="/configuracoes" />
          )}
          {hasPermission(activeProfile?.role, 'MANAGE_USERS') && (
            <MenuItem icon={Users} label="Usuários" path="/usuarios" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_LOGS') && (
            <MenuItem icon={History} label="Audit Logs" path="/logs" />
          )}
          {hasPermission(activeProfile?.role, 'MANAGE_BACKUP') && (
            <MenuItem icon={Database} label="Backup" path="/backup" />
          )}
          <MenuItem icon={BookOpen} label="Manual" path="/manual" />
          <MenuItem icon={Info} label="Sobre" path="/sobre" />

          <MenuItem icon={LogOut} label="Sair" path="/login" onClick={onLogout} variant="logout" />
        </div>
      </aside>
    </>
  );
};
