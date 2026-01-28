import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    badge?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    badge,
    actions
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="space-y-1">

                {/* UPPER LABEL / BREADCRUMB */}
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            {badge}
                        </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        SME Digital
                    </span>
                </div>

                {/* TITLE AREA */}
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-500 shadow-sm hidden md:flex">
                            <Icon size={24} strokeWidth={2.5} />
                        </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {title}
                    </h1>
                </div>

                {/* SUBTITLE */}
                {subtitle && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl pl-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* ACTIONS AREA */}
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};
