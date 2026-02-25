import React from 'react';
import { AlertTriangle, TrendingDown, DollarSign, PackageSearch } from 'lucide-react';

export default function BibiSummary({ summary }) {
    if (!summary) return null;

    return (
        <div className="flex flex-col gap-3 mb-2">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💖</span>
                    <h3 className="font-black text-gray-800 text-sm tracking-tight leading-none">
                        Bibi analisou seus últimos {summary.checkedPeriod} dias
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 text-red-600 mb-1">
                            <AlertTriangle size={14} strokeWidth={2.5} />
                            <span className="text-xs font-bold uppercase tracking-wide">Risco Crítico</span>
                        </div>
                        <span className="text-xl font-black text-red-700 leading-none">
                            {summary.criticalRiskCount}
                        </span>
                        <span className="text-[10px] text-red-600/80 font-semibold mt-0.5">
                            &lt; 7 dias
                        </span>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 text-orange-600 mb-1">
                            <TrendingDown size={14} strokeWidth={2.5} />
                            <span className="text-xs font-bold uppercase tracking-wide">Moderado</span>
                        </div>
                        <span className="text-xl font-black text-orange-700 leading-none">
                            {summary.moderateRiskCount}
                        </span>
                        <span className="text-[10px] text-orange-600/80 font-semibold mt-0.5">
                            7 - 15 dias
                        </span>
                    </div>
                </div>

                {summary.totalLostProfitRisk > 0 && (
                    <div className="mt-2 bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-xl shadow-md border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-pink-500/20 p-1.5 rounded-lg">
                                <DollarSign size={16} className="text-pink-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest break-normal leading-tight">Potencial em Risco</span>
                                <span className="text-sm font-black text-white">
                                    {summary.totalLostProfitRisk.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {summary.deadStockCount > 0 && (
                    <div className="mt-2 bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex items-center gap-2">
                        <PackageSearch size={16} className="text-purple-500" />
                        <span className="text-xs font-bold text-purple-700">
                            {summary.deadStockCount} {summary.deadStockCount === 1 ? 'produto parado' : 'produtos parados'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
