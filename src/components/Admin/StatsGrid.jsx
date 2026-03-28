import React from 'react';
import { Users, Crown, DollarSign, UserMinus, TrendingUp, CreditCard, Activity } from 'lucide-react';

export default function StatsGrid({ metrics, loading }) {
    if (loading) {
        return (
            <div className="mb-8 space-y-4">
                <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse rounded-3xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const mainCards = [
        {
            label: 'Total Usuários',
            value: metrics.totalUsers,
            icon: Users,
            iconColor: 'text-blue-600',
            bg: 'bg-blue-50',
            accentBg: 'from-blue-500/10 to-blue-500/0',
            accentLine: 'bg-blue-500',
            valueColor: 'text-blue-700',
        },
        {
            label: 'PRO Ativos',
            value: metrics.proUsers,
            icon: Crown,
            iconColor: 'text-amber-600',
            bg: 'bg-amber-50',
            accentBg: 'from-amber-500/10 to-amber-500/0',
            accentLine: 'bg-amber-500',
            valueColor: 'text-amber-700',
        },
        {
            label: 'Receita (30d)',
            value: `R$ ${(metrics.monthlyRevenue || 0).toFixed(2)}`,
            icon: DollarSign,
            iconColor: 'text-emerald-600',
            bg: 'bg-emerald-50',
            accentBg: 'from-emerald-500/10 to-emerald-500/0',
            accentLine: 'bg-emerald-500',
            valueColor: 'text-emerald-700',
        },
        {
            label: 'Churn (Expirados)',
            value: metrics.churnedUsers,
            icon: UserMinus,
            iconColor: 'text-rose-600',
            bg: 'bg-rose-50',
            accentBg: 'from-rose-500/10 to-rose-500/0',
            accentLine: 'bg-rose-500',
            valueColor: 'text-rose-700',
        },
    ];

    const quickStats = [
        { label: 'Receita Hoje', value: `R$ ${(metrics.revenueToday || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'MRR', value: `R$ ${(metrics.mrr || 0).toFixed(2)}`, icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'ARPU', value: `R$ ${(metrics.arpu || 0).toFixed(2)}`, icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
    ];

    return (
        <div className="mb-8">
            {/* Top Quick Stats Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                    {quickStats.map((stat, i) => (
                        <div key={i} className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                            <div className={`p-2 rounded-xl shrink-0 ${stat.bg}`}>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-lg font-black text-gray-900 leading-none">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mainCards.map((stat, i) => (
                    <div
                        key={i}
                        className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden flex flex-col justify-between min-h-[140px]"
                    >
                        {/* Subtle gradient accent top */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${stat.accentLine} opacity-70`} />
                        {/* Radial bg glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.accentBg} rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`} />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform`}>
                                <stat.icon className={stat.iconColor} size={22} strokeWidth={2} />
                            </div>
                            <h3 className="text-gray-500 font-bold text-xs tracking-wide uppercase">{stat.label}</h3>
                        </div>

                        <div className="mt-4 relative z-10">
                            <p className={`text-3xl font-black tracking-tight ${stat.valueColor}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
