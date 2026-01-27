
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePNAE } from '../contexts/PNAEContext';
import {
  UserRole, UserProfile
} from '../types';
import {
  Home, FileText, Sparkles, FolderLock, Utensils, ShoppingBag, Truck, Package,
  Users, Heart, Scale, GraduationCap, Users2, Settings, History, Shield, ShieldCheck,
  Menu, Info, BookOpen, LogOut, ChevronRight, LayoutDashboard, Database, ClipboardList, Zap, BarChart3
} from 'lucide-react';
import { hasPermission } from '../utils/permissions';

interface SidebarProps {
  profiles: UserProfile[];
  currentProfileId: string;
  onProfileChange: (profileId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  profiles, currentProfileId, onProfileChange, isOpen, onClose, onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { letterhead } = usePNAE();
  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const isAdmin = activeProfile?.role === UserRole.ADMIN;

  const MenuItem = ({ icon: Icon, label, path, badge, variant = 'default', sub = false }: any) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    let baseStyles = "w-full group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-300 relative overflow-hidden";
    let activeStyles = isActive
      ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20"
      : "text-slate-400 hover:text-white hover:bg-slate-800/40";

    if (variant === 'logout') baseStyles += " mt-8 bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500/20 hover:text-rose-400";

    return (
      <button
        onClick={() => { navigate(path); if (window.innerWidth < 1024) onClose(); }}
        className={`${baseStyles} ${activeStyles} ${sub ? 'pl-11 py-2 text-[12px]' : ''}`}
      >
        <div className="flex items-center gap-3 relative z-10">
          {!sub && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />}
          <span className="tracking-tight">{label}</span>
        </div>

        {isActive && !sub && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        )}

        {badge && (
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter relative z-10 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mt-8 mb-2 block">{label}</label>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden print:hidden" onClick={onClose} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#020617] text-slate-300 h-screen flex flex-col border-r border-slate-800/50 transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 print:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* BRANDING */}
        <div className="p-8 pb-4 relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex items-center gap-3 mb-1 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-transform group-hover:rotate-6">{letterhead.logoEmoji || '🥗'}</div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter leading-none">NutriAssist<span className="text-emerald-500">SME</span></h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gestão Inteligente</p>
            </div>
          </div>
        </div>

        {/* PROFILE SELECTOR */}
        <div className="px-6 mb-6">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 transition-all hover:bg-slate-900/60 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs border border-emerald-500/30">
                {activeProfile?.nome.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-slate-200 uppercase truncate">{activeProfile?.nome}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">{activeProfile?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">

          <SectionLabel label="Início" />
          <MenuItem icon={LayoutDashboard} label="Dashboard Geral" path="/" />
          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') || hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN')) && (
            <MenuItem icon={ClipboardList} label="Painel de Controle" path="/controle-nutricional" badge="Estratégico" />
          )}

          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') || hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL')) && (
            <SectionLabel label="Atos Oficiais" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') && <MenuItem icon={Sparkles} label="Nova Redação IA" path="/elaborar" />}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') && <MenuItem icon={FolderLock} label="Arquivo Central" path="/arquivo" />}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') && <MenuItem icon={FileText} label="Relatórios SME" path="/relatorios" />}

          <SectionLabel label="Alimentação Escolar" />
          {hasPermission(activeProfile?.role, 'VIEW_MENUS') && <MenuItem icon={Utensils} label="Cardápios PNAE" path="/cardapio" />}
          {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && <MenuItem icon={ShoppingBag} label="Cota PNAE (Compras)" path="/pnae" />}
          {hasPermission(activeProfile?.role, 'VIEW_STOCK') && <MenuItem icon={Truck} label="Logística & Estoque" path="/estoque" />}
          {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && <MenuItem icon={Zap} label="Simulador de Impacto" path="/simulador-nutricional" badge="Beta" />}
          {hasPermission(activeProfile?.role, 'VIEW_RISK_INDICATORS') && <MenuItem icon={BarChart3} label="Risco por Zona" path="/risco-nutricional" badge="IA" />}
          {(hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') || hasPermission(activeProfile?.role, 'MANAGE_STUDENTS')) && (
            <MenuItem icon={Scale} label="Avaliação Nutricional" path="/avaliacao-nutricional" />
          )}

          <SectionLabel label="Unidades & Equipe" />
          {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && <MenuItem icon={Users2} label="Registro de Escolas" path="/escolas" />}
          {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && <MenuItem icon={Users2} label="Equipe de Cozinha" path="/merendeiras" />}
          {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && <MenuItem icon={Heart} label="Gestão de Alunos" path="/alunos" />}
          {hasPermission(activeProfile?.role, 'MANAGE_STUDENTS_IMPORT') && <MenuItem icon={ClipboardList} label="Importar Alunos" path="/importar-alunos" badge="CSV" />}
          {hasPermission(activeProfile?.role, 'MANAGE_SYSTEM_SETTINGS') && <MenuItem icon={GraduationCap} label="Capacitações" path="/treinamentos" />}
          {(hasPermission(activeProfile?.role, 'VIEW_REPORTS_ADMIN') || hasPermission(activeProfile?.role, 'MANAGE_SYSTEM_SETTINGS')) && (
            <MenuItem icon={ClipboardList} label="Relatórios de Gestão" path="/relatorios-gestao" badge="Novo" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && (
            <MenuItem icon={ShieldCheck} label="Conformidade Escolar" path="/conformidade" badge="SME" />
          )}
          <SectionLabel label="Configurações" />
          {hasPermission(activeProfile?.role, 'MANAGE_SYSTEM_SETTINGS') && (
            <MenuItem icon={Settings} label="Configurações" path="/configuracoes" />
          )}
          {hasPermission(activeProfile?.role, 'MANAGE_USERS') && (
            <MenuItem icon={Users} label="Gestão de Usuários" path="/usuarios" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_LOGS') && (
            <MenuItem icon={History} label="Logs do Sistema" path="/logs" />
          )}
          {hasPermission(activeProfile?.role, 'MANAGE_BACKUP') && (
            <MenuItem icon={Database} label="Backup & Dados" path="/backup" />
          )}
          <MenuItem icon={BookOpen} label="Manual Técnico" path="/manual" />
          <MenuItem icon={Info} label="Sobre o NutriAssist" path="/sobre" />
          <MenuItem icon={Shield} label="TR do Projeto" path="/projeto/tr" />

          <MenuItem icon={LogOut} label="Encerrar Sessão" path="/login" onClick={onLogout} variant="logout" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
