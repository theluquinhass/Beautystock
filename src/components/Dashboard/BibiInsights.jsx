import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { Sparkles, Lock, TrendingDown, Crown } from 'lucide-react';
import { generateBibiInsights, sortRestockAlerts } from '../Bibi/bibiUtils';

export default function BibiInsights() {
    const navigate = useNavigate();
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
            const data = await generateBibiInsights(user.id, 30, 30);
            // Display top 3 most critical restock alerts
            const sorted = sortRestockAlerts(data.restockAlerts, 'acaba_mais_rapido').slice(0, 3);
            setInsights(sorted);
        } catch (error) {
            console.error('Error fetching Bibi insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isPro) {
        return (
            <div className="bg-white rounded-[32px] p-6 shadow-soft border border-pink-100 h-full flex flex-col relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:bg-white/60">
                    <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 rounded-full mb-4 shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-pulse">
                        <Lock className="text-white animate-bounce" size={28} />
                    </div>
                    <h3 className="text-gray-800 font-extrabold mb-2 text-xl tracking-tight">Estoque inteligente ✨</h3>
                    <p className="text-gray-600 text-sm font-medium mb-6 max-w-[280px] leading-relaxed">
                        Esqueceu de comprar? A Bibi prevê automaticamente o que vai faltar no seu estoque antes de você perder vendas!
                    </p>
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center justify-center gap-2 w-full max-w-[240px] bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-pink-500/30 transition-all hover:-translate-y-1 active:scale-95 border border-pink-400/50"
                    >
                        <Crown size={18} className="text-yellow-300 fill-yellow-300" />
                        Desbloquear PRO
                    </button>
                </div>

                {/* Blurred Background Content (Fake Alert List) */}
                <div className="opacity-40 pointer-events-none filter blur-sm select-none">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <Sparkles className="text-pink-500" size={20} />
                        Bibi recomenda
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Shampoo Neutro 500ml', restock: '3 dias', num: '12' },
                            { name: 'Condicionador Hidratante', restock: '5 dias', num: '8' },
                            { name: 'Máscara Capilar Premium', restock: '7 dias', num: '5' }
                        ].map((mock, i) => (
                            <div key={i} className="px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col">
                                <h4 className="font-bold text-gray-700 text-sm mb-2">{mock.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                                        <TrendingDown size={14} className="text-rose-400" />
                                        Acaba em {mock.restock}
                                    </div>
                                    <div className="text-xs font-black text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md">
                                        + {mock.num} unts
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-pink-100 h-full flex flex-col relative overflow-hidden group hover:shadow-lg transition-all">
            {/* Soft decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-md shadow-pink-200">
                    <Sparkles className="text-white" size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight leading-none">Bibi recomenda</h3>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Consultoria de Estoque</p>
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
                        <p className="text-sm font-bold text-center px-4">Estoque saudável!</p>
                        <p className="text-xs text-center mt-1">Nenhum produto com risco de falta para os próximos 30 dias.</p>
                    </div>
                ) : (
                    insights.map((item, index) => (
                        <div key={index} className="px-4 py-3 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50/80 shadow-sm hover:shadow-md transition-all">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2 mb-2 line-clamp-1">{item.product_name}</h4>

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                                    <TrendingDown size={12} className="text-gray-400" />
                                    Acaba em <span className="font-bold">{Math.floor(item.days_remaining)} dias</span>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">Sugestão</span>
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 block">
                                        + {item.suggested_qty}
                                    </span>
                                </div>
                            </div>

                            {item.estimated_lost_profit > 0 && (
                                <div className="border-t border-gray-100 pt-2 text-[10px] text-gray-500 flex justify-between">
                                    <span>Risco financeiro:</span>
                                    <span className="font-bold text-red-500">{item.estimated_lost_profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {!loading && insights.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Ação: Abra a aba Bibi
                    </span>
                </div>
            )}
        </div>
    );
}
