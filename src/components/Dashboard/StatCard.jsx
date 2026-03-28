import { memo } from 'react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

const StatCard = memo(function StatCard({
    title,
    value,
    subtitle,
    type = 'default',
    icon: Icon,
    onClick
}) {
    const isPrimary = type === 'primary';   // Pink gradient — Lucro
    const isFeatured = type === 'featured'; // Purple gradient — Total a Receber
    const isWarning = type === 'warning';   // Red tint — Estoque Baixo
    const isSuccess = type === 'success';   // Green gradient — Recebido
    const isDefault = !isPrimary && !isFeatured && !isWarning && !isSuccess;

    return (
        <Card
            onClick={onClick}
            className={cn(
                // Base
                "p-5 flex flex-col justify-between transition-all duration-200",
                "border-0 rounded-2xl select-none",
                onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.99]",

                // Default — usa bg-card do tema
                isDefault && "bg-card shadow-soft hover:shadow-card-hover",

                // Primary — Pink gradient (Lucro)
                isPrimary && [
                    "bg-gradient-to-br from-pink-500 to-rose-500 text-white",
                    "shadow-[0_8px_24px_-4px_rgba(236,72,153,0.45)]",
                    "hover:shadow-[0_12px_32px_-4px_rgba(236,72,153,0.55)]",
                    "dark:shadow-[0_8px_24px_-4px_rgba(244,114,182,0.3)]",
                ],

                // Featured — Purple/Violet gradient (Total a Receber)
                isFeatured && [
                    "bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-500 text-white",
                    "shadow-[0_8px_28px_-4px_rgba(124,58,237,0.5)]",
                    "hover:shadow-[0_12px_36px_-4px_rgba(124,58,237,0.6)]",
                    "dark:shadow-[0_8px_28px_-4px_rgba(167,139,250,0.25)]",
                    "ring-1 ring-white/10",
                ],

                // Warning — Low stock
                isWarning && [
                    "bg-destructive/8 dark:bg-destructive/15",
                    "border border-destructive/20 dark:border-destructive/30",
                    "shadow-[0_4px_16px_-4px_rgba(239,68,68,0.15)]",
                ],

                // Success — Green gradient (Caixa)
                isSuccess && [
                    "bg-gradient-to-br from-emerald-500 to-green-600 text-white",
                    "shadow-[0_8px_24px_-4px_rgba(16,185,129,0.45)]",
                    "hover:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.55)]",
                    "dark:shadow-[0_8px_24px_-4px_rgba(52,211,153,0.3)]",
                ]
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    (isPrimary || isFeatured || isSuccess) ? "text-white/80" : "",
                    isDefault && "text-muted-foreground",
                    isWarning && "text-destructive/80 dark:text-destructive/90"
                )}>
                    {title}
                </h3>
                {Icon && (
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center",
                        (isPrimary || isFeatured || isSuccess) ? "bg-white/15" : "",
                        isDefault && "bg-muted",
                        isWarning && "bg-destructive/10"
                    )}>
                        <Icon className={cn(
                            "w-4 h-4",
                            (isPrimary || isFeatured || isSuccess) ? "text-white" : "text-muted-foreground",
                            isWarning && "text-destructive"
                        )} />
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="mt-auto">
                <div className={cn(
                    "font-black tracking-tight leading-none",
                    isFeatured ? "text-3xl" : "text-2xl",
                    (isPrimary || isFeatured || isSuccess) ? "text-white" : "text-foreground",
                    isWarning && "text-destructive"
                )}>
                    {value}
                </div>

                {subtitle && (
                    <p className={cn(
                        "text-xs mt-1.5 font-medium",
                        (isPrimary || isFeatured || isSuccess) ? "text-white/70" : "text-muted-foreground",
                        isWarning && "text-destructive/70"
                    )}>
                        {subtitle}
                    </p>
                )}
            </div>
        </Card>
    );
});

export default StatCard;