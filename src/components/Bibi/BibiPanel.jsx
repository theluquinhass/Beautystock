import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, X, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { subDays, formatISO } from 'date-fns';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function BibiPanel({ isOpen, onClose }) {
    const { user } = useAuth();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchInsights();
        }
    }, [isOpen, user]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const thirtyDaysAgo = subDays(new Date(), 30);

            // 1. Fetch products and variations
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
                    id, 
                    name, 
                    variations(id, name, stock_quantity)
                `)
                .eq('user_id', user.id);

            if (productsError) throw productsError;

            // 2. Fetch sales from the last 30 days
            const { data: movementsData, error: movementsError } = await supabase
                .from('movements')
                .select('variation_id, quantity')
                .eq('user_id', user.id)
                .eq('type', 'EXIT')
                .gte('date', formatISO(thirtyDaysAgo));

            if (movementsError) throw movementsError;

            // 3. Process the data
            const salesPerVariation = {};
            movementsData.forEach(m => {
                if (!salesPerVariation[m.variation_id]) {
                    salesPerVariation[m.variation_id] = 0;
                }
                salesPerVariation[m.variation_id] += m.quantity;
            });

            const results = [];

            productsData.forEach(product => {
                product.variations?.forEach(variation => {
                    const totalSold = salesPerVariation[variation.id] || 0;
                    const stock = variation.stock_quantity || 0;

                    const avgDailySales = totalSold / 30;

                    if (avgDailySales > 0) {
                        const daysRemaining = stock / avgDailySales;

                        // If we have less than 15 days of stock, alert
                        if (daysRemaining < 15) {
                            const recommendedRestock = Math.ceil(avgDailySales * 30);

                            results.push({
                                product_name: `${product.name} ${variation.name !== 'Padrão' ? `- ${variation.name}` : ''}`,
                                stock,
                                avg_daily_sales: avgDailySales,
                                days_remaining: Math.floor(daysRemaining),
                                recommended_restock: recommendedRestock
                            });
                        }
                    }
                });
            });

            results.sort((a, b) => a.days_remaining - b.days_remaining);
            setInsights(results);

        } catch (error) {
            console.error('Error fetching Bibi insights:', error);
            toast.error('Erro ao calcular tendências de estoque.');
        } finally {
            setLoading(false);
        }
    };

    const getBadgeStyle = (days) => {
        if (days < 5) return "text-red-600 bg-red-50 border-red-100";
        if (days <= 10) return "text-orange-600 bg-orange-50 border-orange-100";
        return "text-yellow-600 bg-yellow-50 border-yellow-100";
    };

    const getIcon = (days) => {
        if (days < 5) return <AlertTriangle size={14} className="text-red-500" />;
        if (days <= 10) return <AlertCircle size={14} className="text-orange-500" />;
        return <Clock size={14} className="text-yellow-500" />;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={cn(
                "bg-white w-full max-w-sm sm:w-96 rounded-3xl shadow-2xl pointer-events-auto flex flex-col relative overflow-hidden transition-all duration-300",
                "h-[80vh] sm:h-[600px] mb-0 sm:mb-4 sm:fixed sm:bottom-20 sm:right-6",
                "animate-in slide-in-from-bottom-8 fade-in sm:slide-in-from-bottom-12 sm:zoom-in-95"
            )}>
                {/* Header background soft decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-100 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center gap-3 relative z-10 border-b border-gray-50 flex-shrink-0">
                    <div className="p-2.5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-md shadow-pink-200">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Bibi</h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">Assistente inteligente</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar relative z-10 bg-gray-50/30">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-pink-300 space-y-4 pt-10">
                            <Sparkles size={32} className="animate-pulse" />
                            <span className="text-sm font-medium animate-pulse">Analisando suas vendas...</span>
                        </div>
                    ) : insights.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 pt-10">
                            <Sparkles size={40} className="mb-4 text-emerald-300" strokeWidth={1.5} />
                            <p className="text-base font-bold text-gray-600 text-center">Seu estoque está perfeito!</p>
                            <p className="text-sm text-center mt-2 px-4">Nenhum produto precisando de reposição pelas próximas duas semanas.</p>
                        </div>
                    ) : (
                        insights.map((item, index) => (
                            <div key={index} className="px-4 py-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                                <h4 className="font-bold text-gray-800 text-sm leading-tight mb-3 pr-2">{item.product_name}</h4>

                                <div className="flex items-center justify-between">
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${getBadgeStyle(item.days_remaining)}`}>
                                        {getIcon(item.days_remaining)}
                                        {item.days_remaining} {item.days_remaining === 1 ? 'dia restante' : 'dias restantes'}
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5 tracking-wider">Sugestão</span>
                                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 inline-block">
                                            + {item.recommended_restock} un
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer simple hint */}
                {!loading && insights.length > 0 && (
                    <div className="p-3 text-center bg-gray-50/80 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                        Baseado nas vendas dos últimos 30 dias.
                    </div>
                )}
            </div>
        </div>
    );
}
