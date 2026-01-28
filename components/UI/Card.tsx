import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'flat' | 'outlined' | 'glass' | 'gradient' | 'neo' | 'governance';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'elevated', padding = 'md', children, ...props }, ref) => {

        const variants = {
            elevated: 'bg-white border border-stone-200 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.025)] hover:shadow-xl hover:-translate-y-[2px]',
            flat: 'bg-stone-50 border border-stone-200',
            outlined: 'bg-transparent border border-stone-200',
            glass: 'bg-white border border-stone-200 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]',
            gradient: 'bg-gradient-to-br from-white to-stone-50 border border-stone-200 shadow-sm',
            neo: 'bg-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]',
            governance: 'bg-white border border-stone-200 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] rounded-2xl' // New Premium Clean Variant
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
