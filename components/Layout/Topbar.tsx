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
    const firstName = activeProfile?.nome?.split(' ')[0] || 'Nutricionista';

    const nameParts = activeProfile?.nome?.split(' ') || [];
    const initials = nameParts.slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Resumo Executivo';
        const segment = path.split('/')[1];
        if (!segment) return 'Dashboard';
        return segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <header
            className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between bg-white px-4 lg:px-6"
            style={{ borderBottom: '1px solid #f1f5f9' }}
        >
            {/* LEFT: BREADCRUMBS & GREETING */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenMenu}
                    className="lg:hidden -ml-2 text-slate-500 hover:text-slate-700"
                >
                    <Menu className="w-5 h-5" />
                </Button>

                <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        <span>Início</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-emerald-600 font-bold">Dashboard</span>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-500 mt-0.5">
                        Olá, {firstName}. Bem-vindo ao sistema de gestão.
                    </p>
                </div>
            </div>

            {/* RIGHT: SEARCH & ACTIONS */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden lg:flex items-center relative">
                    <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar"
                        className="h-10 w-[240px] pl-11 pr-4 rounded-xl text-[13px] font-bold outline-none transition-all placeholder:text-slate-400 text-slate-700 bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#1D9E75] focus:shadow-sm"
                    />
                </div>

                {/* Camera */}
                <button
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                    style={{ border: '1px solid #eeecea' }}
                    title="Digitalizar documento"
                >
                    <Camera className="w-4 h-4" />
                </button>

                {/* Bell with red badge */}
                <div className="relative">
                    <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                        style={{ border: '1px solid #eeecea' }}
                    >
                        <Bell className="w-4 h-4" />
                    </button>
                    <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center shadow-sm">
                        3
                    </span>
                </div>

                <div className="w-px h-5 hidden sm:block mx-0.5" style={{ backgroundColor: '#eeecea' }} />

                {/* Avatar + chevron */}
                <div className="hidden sm:flex items-center gap-1 cursor-pointer group pl-1">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black"
                        style={{ background: 'linear-gradient(135deg, #1D9E75, #0d4f2e)' }}
                    >
                        {initials}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
            </div>
        </header>
    );
};
