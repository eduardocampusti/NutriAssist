import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'flat' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'elevated', padding = 'md', children, ...props }, ref) => {

        const variants = {
            elevated: 'bg-white border border-slate-100 shadow-sm hover:shadow-md',
            flat: 'bg-slate-50 border border-slate-100',
            outlined: 'bg-transparent border border-slate-200',
            glass: 'bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl'
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
                className={`rounded-2xl transition-all duration-300 ease-in-out ${variants[variant]} ${paddings[padding]} ${className}`}
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
