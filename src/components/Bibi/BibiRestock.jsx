import React, { useState } from 'react';
import { ShoppingBag, TrendingDown, Clock, Check, Plus, Copy, Send, Download } from 'lucide-react';
import { generateBuyListText, exportToCSV } from './bibiUtils';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export default function BibiRestock({ alerts, strategyDays, shoppingList, onToggleList }) {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 pt-10">
                <ShoppingBag size={40} className="mb-4 text-emerald-300" strokeWidth={1.5} />
                <p className="text-base font-bold text-gray-600 text-center">Estoque Saudável!</p>
                <p className="text-sm text-center mt-2 px-4">Nenhum produto com risco de falta para a estratégia de {strategyDays} dias.</p>
            </div>
        );
    }

    // Removed internal handleToggleList logic as it's lifted

    const handleCopy = () => {
        if (shoppingList.length === 0) {
            toast.error("Adicione itens à lista primeiro.");
            return;
        }
        const text = generateBuyListText(shoppingList);
        navigator.clipboard.writeText(text);
        toast.success("Lista copiada!");
    };

    const handleExport = () => {
        if (shoppingList.length === 0) {
            toast.error("Adicione itens à lista primeiro.");
            return;
        }
        exportToCSV(shoppingList);
        toast.success("CSV gerado!");
    };

    const handleWhatsApp = () => {
        if (shoppingList.length === 0) {
            toast.error("Adicione itens à lista primeiro.");
            return;
        }
        const text = generateBuyListText(shoppingList);
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    return (
        <div className="flex flex-col gap-3 pb-20">
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                    onClick={handleCopy}
                    className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="bg-gray-50 text-gray-600 p-1.5 rounded-lg group-hover:bg-gray-100 transition-colors relative">
                        <Copy size={16} />
                        {shoppingList.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white" />}
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">Copiar</span>
                </button>
                <button
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Download size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">CSV</span>
                </button>
                <button
                    onClick={handleWhatsApp}
                    className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                        <Send size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">WhatsApp</span>
                </button>
            </div>

            {alerts.map((item, idx) => {
                const isInList = shoppingList.some(i => i.id === item.id);

                let badgeOptions;
                let barColor;
                // Critico < 5, Atenção 5-10, Alerta 10-15
                if (item.days_remaining < 5) {
                    badgeOptions = { label: '🔥 Crítico', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
                    barColor = 'bg-red-500';
                } else if (item.days_remaining <= 10) {
                    badgeOptions = { label: '⚠️ Atenção', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
                    barColor = 'bg-orange-500';
                } else {
                    badgeOptions = { label: '🟡 Alerta', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
                    barColor = 'bg-yellow-500';
                }

                const stockPercentage = Math.min((item.days_remaining / strategyDays) * 100, 100);

                return (
                    <div key={item.id || idx} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-soft transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2 flex-1">{item.product_name}</h4>
                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border ${badgeOptions.bg} ${badgeOptions.text} ${badgeOptions.border}`}>
                                {badgeOptions.label}
                            </div>
                        </div>

                        {/* Stock Bar Visual */}
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                <span>Estoque {item.stock} un</span>
                                <span>Meta {strategyDays} dias</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${barColor} transition-all duration-500 ease-out`}
                                    style={{ width: `${stockPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100 grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Venda Média</span>
                                <span className="text-xs font-black text-gray-800">{item.avg_daily_sales.toFixed(1)}/dia</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Previsão Fim</span>
                                <span className="text-xs font-black text-gray-800">{Math.floor(item.days_remaining)} dias</span>
                            </div>

                            {item.estimated_lost_profit > 0 && (
                                <div className="col-span-2 pt-2 mt-1 border-t border-gray-200 flex flex-col">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 flex items-center gap-1">
                                        Risco de Prejuízo
                                    </span>
                                    <span className="text-xs font-black text-red-600">
                                        Perder {item.estimated_lost_profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleToggleList(item)}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border",
                                isInList
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            )}
                        >
                            {isInList ? (
                                <>
                                    <Check size={14} /> Na lista ({item.suggested_qty} un)
                                </>
                            ) : (
                                <>
                                    <Plus size={14} /> Adicionar à lista ({item.suggested_qty} un)
                                </>
                            )}
                        </button>
                    </div>
                )
            })}
        </div>
    );
}
