import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { usePNAE } from '../../contexts/PNAEContext';
import { useUsers } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';

interface AppShellProps {
    children: React.ReactNode;
}

/**
 * Global App Shell.
 * Layout: 
 * - Fixed Sidebar (Desktop) / Drawer (Mobile)
 * - Sticky Topbar
 * - Scrollable Main Content
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { letterhead } = usePNAE();
    const { profiles, currentProfileId, setCurrentProfileId, activeProfile } = useUsers();
    const { signOut } = useAuth();

    // Auto-close sidebar on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (activeProfile?.bloqueado) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] px-6">
                <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-900/50">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V6m0 3h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Acesso Bloqueado</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Seu usuário foi bloqueado temporariamente pelo administrador. Entre em contato com o departamento de tecnologia.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden font-inter text-slate-900 dark:text-slate-100 transition-colors duration-500">

            {/* NAVIGATION (SIDEBAR) */}
            <Sidebar
                profiles={profiles}
                currentProfileId={currentProfileId}
                onProfileChange={setCurrentProfileId}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={signOut}
            />

            {/* MAIN AREA */}
            <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">

                {/* TOPBAR */}
                <Topbar
                    onOpenMenu={() => setIsSidebarOpen(true)}
                    logoEmoji={letterhead.logoEmoji}
                />

                {/* SCROLLABLE CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar relative">
                    {/* Background Noise/Gradient Overlay (Global) */}
                    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
                    </div>

                    <div className="max-w-[1600px] mx-auto w-full relative z-10 pb-20 animate-in fade-in zoom-in-95 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppShell;
