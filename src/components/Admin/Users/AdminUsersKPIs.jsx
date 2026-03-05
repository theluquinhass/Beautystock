import React from 'react';
import { Users, Crown, AlertTriangle, UserX } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function AdminUsersKPIs({ kpis, activeFilter, onKpiClick }) {
    const cards = [
        {
            id: 'all',
            label: 'Total Usuários',
            value: kpis.total,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            id: 'pro',
            label: 'PRO Ativos',
            value: kpis.pro,
            icon: Crown,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            borderColor: 'border-pink-200'
        },
        {
            id: 'expiring',
            label: 'Vencem em 7 Dias',
            value: kpis.expiringSoon,
            icon: AlertTriangle,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        {
            id: 'expired',
            label: 'Expirados',
            value: kpis.expired,
            icon: UserX,
            color: 'text-red-600',
            bg: 'bg-red-50',
            borderColor: 'border-red-200'
        },
    ];

    return (
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar snap-x snap-mandatory">
            <div className="flex sm:grid sm:grid-cols-4 gap-4 w-max sm:w-full min-w-[300px]">
                {cards.map((card) => {
                    const isActive = activeFilter === card.id;

                    return (
                        <button
                            key={card.id}
                            onClick={() => onKpiClick(card.id)}
                            className={cn(
                                "snap-center shrink-0 w-[200px] sm:w-auto text-left relative overflow-hidden transition-all duration-200 group p-4 sm:p-5 rounded-2xl border shadow-sm",
                                isActive
                                    ? `bg-white shadow-md border-b-4 border-b-[${card.color}] ${card.borderColor}`
                                    : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 hover:-translate-y-0.5"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", card.bg)}>
                                    <card.icon size={18} className={card.color} strokeWidth={2.5} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    {card.label}
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className={cn(
                                    "text-2xl sm:text-3xl font-black tracking-tight",
                                    isActive ? "text-gray-900" : "text-gray-800"
                                )}>
                                    {card.value}
                                </span>
                            </div>

                            {/* Active Indicator Bar (Animated) */}
                            {isActive && (
                                <div className={cn("absolute bottom-0 left-0 right-0 h-1", card.bg)} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Add this to your global CSS (index.css) if not present to hide the scrollbar but keep functionality
// .hide-scrollbar::-webkit-scrollbar { display: none; }
// .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
