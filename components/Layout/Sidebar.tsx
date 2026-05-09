import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../../types';
import {
  Sparkles, FileText, Utensils, ShoppingBag, Truck,
  Users, Heart, Users2, Settings, Shield, ShieldCheck,
  X, Building2, Award, LayoutDashboard, Zap, BarChart3, LogOut
} from 'lucide-react';
import { hasPermission } from '../../utils/permissions';
import { APP_VERSION } from '../../constants';

export interface SidebarProps {
  profiles: UserProfile[];
  currentProfileId: string;
  onProfileChange: (profileId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profiles, currentProfileId, isOpen, onClose, onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  const MenuItem = ({ icon: Icon, label, path, badge }: any) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
      <button
        onClick={() => { navigate(path); if (window.innerWidth < 1024) onClose(); }}
        className="w-full flex items-center justify-between outline-none text-left transition-all duration-100"
        style={{
          padding: '6px 16px',
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          color: isActive ? '#FFFFFF' : '#94a3b8',
          fontWeight: isActive ? 700 : 500,
          borderRadius: '8px',
          margin: '2px 8px',
          width: 'calc(100% - 16px)',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span style={{ fontSize: 11, lineHeight: 1 }}>{label}</span>
        </div>
        {badge && (
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionSep = ({ label }: { label: string }) => (
    <div className="pt-4 px-4 pb-2">
      <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
        style={{ backgroundColor: '#0d4f2e' }}
      >
        {/* Logo Area */}
        <div className="flex items-center px-5 flex-shrink-0 h-[64px]">
          <div className="flex items-center gap-3 w-full">
             <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-900/20">
               <span className="text-white font-black text-lg">N</span>
             </div>
             <div className="flex flex-col flex-1">
               <div className="flex items-center gap-2">
                 <span className="text-[13px] font-black text-white tracking-tight">NUTRIASSIST</span>
                 <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">v{APP_VERSION}</span>
               </div>
               <span className="text-[9px] text-emerald-400 font-bold tracking-tight">TECNOLOGIA PNAE</span>
             </div>
             <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white transition-colors">
               <X size={18} />
             </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 custom-scrollbar">
          <MenuItem icon={LayoutDashboard} label="Dashboard" path="/" />
          
          <SectionSep label="Gestão" />
          {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && (
            <MenuItem icon={Building2} label="Escolas" path="/escolas" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_SECRETARY_PANEL') && (
            <MenuItem icon={Shield} label="Executivo" path="/painel-secretario" />
          )}

          <SectionSep label="Operacional" />
          {hasPermission(activeProfile?.role, 'VIEW_MENUS') && (
            <MenuItem icon={Utensils} label="Cardápios" path="/cardapio" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_STOCK') && (
            <MenuItem icon={Truck} label="Estoque" path="/estoque" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
            <MenuItem icon={ShoppingBag} label="Compras" path="/pnae" />
          )}

          <SectionSep label="Nutricional" />
          {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && (
            <MenuItem icon={Heart} label="Alunos" path="/alunos" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && (
            <MenuItem icon={FileText} label="Fichas Técnicas" path="/fichas-tecnicas" />
          )}
          {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && (
            <MenuItem icon={Zap} label="Simulador" path="/simulador-nutricional" />
          )}

          <SectionSep label="Governança" />
          <MenuItem icon={Sparkles} label="Inteligência IA" path="/elaborar" badge="IA" />
          <MenuItem icon={ShieldCheck} label="Compliance" path="/conformidade" />
          <MenuItem icon={Award} label="Transparência" path="/transparencia-pnae" />
          <MenuItem icon={BarChart3} label="Cockpit FNDE" path="/painel-fnde" />

          <div className="pt-8 pb-4 opacity-30">
            <div className="h-px bg-white/20 mx-4" />
          </div>

          <MenuItem icon={Settings} label="Configurações" path="/configuracoes" />
          {hasPermission(activeProfile?.role, 'MANAGE_USERS') && (
             <MenuItem icon={Users} label="Usuários" path="/usuarios" />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group hover:bg-rose-500/10"
            style={{ color: '#94a3b8' }}
          >
            <LogOut size={16} className="group-hover:text-rose-400 transition-colors" />
            <span className="text-[12px] font-bold group-hover:text-rose-400 transition-colors">Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
