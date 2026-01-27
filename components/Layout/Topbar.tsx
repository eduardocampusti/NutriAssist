import React from 'react';
import { Menu, Bell } from 'lucide-react';
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
        if (path === '/') return 'Dashboard';
        const segment = path.split('/')[1];
        if (!segment) return 'Dashboard';
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-30 px-4 flex items-center justify-between lg:hidden print:hidden transition-all duration-300">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenMenu}
                    className="-ml-2 text-slate-600 dark:text-slate-300"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </Button>

                <div className="flex items-center gap-2">
                    <span className="text-xl filter drop-shadow-sm">{logoEmoji || '🥗'}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase truncate max-w-[200px]">
                        {getPageTitle()}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-500 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                </Button>
            </div>
        </header>
    );
};
