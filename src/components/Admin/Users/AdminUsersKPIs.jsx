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
            activeBg: 'bg-blue-600',
            accentLine: 'bg-blue-500',
            borderColor: 'border-blue-200',
        },
        {
            id: 'pro',
            label: 'PRO Ativos',
            value: kpis.pro,
            icon: Crown,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            activeBg: 'bg-amber-500',
            accentLine: 'bg-amber-500',
            borderColor: 'border-amber-200',
        },
        {
            id: 'expiring',
            label: 'Vencem em 7 Dias',
            value: kpis.expiringSoon,
            icon: AlertTriangle,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            activeBg: 'bg-orange-500',
            accentLine: 'bg-orange-500',
            borderColor: 'border-orange-200',
        },
        {
            id: 'expired',
            label: 'Expirados',
            value: kpis.expired,
            icon: UserX,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            activeBg: 'bg-rose-500',
            accentLine: 'bg-rose-500',
            borderColor: 'border-rose-200',
        },
    ];

    return (
        <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-3 sm:pb-0 hide-scrollbar snap-x snap-mandatory">
            <div className="flex sm:grid sm:grid-cols-4 gap-3 w-max sm:w-full">
                {cards.map((card) => {
                    const isActive = activeFilter === card.id;

                    return (
                        <button
                            key={card.id}
                            onClick={() => onKpiClick(card.id)}
                            className={cn(
                                'snap-center shrink-0 w-[180px] sm:w-auto text-left relative overflow-hidden transition-all duration-200 group p-4 sm:p-5 rounded-2xl border shadow-sm',
                                isActive
                                    ? `bg-white ${card.borderColor} shadow-md`
                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
                            )}
                        >
                            {/* Active accent line */}
                            {isActive && <div className={`absolute top-0 left-0 right-0 h-0.5 ${card.accentLine}`} />}

                            <div className="flex items-center gap-2.5 mb-3">
                                <div className={cn(
                                    'p-2 rounded-xl transition-all',
                                    isActive ? `${card.bg} scale-110` : `${card.bg} group-hover:scale-110`
                                )}>
                                    <card.icon size={16} className={card.color} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">
                                    {card.label}
                                </span>
                            </div>

                            <p className={cn(
                                'text-2xl sm:text-3xl font-black tracking-tight',
                                isActive ? card.color : 'text-gray-800'
                            )}>
                                {card.value}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
