import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePNAE } from '../../contexts/PNAEContext';
import { UserRole, UserProfile } from '../../types';
import {
  Home, FileText, Sparkles, FolderLock, Utensils, ShoppingBag, Truck,
  Users, Heart, Scale, GraduationCap, Users2, Settings, History, Shield, ShieldCheck,
  Menu, Info, BookOpen, LogOut, ChevronRight, LayoutDashboard, Database, ClipboardList, Zap, BarChart3,
  X, Building2, Award
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
  // Using the first profile as active if generic 'profiles' array is passed, 
  // but ideally we rely on a proper active context.
  const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  const MenuItem = ({ icon: Icon, label, path, badge, variant = 'default', sub = false }: any) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    // Institutional Sidebar Item Styles
    const baseStyles = "w-full group flex items-center justify-between px-4 py-3 border-l-[3px] text-sm transition-all duration-200 relative overflow-hidden active:translate-x-1 outline-none focus:bg-emerald-800";

    // Active: Leaf Green accent, Subtle Green bg
    const activeStyle = isActive
      ? "bg-emerald-800/50 border-[#22c55e] text-white font-bold shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]"
      : "border-transparent text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white hover:border-emerald-700";

    const logoutStyle = "mt-8 text-emerald-200 hover:bg-rose-900/20 hover:text-rose-200 border-l-[3px] border-transparent hover:border-rose-500 transition-colors";

    const finalClass = variant === 'logout' ? logoutStyle : activeStyle;

    return (
      <button
        onClick={() => { navigate(path); if (window.innerWidth < 1024) onClose(); }}
        className={`${baseStyles} ${finalClass} ${sub ? 'pl-12 py-2 text-xs' : ''}`}
      >
        <div className="flex items-center gap-3 relative z-10">
          {!sub && <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'text-[#22c55e] scale-110' : 'text-emerald-400/60 group-hover:text-white'}`} strokeWidth={isActive ? 2.5 : 2} />}
          <span className={`tracking-tight ${isActive ? 'tracking-normal' : ''}`}>{label}</span>
        </div>

        {badge && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded-[2px] font-black uppercase tracking-wider relative z-10 ${isActive ? 'bg-[#22c55e] text-emerald-950' : 'bg-emerald-900 text-emerald-400 group-hover:bg-emerald-800 group-hover:text-white'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 mt-8 mb-2 flex items-center gap-2 opacity-60">
      <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-[0.2em]">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-emerald-800 to-transparent"></div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container - Premium Forest Green */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#064E3B] border-r border-[#065F46] flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none`}
      >
        {/* BRAND HEADER */}
        <div className="h-20 flex items-center px-6 border-b border-[#065F46] bg-[#064E3B]">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-gradient-to-br from-[#16A34A] to-[#15803d] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-black/20 ring-1 ring-emerald-400/30">
              {letterhead.logoEmoji || '🌿'}
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">
                NutriAssist
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                <span className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-[0.2em]">SME Digital</span>
              </div>
            </div>

            {/* Mobile Close */}
            <button onClick={onClose} className="lg:hidden ml-auto text-emerald-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION SCROLL AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-0.5">

          <MenuItem icon={LayoutDashboard} label="Dashboard" path="/" />

          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') || hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN')) && (
            <MenuItem icon={ClipboardList} label="Painel Estratégico" path="/controle-nutricional" badge="Gestão" />
          )}

          {hasPermission(activeProfile?.role, 'VIEW_SECRETARY_PANEL') && (
            <MenuItem icon={Shield} label="Painel da Secretária" path="/painel-secretario" badge="Executivo" />
          )}

          <SectionLabel label="Operacional" />
          {hasPermission(activeProfile?.role, 'VIEW_MENUS') && <MenuItem icon={Utensils} label="Cardápios PNAE" path="/cardapio" />}
          {hasPermission(activeProfile?.role, 'VIEW_STOCK') && <MenuItem icon={Truck} label="Logística & Estoque" path="/estoque" />}
          {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && <MenuItem icon={ShoppingBag} label="Compras & Cota" path="/pnae" />}

          <SectionLabel label="Pedagógico & Nutricional" />
          {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && <MenuItem icon={Heart} label="Alunos" path="/alunos" />}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && <MenuItem icon={ClipboardList} label="Fichas Técnicas" path="/fichas-tecnicas" />}
          {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && <MenuItem icon={Zap} label="Simulador de Impacto" path="/simulador-nutricional" />}

          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') || hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL')) && (
            <>
              <SectionLabel label="Governança" />
              <MenuItem icon={Sparkles} label="Redação Técnica IA" path="/elaborar" badge="Novo" />
              <MenuItem icon={FolderLock} label="Arquivo Digital" path="/arquivo" />
              <MenuItem icon={FileText} label="Relatórios Oficiais" path="/relatorios" />
              {hasPermission(activeProfile?.role, 'VIEW_NUTRITIONAL_PANEL') && <MenuItem icon={BarChart3} label="Cockpit FNDE" path="/painel-fnde" />}
              <MenuItem icon={ShieldCheck} label="Compliance & Selo" path="/conformidade" />
              <MenuItem icon={Award} label="Transparência PNAE" path="/transparencia-pnae" />
            </>
          )}

          <SectionLabel label="Institucional" />
          {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && <MenuItem icon={Building2} label="Escolas" path="/escolas" />}
          {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && <MenuItem icon={Users2} label="Equipe Técnica" path="/merendeiras" />}
          {hasPermission(activeProfile?.role, 'MANAGE_USERS') && <MenuItem icon={Users} label="Usuários do Sistema" path="/usuarios" />}

          <MenuItem icon={Settings} label="Configurações" path="/configuracoes" />
          <MenuItem icon={Info} label="Sobre o Sistema" path="/sobre" />

          <MenuItem icon={LogOut} label="Encerrar Sessão" path="/login" onClick={onLogout} variant="logout" />
        </div>

        {/* BOTTOM PROFILE - ORGANIC FEEL */}
        <div className="p-4 border-t border-[#065F46] bg-[#022c22]">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-100 font-bold border border-emerald-700 group-hover:border-emerald-500 group-hover:text-white transition-colors">
              {activeProfile?.nome?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-emerald-50 truncate">{activeProfile?.nome}</p>
              <p className="text-[9px] font-bold text-[#22c55e] uppercase tracking-wider truncate">{activeProfile?.role?.replace('_', ' ')}</p>
            </div>
            <Settings className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
          </div>
        </div>

      </aside>
    </>
  );
};
