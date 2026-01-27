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
        <div className="flex flex-col gap-6 mb-10 sm:flex-row sm:items-start sm:justify-between animate-in fade-in duration-700">
            <div className="flex items-center gap-5">

                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-base font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
};
