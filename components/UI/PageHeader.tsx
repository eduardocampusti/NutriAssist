import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
}

/**
 * Consistent Header for all dashboard pages.
 * Handles responsive spacing and primary actions.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    actions,
    icon
}) => {
    return (
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                {icon && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/10">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-2 sm:gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};
