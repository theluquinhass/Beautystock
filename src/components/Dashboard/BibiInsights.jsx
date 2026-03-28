import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { Sparkles, Lock, TrendingDown, Crown } from 'lucide-react';
import { generateBibiInsights, sortRestockAlerts } from '../Bibi/bibiUtils';

const BibiInsights = memo(function BibiInsights() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPro } = usePlan();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isPro && user) fetchInsights();
    }, [user, isPro]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const data = await generateBibiInsights(user.id, 30, 30);
            const sorted = sortRestockAlerts(data.restockAlerts, 'acaba_mais_rapido').slice(0, 3);
            setInsights(sorted);
        } catch (error) {
            console.error('Error fetching Bibi insights:', error);
        } finally {
            setLoading(false);
        }
    };

    /* ── Locked (FREE) ── */
    if (!isPro) {
        return (
            <div className="bg-card rounded-[32px] p-6 shadow-soft border border-border h-full flex flex-col relative overflow-hidden group">
                <div className="absolute inset-0 bg-card/70 dark:bg-card/80 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:bg-card/60">
                    <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 rounded-full mb-4 shadow-pink animate-pulse">
                        <Lock className="text-white animate-bounce" size={28} />
                    </div>
                    <h3 className="text-foreground font-extrabold mb-2 text-xl tracking-tight">Estoque inteligente ✨</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-6 max-w-[280px] leading-relaxed">
                        Esqueceu de comprar? A Bibi prevê automaticamente o que vai faltar no seu estoque antes de você perder vendas!
                    </p>
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center justify-center gap-2 w-full max-w-[240px] bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl shadow-pink hover:opacity-90 transition-all hover:-translate-y-1 active:scale-95 border border-pink-400/30"
                    >
                        <Crown size={18} className="text-yellow-300 fill-yellow-300" />
                        Desbloquear PRO
                    </button>
                </div>

                {/* Conteúdo desfocado de fundo */}
                <div className="opacity-40 pointer-events-none filter blur-sm select-none">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                        <Sparkles className="text-primary" size={20} />
                        Bibi recomenda
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Shampoo Neutro 500ml', restock: '3 dias', num: '12' },
                            { name: 'Condicionador Hidratante', restock: '5 dias', num: '8' },
                            { name: 'Máscara Capilar Premium', restock: '7 dias', num: '5' }
                        ].map((mock, i) => (
                            <div key={i} className="px-4 py-3 rounded-2xl border border-border bg-muted flex flex-col">
                                <h4 className="font-bold text-foreground text-sm mb-2">{mock.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase">
                                        <TrendingDown size={14} className="text-destructive" />
                                        Acaba em {mock.restock}
                                    </div>
                                    <div className="text-xs font-black text-success bg-success/15 px-2 py-1 rounded-md border border-success/25">
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

    /* ── PRO ── */
    return (
        <div className="bg-card rounded-[32px] p-6 shadow-soft border border-border h-full flex flex-col relative overflow-hidden group hover:shadow-card-hover transition-all">
            {/* Blob decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-pink">
                    <Sparkles className="text-white" size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight leading-none">Bibi recomenda</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Consultoria de Estoque</p>
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 no-scrollbar relative z-10">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-primary animate-pulse py-10">
                        <Sparkles size={24} className="mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">Bibi está analisando...</span>
                    </div>
                ) : insights.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10 opacity-70">
                        <Sparkles size={32} className="mb-3" strokeWidth={1} />
                        <p className="text-sm font-bold text-center px-4">Estoque saudável!</p>
                        <p className="text-xs text-center mt-1">Nenhum produto com risco nos próximos 30 dias.</p>
                    </div>
                ) : (
                    insights.map((item, index) => {
                        // Urgência do prazo
                        const daysCls = item.days_remaining < 5
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : item.days_remaining <= 10
                                ? 'bg-warning/10 text-warning border-warning/20'
                                : 'bg-muted text-muted-foreground border-border';

                        return (
                            <div
                                key={index}
                                className="px-4 py-3 rounded-2xl border border-border bg-card hover:bg-muted/50 shadow-soft hover:shadow-card-hover transition-all"
                            >
                                {/* Nome produto */}
                                <h4 className="font-bold text-foreground text-sm leading-tight mb-3 line-clamp-1">
                                    {item.product_name}
                                </h4>

                                <div className="flex items-center justify-between gap-2">
                                    {/* Acaba em X dias — com cor por urgência */}
                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${daysCls}`}>
                                        <TrendingDown size={12} />
                                        Acaba em{' '}
                                        <span className="font-black">{Math.floor(item.days_remaining)} dias</span>
                                    </div>

                                    {/* Sugestão de compra */}
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-0.5 tracking-wider">
                                            Sugestão
                                        </span>
                                        <span className="text-xs font-black text-white bg-success px-3 py-1 rounded-lg shadow-sm block text-center">
                                            + {item.suggested_qty}
                                        </span>
                                    </div>
                                </div>

                                {/* Risco financeiro */}
                                {item.estimated_lost_profit > 0 && (
                                    <div className="border-t border-border mt-2 pt-2 text-[10px] text-muted-foreground flex justify-between">
                                        <span>Risco financeiro:</span>
                                        <span className="font-bold text-destructive">
                                            {item.estimated_lost_profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {!loading && insights.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/50 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Ação: Abra a aba Bibi
                    </span>
                </div>
            )}
        </div>
    );
});

export default BibiInsights;