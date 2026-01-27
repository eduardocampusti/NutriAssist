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
 * Orchestrates Sidebar (Desktop) and Drawer/Topbar (Mobile).
 * Optimized to avoid layout shifts and unnecessary re-renders.
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { letterhead } = usePNAE();
    const { profiles, currentProfileId, setCurrentProfileId, activeProfile } = useUsers();
    const { signOut } = useAuth();

    // Auto-close sidebar on router navigation on mobile
    // This is handled in Sidebar itself now, but good to keep state clean
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
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V6m0 3h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acesso Bloqueado</h2>
                    <p className="text-slate-600 dark:text-slate-400">Seu usuário foi bloqueado temporariamente pelo administrador. Entre em contato com o suporte.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex-col lg:flex-row font-sans">
            {/* MOBILE TOPBAR */}
            <Topbar
                onOpenMenu={() => setIsSidebarOpen(true)}
                logoEmoji={letterhead.logoEmoji}
            />

            {/* SHARED NAVIGATION (SIDEBAR/DRAWER) */}
            <div className="no-print print-hidden shrink-0">
                <Sidebar
                    profiles={profiles}
                    currentProfileId={currentProfileId}
                    onProfileChange={setCurrentProfileId}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onLogout={signOut}
                />
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 lg:pt-0 px-4 py-8 lg:px-8 lg:py-8 print:overflow-visible transition-all duration-300 w-full relative" id="main-content">
                <div className="max-w-7xl mx-auto w-full print:max-w-none print:w-full min-h-[calc(100vh-4rem)] lg:min-h-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AppShell;
