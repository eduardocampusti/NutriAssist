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
        className="w-full flex items-center justify-between outline-none text-left transition-colors duration-100"
        style={{
          padding: '7px 12px',
          backgroundColor: isActive ? '#e8f7f1' : 'transparent',
          color: isActive ? '#0d4f2e' : '#666666',
          fontWeight: isActive ? 600 : 400,
          borderLeft: isActive ? '3px solid #1D9E75' : '3px solid transparent',
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: 0,
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f3'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-[15px] h-[15px] flex-shrink-0" />
          <span style={{ fontSize: 11.5, lineHeight: 1 }}>{label}</span>
        </div>
        {badge && (
          <span
            style={{
              fontSize: 8,
              padding: '2px 6px',
              borderRadius: 99,
              fontWeight: 800,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              backgroundColor: isActive ? 'rgba(13,79,46,0.12)' : '#e8f7f1',
              color: '#0d4f2e',
            }}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionSep = ({ label }: { label: string }) => (
    <div style={{ paddingTop: 10, paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
      <div style={{ borderTop: '0.5px solid #f0f0ee', marginBottom: 6 }} />
      <span style={{ fontSize: 9, color: '#bbbbbb', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 700 }}>
        {label}
      </span>
    </div>
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
        style={{ backgroundColor: '#ffffff', borderRight: '0.5px solid #e8e8e6' }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-4 flex-shrink-0"
          style={{ height: 52, borderBottom: '0.5px solid #e8e8e6' }}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#0d4f2e' }}
            >
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, lineHeight: 1, userSelect: 'none' }}>N</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111111', letterSpacing: '-0.01em', lineHeight: 1 }}>
                NUTRIASSIST
              </span>
              <span style={{ fontSize: 9, color: '#999999', marginTop: 2, fontFamily: 'monospace' }}>
                v{APP_VERSION}
              </span>
              <span style={{ fontSize: 9, color: '#1D9E75', marginTop: 1, fontWeight: 600 }}>
                ● SME DIGITAL
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden flex-shrink-0 transition-colors hover:opacity-60"
              style={{ color: '#999999' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <MenuItem icon={LayoutDashboard} label="Dashboard"      path="/" />
          {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && (
            <MenuItem icon={Building2}    label="Escolas"         path="/escolas" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_SECRETARY_PANEL') && (
            <MenuItem icon={Shield}       label="Executivo"       path="/painel-secretario" />
          )}

          <SectionSep label="Operações" />

          {hasPermission(activeProfile?.role, 'VIEW_MENUS') && (
            <MenuItem icon={Utensils}     label="Cardápios"       path="/cardapio" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_STOCK') && (
            <MenuItem icon={Truck}        label="Estoque"         path="/estoque" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
            <MenuItem icon={ShoppingBag}  label="Compras"         path="/pnae" />
          )}

          <SectionSep label="Pedagógico" />

          {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && (
            <MenuItem icon={Heart}        label="Alunos"          path="/alunos" />
          )}
          {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && (
            <MenuItem icon={FileText}     label="Fichas Técnicas" path="/fichas-tecnicas" />
          )}
          {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && (
            <MenuItem icon={Zap}          label="Simulador"       path="/simulador-nutricional" />
          )}

          <SectionSep label="Ferramentas" />

          <MenuItem icon={Sparkles}   label="Inteligência IA"  path="/elaborar"           badge="IA" />
          <MenuItem icon={ShieldCheck} label="Compliance"      path="/conformidade" />
          <MenuItem icon={Award}       label="Transparência"   path="/transparencia-pnae" />
          <MenuItem icon={BarChart3}   label="Cockpit FNDE"    path="/painel-fnde" />

          <SectionSep label="Administração" />

          {hasPermission(activeProfile?.role, 'MANAGE_STAFF') && (
            <MenuItem icon={Users2}   label="Equipe"          path="/merendeiras" />
          )}
          {hasPermission(activeProfile?.role, 'MANAGE_USERS') && (
            <MenuItem icon={Users}    label="Usuários"        path="/usuarios" />
          )}
          <MenuItem icon={Settings}   label="Configurações"   path="/configuracoes" />
        </div>

        {/* Footer */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '0.5px solid #e8e8e6' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
            style={{ color: '#999999', backgroundColor: 'transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff1f2';
              (e.currentTarget as HTMLButtonElement).style.color = '#e11d48';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#999999';
            }}
          >
            <LogOut size={14} />
            <span style={{ fontSize: 11.5, fontWeight: 500 }}>Encerrar sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
