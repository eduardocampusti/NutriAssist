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

    let baseStyles = "w-full group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 relative overflow-hidden active:scale-[0.98]";

    // Variant Styles
    let normalStyle = isActive
      ? "bg-brand-50 text-brand-700 font-bold shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100";

    let logoutStyle = "mt-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30";

    const activeClass = variant === 'logout' ? logoutStyle : normalStyle;

    return (
      <button
        onClick={() => { navigate(path); if (window.innerWidth < 1024) onClose(); }}
        className={`${baseStyles} ${activeClass} ${sub ? 'pl-11 py-2 text-[12px]' : ''}`}
      >
        <div className="flex items-center gap-3 relative z-10">
          {!sub && <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />}
          <span className="tracking-medium">{label}</span>
        </div>

        {isActive && !sub && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-600 rounded-r-full"></div>
        )}

        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider relative z-10 transition-colors ${isActive ? 'bg-brand-200 text-brand-800 dark:bg-brand-500/30 dark:text-brand-300' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm dark:bg-slate-800 dark:text-slate-400'}`}>
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
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-none flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >

        {/* Header / Brand */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu Principal</span>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
          </div>

          <div className="flex items-center gap-3 relative group cursor-default">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-brand-600/20 text-white transition-transform group-hover:scale-105 group-hover:rotate-3">
              {letterhead.logoEmoji || '🥗'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">NutriAssist<span className="text-brand-600">SME</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestão Inteligente</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-4 mb-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
              {activeProfile?.nome.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{activeProfile?.nome}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase truncate">{activeProfile?.role}</p>
            </div>
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
