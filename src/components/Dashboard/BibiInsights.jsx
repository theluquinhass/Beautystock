import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { Sparkles, Lock, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { subDays, formatISO } from 'date-fns';

export default function BibiInsights() {
    const { user } = useAuth();
    const { isPro } = usePlan();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isPro && user) {
            fetchInsights();
        }
    }, [user, isPro]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const thirtyDaysAgo = subDays(new Date(), 30);

            // 1. Fetch products and their variations (for current stock)
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
                        const daysRemaining = avgDailySales > 0 ? (stock / avgDailySales) : 999;

                        // If we have less than 15 days of stock, Bibi alerts us!
                        if (daysRemaining < 15) {
                            const recommendedRestock = Math.ceil(avgDailySales * 30); // Recommend enough for 30 days

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

            // Sort by most critical (lowest days remaining)
            results.sort((a, b) => a.days_remaining - b.days_remaining);

            setInsights(results);

        } catch (error) {
            console.error('Error fetching Bibi insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isPro) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-3 rounded-2xl mb-3 shadow-lg shadow-pink-200">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h3 className="text-gray-800 font-bold mb-1 text-lg">Bibi Inteligente</h3>
                    <p className="text-gray-500 text-xs mb-3 font-medium">Previsão automática de reposição de estoque</p>
                    <div className="flex items-center gap-2 text-pink-600 font-bold bg-pink-50 px-4 py-2 rounded-xl text-xs border border-pink-100">
                        <Sparkles size={14} />
                        Disponível no plano PRO
                    </div>
                </div>

                {/* Blurred Background Content */}
                <div className="opacity-30 pointer-events-none filter blur-sm">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <Sparkles className="text-pink-500" size={20} />
                        Bibi recomenda
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-4 flex gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const getStatusConfig = (days) => {
        if (days < 5) return { color: 'text-red-500', bg: 'bg-red-50 border-red-100', icon: AlertOctagon, label: 'Crítico' };
        if (days <= 10) return { color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100', icon: AlertTriangle, label: 'Atenção' };
        return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100', icon: AlertCircle, label: 'Alerta' };
    };

    // Fallback icon since AlertOctagon isn't imported, use AlertTriangle for critical too, but let me just map it
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

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-pink-100 h-full flex flex-col relative overflow-hidden">
            {/* Soft decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-md shadow-pink-200">
                    <Sparkles className="text-white" size={18} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight">Bibi recomenda</h3>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Consultoria de Estoque</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 no-scrollbar relative z-10">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-pink-300 animate-pulse py-10">
                        <Sparkles size={24} className="mb-2" />
                        <span className="text-sm font-medium">Bibi está analisando...</span>
                    </div>
                ) : insights.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10 opacity-70">
                        <Sparkles size={32} className="mb-3" strokeWidth={1} />
                        <p className="text-sm font-medium text-center px-4">Estoque muito saudável!</p>
                        <p className="text-xs text-center mt-1">Nenhum produto precisando de reposição urgente.</p>
                    </div>
                ) : (
                    insights.map((item, index) => (
                        <div key={index} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2">{item.product_name}</h4>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${getBadgeStyle(item.days_remaining)}`}>
                                    {getIcon(item.days_remaining)}
                                    {item.days_remaining} {item.days_remaining === 1 ? 'dia restante' : 'dias restantes'}
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Sugestão</span>
                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                        + {item.recommended_restock} un
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
