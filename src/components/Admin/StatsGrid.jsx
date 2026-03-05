import React from 'react';
import { Users, Crown, DollarSign, UserMinus, TrendingUp, CreditCard, Activity } from 'lucide-react';

export default function StatsGrid({ metrics, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-white/50 animate-pulse rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                            <div className="h-4 w-20 bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="h-8 w-1/2 bg-gray-100 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    const mainCards = [
        { label: 'Total Usuários', value: metrics.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'PRO Ativos', value: metrics.proUsers, icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { label: 'Receita (30d)', value: `R$ ${((metrics.monthlyRevenue || 0)).toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        { label: 'Churn (Expirados)', value: metrics.churnedUsers, icon: UserMinus, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    ];

    return (
        <div className="mb-8">
            {/* SaaS Top Metrics Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4 bg-white p-6 sm:p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-green-50 rounded-xl">
                            <TrendingUp size={20} className="text-green-500 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">Receita Hoje</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900">R$ {((metrics.revenueToday || 0)).toFixed(2)}</p>
                </div>

                <div className="hidden sm:block w-px h-12 bg-gray-100"></div>
                <div className="sm:hidden h-px w-full bg-gray-50 border-t border-dashed border-gray-100"></div>

                <div className="flex items-center justify-between sm:justify-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-purple-50 rounded-xl">
                            <CreditCard size={20} className="text-purple-500 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">MRR</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900">R$ {((metrics.mrr || 0)).toFixed(2)}</p>
                </div>

                <div className="hidden sm:block w-px h-12 bg-gray-100"></div>
                <div className="sm:hidden h-px w-full bg-gray-50 border-t border-dashed border-gray-100"></div>

                <div className="flex items-center justify-between sm:justify-end gap-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-pink-50 rounded-xl">
                            <Activity size={20} className="text-pink-500 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest text-left">ARPU</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 text-right">R$ {((metrics.arpu || 0)).toFixed(2)}</p>
                </div>
            </div>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mainCards.map((stat, i) => (
                    <div
                        key={i}
                        className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-shadow group flex flex-col justify-between min-h-[140px]`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-gray-500 font-bold text-sm tracking-wide">{stat.label}</h3>
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
