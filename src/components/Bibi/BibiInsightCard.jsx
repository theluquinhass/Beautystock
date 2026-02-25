import React, { useState } from 'react';
import { TrendingDown, Clock, Check, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BibiInsightCard({ item, strategyDays, isInList, onToggleList }) {
    const [isExpanded, setIsExpanded] = useState(false);

    let badgeOptions;
    let barColor;
    if (item.days_remaining < 5) {
        badgeOptions = { label: '🔥 Crítico', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        barColor = 'bg-red-500';
    } else if (item.days_remaining <= 10) {
        badgeOptions = { label: '⚠️ Atenção', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
        barColor = 'bg-orange-500';
    } else {
        badgeOptions = { label: '🟡 Alerta', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
        barColor = 'bg-yellow-500';
    }

    const stockPercentage = Math.min((item.days_remaining / strategyDays) * 100, 100);

    return (
        <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-soft transition-all hover:shadow-md mb-3">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2 flex-1 truncate">{item.product_name}</h4>
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border ${badgeOptions.bg} ${badgeOptions.text} ${badgeOptions.border} shadow-sm`}>
                    {badgeOptions.label}
                </div>
            </div>

            {/* Visual Stock Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5">
                    <span>Estoque: {item.stock} un</span>
                    <span>Meta: {strategyDays} dias</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${barColor} transition-all duration-500 ease-out`}
                        style={{ width: `${stockPercentage}%` }}
                    />
                </div>
            </div>

            {/* Quick Metrics Line */}
            <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <Clock size={12} className="text-gray-400" />
                    Vende <span className="font-bold text-gray-800">{item.avg_daily_sales.toFixed(1)}/dia</span>
                    <span className="text-gray-300">•</span>
                    Acaba em <span className="font-bold text-gray-800">{Math.floor(item.days_remaining)}d</span>
                </div>
            </div>

            {/* Impact Line */}
            {item.estimated_lost_profit > 0 && (
                <div className="mt-1.5 text-[11px] text-gray-500">
                    <span className="text-red-500 font-bold uppercase tracking-wide">Risco:</span> Perder {item.estimated_lost_profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em lucro
                </div>
            )}

            {/* Expanded Content (Accordion) */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out overflow-hidden mt-3",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 mt-0"
            )}>
                <div className="min-h-0">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 grid grid-cols-2 gap-3 mb-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Vendido</span>
                            <span className="text-xs font-black text-gray-800">{Math.round(item.avg_daily_sales * 30)} un / 30d</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Margem unitária</span>
                            <span className="text-xs font-black text-gray-800">{item.margin?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-gray-200 flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-1">
                                Cálculo de Recomendação
                            </span>
                            <span className="text-[11px] font-medium text-gray-600">
                                ({item.avg_daily_sales.toFixed(1)} un/dia × {strategyDays} dias) - {item.stock} estoque = <span className="font-black text-emerald-600">{item.suggested_qty} un</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                    onClick={() => onToggleList(item)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border",
                        isInList
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                >
                    {isInList ? (
                        <>
                            <Check size={14} /> Na lista ({item.suggested_qty})
                        </>
                    ) : (
                        <>
                            <Plus size={14} /> Lista de compra ({item.suggested_qty})
                        </>
                    )}
                </button>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex shrink-0 items-center justify-center py-2 px-3 rounded-xl text-xs font-bold bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all border"
                >
                    Detalhes
                    <ChevronDown size={14} className={cn("ml-1 transition-transform", isExpanded && "rotate-180")} />
                </button>
            </div>
        </div>
    );
}
