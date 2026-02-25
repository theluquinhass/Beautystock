import React from 'react';
import { Sparkles, X, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import BibiSummaryMiniKpis from './BibiSummaryMiniKpis';
import BibiInsightCard from './BibiInsightCard';
import BibiTopProducts from './BibiTopProducts';
import BibiDeadStock from './BibiDeadStock';
import BibiFilters from './BibiFilters';
import BibiTabs from './BibiTabs';
import BibiFooterActions from './BibiFooterActions';

export default function BibiPanelDesktop({
    isOpen, onClose, isPro, loading, activeTab, setActiveTab,
    periodDays, setPeriodDays, strategyDays, setStrategyDays, sortBy, setSortBy,
    insights, sortedRestockAlerts, shoppingList, toggleList
}) {
    if (!isOpen) return null;

    return (
        <div className="hidden lg:flex fixed inset-0 z-[60] pointer-events-none">
            {/* Dark area outside panel */}
            <div
                className="absolute inset-0 transition-opacity bg-transparent" // transparent to act as invisible overlay just to close
                onClick={onClose}
                style={{ pointerEvents: 'auto' }}
            />

            {/* Desktop Panel */}
            <div className={cn(
                "absolute bottom-6 right-6 w-[520px] max-h-[85vh] h-[640px] bg-white rounded-[24px] shadow-2xl pointer-events-auto flex flex-col overflow-hidden border border-gray-200 transition-all duration-300",
                "animate-in slide-in-from-bottom-8 fade-in zoom-in-95"
            )}>
                {/* Gradient Header */}
                <div className="px-6 py-5 flex items-center gap-4 relative z-10 flex-shrink-0 bg-gradient-to-r from-pink-50/80 to-purple-50/80 border-b border-gray-100">
                    <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-md shadow-pink-200 border border-pink-400/50">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight leading-none">Bibi</h2>
                            {isPro && (
                                <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                                    PRO
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">Consultora de Estoque & Lucro</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={onClose}
                            className="p-1.5 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors focus:ring-2 focus:ring-pink-200"
                        >
                            <X size={18} />
                        </button>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Análise atualizada
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <BibiTabs activeTab={activeTab} setActiveTab={setActiveTab} isPro={isPro} isDesktop={true} />

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative bg-gray-50/30">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-pink-300 space-y-4">
                            <Sparkles size={40} className="animate-pulse" />
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Analisando dados...</span>
                        </div>
                    ) : (
                        <div className="p-5 pb-24"> {/* pb-24 for footer space */}
                            {activeTab === 'resumo' && (
                                <>
                                    <h3 className="font-extrabold text-gray-800 text-lg mb-4">
                                        Analisando os últimos {insights?.summary?.checkedPeriod || 30} dias
                                    </h3>
                                    <BibiSummaryMiniKpis summary={insights.summary} />

                                    {!isPro && (
                                        <div className="mt-8 bg-white border border-pink-100 p-6 rounded-2xl shadow-lg shadow-pink-100/50 text-center relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 -mr-6 -mt-6 text-pink-500/5 group-hover:scale-110 transition-transform">
                                                <Sparkles size={120} />
                                            </div>
                                            <div className="bg-pink-50 w-16 h-16 rounded-2xl border border-pink-100 flex items-center justify-center mx-auto mb-4 relative z-10 shadow-inner">
                                                <Lock className="text-pink-500" size={32} />
                                            </div>
                                            <h3 className="text-gray-800 font-black text-xl leading-tight mb-2 relative z-10">Desbloqueie o Command Center</h3>
                                            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed relative z-10 max-w-[280px] mx-auto">
                                                A Bibi completa cria listas prontas para o WhatsApp, monitora lucro em risco e revela seus produtos campeões.
                                            </p>
                                            <a
                                                href="/conta"
                                                className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all relative z-10 w-full lg:w-auto"
                                            >
                                                Ver Planos PRO
                                            </a>
                                        </div>
                                    )}

                                    {isPro && (
                                        <div className="mt-6 border-t border-gray-100 pt-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                                                <h3 className="font-bold text-gray-800 text-[15px]">Prioridades Críticas</h3>
                                            </div>
                                            {/* Show top 2 restock alerts in summary */}
                                            {sortedRestockAlerts.slice(0, 2).map((item, idx) => (
                                                <BibiInsightCard
                                                    key={item.id || idx}
                                                    item={item}
                                                    strategyDays={strategyDays}
                                                    isInList={shoppingList.some(i => i.id === item.id)}
                                                    onToggleList={toggleList}
                                                />
                                            ))}
                                            {sortedRestockAlerts.length === 0 && (
                                                <p className="text-sm font-medium text-gray-400">Nenhum risco crítico momento.</p>
                                            )}
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
                                        isDesktop={true}
                                    />

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-extrabold text-gray-800 text-[15px]">Recomendações de Compra</h3>
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                {sortedRestockAlerts.length} itens encontrados
                                            </span>
                                        </div>

                                        {sortedRestockAlerts.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                                                <p className="text-lg font-bold text-gray-800">Tudo certo! 💖</p>
                                                <p className="text-sm text-gray-500 mt-1">Seu estoque está saudável.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {sortedRestockAlerts.map((item, idx) => (
                                                    <BibiInsightCard
                                                        key={item.id || idx}
                                                        item={item}
                                                        strategyDays={strategyDays}
                                                        isInList={shoppingList.some(i => i.id === item.id)}
                                                        onToggleList={toggleList}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab === 'top_products' && isPro && (
                                <>
                                    <h3 className="font-extrabold text-gray-800 text-lg mb-4">
                                        Campeões de Lucro
                                    </h3>
                                    <BibiTopProducts products={insights.topProducts} />
                                </>
                            )}

                            {activeTab === 'dead_stock' && isPro && (
                                <>
                                    <h3 className="font-extrabold text-gray-800 text-lg mb-4">
                                        Estoque Parado
                                    </h3>
                                    <BibiDeadStock alerts={insights.deadStockAlerts} />
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer fixed on desktop (for restock interactions) */}
                {isPro && activeTab !== 'top_products' && activeTab !== 'dead_stock' && (
                    <BibiFooterActions shoppingList={shoppingList} />
                )}
            </div>
        </div>
    );
}
