import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'flat' | 'outlined' | 'glass' | 'gradient' | 'neo' | 'governance';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'elevated', padding = 'md', children, ...props }, ref) => {

        const variants = {
            elevated: 'bg-white border border-surface-200 shadow-sm hover:shadow-md hover:-translate-y-[2px]',
            flat: 'bg-surface-50 border border-surface-200',
            outlined: 'bg-transparent border border-surface-200',
            glass: 'bg-white/90 backdrop-blur-sm border border-emerald-900/10 shadow-sm', // Minimal glass
            gradient: 'bg-gradient-to-br from-white to-surface-50 border border-emerald-900/10 shadow-sm',
            neo: 'bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(2,44,34,1)]',
            governance: 'bg-white border border-emerald-900/20 shadow-none rounded-[2px]' // New Strict Authority Variant
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8'
        };

        return (
            <div
                ref={ref}
                className={`rounded-2xl transition-all duration-300 ease-out ${variants[variant]} ${paddings[padding]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={`font-semibold leading-none tracking-tight text-slate-900 ${className}`} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
);
