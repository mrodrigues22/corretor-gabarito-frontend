import React from 'react';
import { cn } from '../utils';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 shadow-xl', className)}>
        {children}
    </div>
);

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('mb-4 space-y-1.5', className)}>{children}</div>
);

export const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight text-white', className)}>{children}</h3>
);

export const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <p className={cn('text-sm text-slate-400', className)}>{children}</p>
);

export const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('', className)}>{children}</div>
);

export const CardFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('mt-6 flex items-center', className)}>{children}</div>
);
