import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePNAE } from '../../contexts/PNAEContext';
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
  const { letterhead } = usePNAE();
  const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  const MenuItem = ({ icon: Icon, label, path, badge, iconColor = '#94a3b8' }: any) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
      <button
        onClick={() => { navigate(path); if (window.innerWidth < 1024) onClose(); }}
        className={`w-full flex items-center justify-between px-3 py-[7px] rounded-lg transition-all duration-150 outline-none group text-left ${
          isActive ? 'font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
        style={{
          backgroundColor: isActive ? '#e8f7f1' : undefined,
          color: isActive ? '#0d4f2e' : undefined,
        }}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className="w-[15px] h-[15px] flex-shrink-0 transition-colors"
            style={{ color: isActive ? '#0d4f2e' : iconColor }}
          />
          <span className="text-[11.5px] font-medium leading-none">{label}</span>
        </div>
        {badge && (
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider"
            style={{ backgroundColor: isActive ? 'rgba(13,79,46,0.15)' : '#e8f7f1', color: '#0d4f2e' }}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  const Separator = () => (
    <div className="my-1.5 mx-1 h-px" style={{ backgroundColor: '#eeecea' }} />
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-lg lg:shadow-none`}
        style={{ backgroundColor: '#fafaf9', borderRight: '1px solid #eeecea' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 flex-shrink-0" style={{ borderBottom: '1px solid #eeecea' }}>
          <div className="flex items-center gap-3 w-full">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[15px] flex-shrink-0"
              style={{ backgroundColor: '#0d4f2e' }}
            >
              {letterhead.logoEmoji || '🌿'}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13px] font-black text-slate-900 tracking-tight leading-none">
                NUTRIASSIST
              </span>
              <span className="text-[9px] font-medium text-slate-400 mt-0.5 font-mono tracking-wider">
                v{APP_VERSION}
              </span>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-0.5">
          <MenuItem icon={LayoutDashboard} label="Dashboard"       path="/"                   iconColor="#64748b" />
          {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && (
            <MenuItem icon={Building2}    label="Escolas"          path="/escolas"            iconColor="#3b82f6" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_SECRETARY_PANEL') && (
            <MenuItem icon={Shield}       label="Executivo"        path="/painel-secretario"  iconColor="#8b5cf6" />
          )}

          <Separator />

          {hasPermission(activeProfile?.role, 'VIEW_MENUS') && (
            <MenuItem icon={Utensils}     label="Cardápios"        path="/cardapio"           iconColor="#f97316" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_STOCK') && (
            <MenuItem icon={Truck}        label="Estoque"          path="/estoque"            iconColor="#f59e0b" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
            <MenuItem icon={ShoppingBag}  label="Compras"          path="/pnae"               iconColor="#1D9E75" />
          )}

          <Separator />

          {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && (
            <MenuItem icon={Heart}        label="Alunos"           path="/alunos"             iconColor="#ec4899" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && (
            <MenuItem icon={FileText}     label="Fichas Técnicas"  path="/fichas-tecnicas"    iconColor="#3b82f6" />
          )}
          {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && (
            <MenuItem icon={Zap}          label="Simulador"        path="/simulador-nutricional" iconColor="#a855f7" />
          )}

          <Separator />

          <MenuItem icon={Sparkles}       label="Inteligência IA"  path="/elaborar"           iconColor="#1D9E75" badge="IA" />
          <MenuItem icon={ShieldCheck}    label="Compliance"       path="/conformidade"       iconColor="#0d4f2e" />
          <MenuItem icon={Award}          label="Transparência"    path="/transparencia-pnae" iconColor="#0d9488" />
          <MenuItem icon={BarChart3}      label="Cockpit FNDE"     path="/painel-fnde"        iconColor="#6366f1" />

          <Separator />

          {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && (
            <MenuItem icon={Users2}       label="Equipe"           path="/merendeiras"        iconColor="#ec4899" />
          )}
          {hasPermission(activeProfile?.role, 'MANAGE_USERS') && (
            <MenuItem icon={Users}        label="Usuários"         path="/usuarios"           iconColor="#64748b" />
          )}
          <MenuItem icon={Settings}       label="Configurações"    path="/configuracoes"      iconColor="#64748b" />
        </div>

        {/* Footer */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid #eeecea' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut size={14} />
            <span className="text-[11.5px] font-medium">Encerrar sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
