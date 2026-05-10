import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../../types';
import {
  Sparkles, FileText, Utensils, ShoppingBag, Truck,
  Users, Settings, Shield, ShieldCheck,
  X, Building2, Award, LayoutDashboard, Zap, BarChart3, LogOut, Heart, Info, BookOpen, ScrollText
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
        className="w-full flex items-center justify-between outline-none text-left"
        style={{
          padding: '7px 12px',
          backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
          fontWeight: isActive ? 600 : 400,
          borderRadius: '9px',
          margin: '1px 6px',
          width: 'calc(100% - 12px)',
          transition: 'all 0.15s ease',
          boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.15)' : 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon style={{
            width: 15, height: 15, flexShrink: 0,
            color: isActive ? '#4ade80' : 'rgba(255,255,255,0.38)',
            transition: 'color 0.15s',
          }} />
          <span style={{ fontSize: 12.5, letterSpacing: '-0.01em' }}>{label}</span>
        </div>
        {badge && (
          <span style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 6,
            fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
            background: badge === 'IA' ? 'rgba(74,222,128,0.15)' : 'rgba(251,113,133,0.2)',
            color: badge === 'IA' ? '#4ade80' : '#fb7185',
            border: badge === 'IA' ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(251,113,133,0.3)',
          }}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionSep = ({ label }: { label: string }) => (
    <div style={{ padding: '16px 18px 5px' }}>
      <span style={{
        fontSize: 9.5, color: 'rgba(255,255,255,0.3)',
        fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
      }}>
        {label}
      </span>
    </div>
  );

  const initials = (activeProfile?.nome || 'U').substring(0, 2).toUpperCase();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
        style={{
          background: 'linear-gradient(170deg, #062b18 0%, #0a3d24 40%, #0d5232 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Detalhe decorativo */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(74,222,128,0.04)', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '18px 16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div style={{
              width: 33, height: 33, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(34,197,94,0.4)',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 17 }}>N</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>NUTRIASSIST</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.06em' }}>v{APP_VERSION}</span>
              </div>
              <span style={{ fontSize: 9, color: '#4ade80', fontWeight: 700, letterSpacing: '0.03em' }}>TECNOLOGIA PNAE</span>
            </div>
            <button onClick={onClose} className="lg:hidden"
              style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '10px 0' }}>
          <div style={{ padding: '0 6px' }}>
            <MenuItem icon={LayoutDashboard} label="Dashboard" path="/" />
          </div>

          <SectionSep label="Gestão" />
          <div style={{ padding: '0 6px' }}>
            {hasPermission(activeProfile?.role, 'MANAGE_SCHOOLS') && (
              <MenuItem icon={Building2} label="Escolas" path="/escolas" />
            )}
            {hasPermission(activeProfile?.role, 'VIEW_SECRETARY_PANEL') && (
              <MenuItem icon={Shield} label="Executivo" path="/painel-secretario" />
            )}
          </div>

          <SectionSep label="Operacional" />
          <div style={{ padding: '0 6px' }}>
            {hasPermission(activeProfile?.role, 'VIEW_MENUS') && (
              <MenuItem icon={Utensils} label="Cardápios" path="/cardapio" />
            )}
            {hasPermission(activeProfile?.role, 'VIEW_STOCK') && (
              <MenuItem icon={Truck} label="Estoque" path="/estoque" />
            )}
            {hasPermission(activeProfile?.role, 'VIEW_PROCUREMENT') && (
              <MenuItem icon={ShoppingBag} label="Compras" path="/pnae" />
            )}
          </div>

          <SectionSep label="Nutricional" />
          <div style={{ padding: '0 6px' }}>
            {hasPermission(activeProfile?.role, 'VIEW_STUDENTS_SENSITIVE') && (
              <MenuItem icon={Heart} label="Alunos" path="/alunos" />
            )}
            {hasPermission(activeProfile?.role, 'VIEW_REPORTS_TECHNICAL') && (
              <MenuItem icon={FileText} label="Fichas Técnicas" path="/fichas-tecnicas" />
            )}
            {hasPermission(activeProfile?.role, 'USE_NUTRITIONAL_SIMULATOR') && (
              <MenuItem icon={Zap} label="Simulador" path="/simulador-nutricional" />
            )}
          </div>

          <SectionSep label="Governança" />
          <div style={{ padding: '0 6px' }}>
            <MenuItem icon={Sparkles} label="Inteligência IA" path="/elaborar" badge="IA" />
            <MenuItem icon={ShieldCheck} label="Compliance" path="/conformidade" />
            <MenuItem icon={Award} label="Transparência" path="/transparencia-pnae" />
            <MenuItem icon={BarChart3} label="Cockpit FNDE" path="/painel-fnde" />
          </div>

          <div style={{ margin: '14px 16px 10px', height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ padding: '0 6px' }}>
            <MenuItem icon={Settings} label="Configurações" path="/configuracoes" />
            {hasPermission(activeProfile?.role, 'MANAGE_USERS') && (
              <MenuItem icon={Users} label="Usuários" path="/usuarios" />
            )}
            {hasPermission(activeProfile?.role, 'VIEW_LOGS') && (
              <MenuItem icon={ScrollText} label="Logs do Sistema" path="/logs" />
            )}
            <MenuItem icon={BookOpen} label="Manual do Usuário" path="/manual" />
            <MenuItem icon={Info} label="Sobre o Sistema" path="/sobre" />
          </div>
        </div>

        {/* Footer — usuário + logout */}
        <div style={{
          padding: '12px 14px', flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <div style={{
              width: 31, height: 31, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
              boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeProfile?.nome || 'Usuário'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
                {activeProfile?.role || 'Perfil'}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,113,133,0.12)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fb7185';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <LogOut size={14} />
            Encerrar Sessão
          </button>
        </div>
      </aside>
    </>
  );
};
