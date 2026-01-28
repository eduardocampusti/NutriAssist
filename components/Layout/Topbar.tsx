import React from 'react';
import { Menu, Bell, Moon, Sun, Search, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../UI/Button';

interface TopbarProps {
    onOpenMenu: () => void;
    logoEmoji?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMenu, logoEmoji }) => {
    const location = useLocation();

    // Basic breadcrumb / title resolver
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Visão Geral';
        const segment = path.split('/')[1];
        if (!segment) return 'Dashboard';
        return segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl transition-all dark:border-slate-800 dark:bg-[#0B1121]/80 print:hidden lg:px-8">

            {/* LEFT: MOBILE MENU & BREADCRUMB */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenMenu}
                    className="lg:hidden -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <Menu className="w-6 h-6" />
                </Button>

                <div className="hidden md:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity">Sistema</span>
                    <span className="mx-2 opacity-30">/</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize tracking-tight">{getPageTitle()}</span>
                </div>

                {/* Mobile Title */}
                <span className="md:hidden font-bold text-slate-900 dark:text-white text-lg capitalize">{getPageTitle()}</span>
            </div>


            {/* RIGHT: GLOBAL ACTIONS */}
            <div className="flex items-center gap-2">

                {/* Search - Desktop Only */}
                <div className="hidden lg:flex items-center relative mr-2">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden lg:block"></div>

                <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </Button>

            </div>
        </header>
    );
};
