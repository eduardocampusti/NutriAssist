import React from 'react';
import { Menu, Bell, Search, ChevronDown, Camera } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../UI/Button';
import { useUsers } from '../../contexts/UserContext';

interface TopbarProps {
    onOpenMenu: () => void;
    logoEmoji?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMenu }) => {
    const location = useLocation();
    const { activeProfile } = useUsers();
    const firstName = activeProfile?.nome?.split(' ')[0] || 'Usuário';
    const nameParts = activeProfile?.nome?.split(' ') || [];
    const initials = nameParts.slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'U';
    const role = activeProfile?.role || 'Admin';

    const isHome = location.pathname === '/';

    const getPageLabel = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        const segment = path.split('/')[1];
        if (!segment) return 'Dashboard';
        return segment.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const today = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: '#fff',
            borderBottom: '1px solid #f1f5f9',
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}>
            {/* LINHA SUPERIOR: breadcrumb + ações */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', height: 52,
                borderBottom: isHome ? '1px solid #f1f5f9' : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button variant="ghost" size="icon" onClick={onOpenMenu}
                        className="lg:hidden -ml-2 text-slate-500 hover:text-slate-700">
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                        <span>Início</span>
                        <span style={{ color: '#cbd5e1' }}>/</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>{getPageLabel()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: 10, padding: '0 14px', height: 34, minWidth: 180,
                    }}>
                        <Search style={{ width: 14, height: 14, color: '#94a3b8' }} />
                        <input type="text" placeholder="Buscar..." style={{
                            border: 'none', outline: 'none', background: 'transparent',
                            fontSize: 13, color: '#0f172a', fontFamily: 'inherit', width: 120,
                        }} />
                    </div>

                    <button style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#64748b',
                    }}>
                        <Camera style={{ width: 15, height: 15 }} />
                    </button>

                    <div style={{ position: 'relative' }}>
                        <button style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#64748b',
                        }}>
                            <Bell style={{ width: 15, height: 15 }} />
                        </button>
                        <span style={{
                            position: 'absolute', top: -4, right: -4,
                            width: 17, height: 17, borderRadius: '50%',
                            background: '#ef4444', color: '#fff',
                            fontSize: 8, fontWeight: 900,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 0 2px #fff',
                        }}>3</span>
                    </div>

                    <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#22c55e,#15803d)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 900, color: '#fff',
                            boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
                        }}>{initials}</div>
                        <ChevronDown style={{ width: 13, height: 13, color: '#94a3b8' }} />
                    </div>
                </div>
            </div>

            {/* BLOCO DE BOAS-VINDAS — só na home */}
            {isHome && (
                <div style={{
                    padding: '14px 24px',
                    background: 'linear-gradient(100deg, #f0fdf4 0%, #ffffff 65%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                            background: 'linear-gradient(135deg,#22c55e 0%,#15803d 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 17, fontWeight: 900, color: '#fff',
                            boxShadow: '0 4px 16px rgba(34,197,94,0.40), 0 1px 4px rgba(0,0,0,0.08)',
                        }}>{initials}</div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                <span style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                                    Olá, {firstName} 👋
                                </span>
                                <span style={{
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    color: '#15803d', fontSize: 9, fontWeight: 800,
                                    padding: '2px 8px', borderRadius: 6,
                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                }}>{role}</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                {todayCapitalized} · Bem-vindo ao sistema de gestão PNAE
                            </p>
                        </div>
                    </div>

                    {/* Status pill */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 10, padding: '7px 14px',
                        boxShadow: '0 1px 4px rgba(34,197,94,0.12)',
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
                            display: 'inline-block', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>Sistema operacional</span>
                    </div>
                </div>
            )}
        </header>
    );
};
