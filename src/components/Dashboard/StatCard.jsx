import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export default function StatCard({
    title,
    value,
    subtitle,
    type = 'default',
    icon: Icon,
    onClick
}) {
    const isPrimary = type === 'primary'; // Pink gradient (Proft)
    const isFeatured = type === 'featured'; // Purple/Gold (Receivables) - The most important one
    const isWarning = type === 'warning'; // Red (Low Stock)

    return (
        <Card
            onClick={onClick}
            className={cn(
                "p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-soft",
                // Default: White bg, gray text
                "bg-white",
                // Primary (Profit): Pink Gradient
                isPrimary && "bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200",
                // Featured (Debtors): Lilac/Purple Gradient - Premium feel
                isFeatured && "bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-xl shadow-indigo-200 ring-2 ring-violet-100",
                // Warning: Red tint
                isWarning && "bg-red-50 text-red-900 border border-red-100"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className={cn(
                    "text-sm font-medium uppercase tracking-wider opacity-90",
                    (isPrimary || isFeatured) ? "text-white/90" : "text-gray-500",
                    isWarning && "text-red-700"
                )}>
                    {title}
                </h3>
                {Icon && <Icon className={cn(
                    "w-5 h-5 opacity-80",
                    (isPrimary || isFeatured) ? "text-white" : "text-gray-400",
                    isWarning && "text-red-500"
                )} />}
            </div>

            <div className="mt-auto">
                <div className={cn(
                    "font-bold tracking-tight leading-none",
                    // Featured cards have HUGE numbers
                    isFeatured ? "text-3xl" : "text-2xl",
                    (isPrimary || isFeatured) ? "text-white" : "text-gray-900",
                    isWarning && "text-red-700"
                )}>
                    {value}
                </div>

                {subtitle && (
                    <p className={cn(
                        "text-xs mt-1 font-medium",
                        (isPrimary || isFeatured) ? "text-white/80" : "text-gray-400",
                        isWarning && "text-red-600"
                    )}>
                        {subtitle}
                    </p>
                )}
            </div>
        </Card>
    );
}
