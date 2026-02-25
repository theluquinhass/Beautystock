import React from 'react';
import { Sparkles, X, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import BibiSummary from './BibiSummary';
import BibiRestock from './BibiRestock';
import BibiDeadStock from './BibiDeadStock';
import BibiTopProducts from './BibiTopProducts';
import BibiFilters from './BibiFilters';
import BibiTabs from './BibiTabs';

export default function BibiPanelMobile({
    isOpen, onClose, isPro, loading, activeTab, setActiveTab,
    periodDays, setPeriodDays, strategyDays, setStrategyDays, sortBy, setSortBy,
    insights, sortedRestockAlerts, shoppingList, toggleList
}) {
    // Only render on mobile (handled by BibiPanel wrappers usually, but good practice)
    return (
        <div className={cn(
            "fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pointer-events-none lg:hidden",
            !isOpen && "hidden"
        )}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={cn(
                "bg-white w-full max-w-sm sm:w-96 rounded-[32px] shadow-2xl pointer-events-auto flex flex-col relative overflow-hidden transition-all duration-300 border border-gray-100",
                "h-[85vh] sm:h-[650px] mb-0 sm:mb-4 sm:fixed sm:bottom-20 sm:right-6",
                "animate-in slide-in-from-bottom-8 fade-in sm:slide-in-from-bottom-12 sm:zoom-in-95"
            )}>
                {/* Header background soft decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-pink-100 rounded-full blur-[40px] -mr-16 -mt-20 pointer-events-none" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center gap-4 relative z-10 flex-shrink-0">
                    <div className="p-2.5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-md shadow-pink-200">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-none">Bibi</h2>
                        <p className="text-xs text-gray-500 font-bold tracking-wide mt-1 uppercase">Consultora de Estoque</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col relative z-10 overflow-hidden bg-gray-50/30 rounded-t-3xl border-t border-gray-100">
                    <BibiTabs activeTab={activeTab} setActiveTab={setActiveTab} isPro={isPro} isDesktop={false} />

                    <div className="flex-1 overflow-y-auto p-4 no-scrollbar relative">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-pink-300 space-y-4 pt-10">
                                <Sparkles size={32} className="animate-pulse" />
                                <span className="text-sm font-medium animate-pulse">Bibi está pensando...</span>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'resumo' && (
                                    <>
                                        <BibiSummary summary={insights.summary} />

                                        {!isPro && (
                                            <div className="mt-4 bg-gradient-to-br from-pink-500 to-rose-500 p-5 rounded-2xl shadow-xl shadow-pink-500/20 text-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 -mr-4 -mt-4 text-white opacity-20">
                                                    <Sparkles size={64} />
                                                </div>
                                                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                                                    <Lock className="text-white" size={24} />
                                                </div>
                                                <h3 className="text-white font-black text-lg leading-tight mb-2">Bibi completa é exclusiva do plano PRO</h3>
                                                <p className="text-pink-50 text-xs font-semibold mb-4 leading-relaxed">
                                                    Desbloqueie listas de compras inteligentes pelo WhatsApp, produtos parados e descubra seus campeões de lucro.
                                                </p>
                                                <a
                                                    href="/conta"
                                                    className="inline-block bg-white text-pink-600 font-bold text-sm py-2.5 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                                >
                                                    Desbloquear PRO
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'restock' && isPro && (
                                    <>
                                        <BibiFilters
                                            periodDays={periodDays} setPeriodDays={setPeriodDays}
                                            strategyDays={strategyDays} setStrategyDays={setStrategyDays}
                                            sortBy={sortBy} setSortBy={setSortBy}
                                        />
                                        <BibiRestock
                                            alerts={sortedRestockAlerts}
                                            strategyDays={strategyDays}
                                            shoppingList={shoppingList}
                                            onToggleList={toggleList}
                                        />
                                    </>
                                )}

                                {activeTab === 'top_products' && isPro && (
                                    <BibiTopProducts products={insights.topProducts} />
                                )}

                                {activeTab === 'dead_stock' && isPro && (
                                    <BibiDeadStock alerts={insights.deadStockAlerts} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
