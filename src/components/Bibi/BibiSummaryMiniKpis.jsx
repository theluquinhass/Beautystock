import React from 'react';
import { AlertTriangle, DollarSign, PackageSearch } from 'lucide-react';

export default function BibiSummaryMiniKpis({ summary }) {
    if (!summary) return null;

    return (
        <div className="grid grid-cols-3 gap-3 mb-4 mt-2">
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                <AlertTriangle size={40} className="absolute -bottom-2 -right-2 text-red-500/10 group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1.5 text-red-600 mb-1 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Críticos</span>
                </div>
                <span className="text-xl font-black text-red-700 leading-none z-10">
                    {summary.criticalRiskCount}
                </span>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-2xl border border-gray-700 flex flex-col justify-center relative overflow-hidden shadow-md">
                <DollarSign size={40} className="absolute -bottom-2 -right-2 text-pink-500/20" />
                <div className="flex items-center gap-1.5 text-gray-400 mb-1 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Risco (R$)</span>
                </div>
                <span className="text-lg font-black text-white leading-none z-10 truncate">
                    {summary.totalLostProfitRisk.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            </div>

            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                <PackageSearch size={40} className="absolute -bottom-2 -right-2 text-purple-500/10 group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1.5 text-purple-600 mb-1 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Parados</span>
                </div>
                <span className="text-xl font-black text-purple-700 leading-none z-10">
                    {summary.deadStockCount}
                </span>
            </div>
        </div>
    );
}
