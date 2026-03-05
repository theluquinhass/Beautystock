import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { subDays, format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { Crown, Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UpgradeModal from './UpgradeModal';

export default function ProfitChart() {
    const { user } = useAuth();
    const { isPro } = usePlan();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState(7); // Start at 7 days so it works for Free too
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, days]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const startDate = subDays(new Date(), days);

            // Fetch exits/sales
            const { data: movements, error } = await supabase
                .from('movements')
                .select(`
                    date,
                    quantity,
                    unit_price,
                    variations (
                        products (
                            cost
                        )
                    )
                `)
                .eq('user_id', user.id)
                .eq('type', 'EXIT')
                .gte('date', startDate.toISOString())
                .order('date', { ascending: true });

            if (error) throw error;

            // Group by date
            const groups = {};
            // Initialize all days in range with 0
            for (let i = days; i >= 0; i--) {
                const date = subDays(new Date(), i);
                const key = format(date, 'yyyy-MM-dd');
                groups[key] = 0;
            }

            // Fill with actual data
            movements.forEach(m => {
                const dateKey = format(parseISO(m.date), 'yyyy-MM-dd');
                if (groups[dateKey] !== undefined) {
                    const price = m.unit_price || 0;
                    // Supabase nested relation might be array or object depending on schema relations
                    // Since variation -> product is one-to-one or many-to-one, variations should be an object
                    // and products should be an object. Just handle safely:
                    let cost = 0;
                    if (m.variations && !Array.isArray(m.variations) && m.variations.products && !Array.isArray(m.variations.products)) {
                        cost = m.variations.products.cost || 0;
                    }

                    const profit = (price - cost) * m.quantity;
                    groups[dateKey] += profit;
                }
            });

            // Convert to array
            const chartData = Object.keys(groups).map(date => ({
                date: format(parseISO(date), 'dd/MM'),
                fullDate: date,
                total: Number(groups[date].toFixed(2))
            }));

            setData(chartData);

        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetDays = (d) => {
        if (!isPro && d > 7) {
            setShowUpgradeModal(true);
            return;
        }
        setDays(d);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Crescimento de Lucro</h3>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => handleSetDays(d)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${days === d
                                ? 'bg-white text-pink-500 shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {d === 90 ? '3 Meses' : `${d} Dias`}
                            {!isPro && d > 7 && <Lock size={10} className="ml-0.5 opacity-50" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[250px] w-full -ml-4">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-pink-300 animate-pulse">
                        Carregando...
                    </div>
                ) : data.every(d => d.total === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 ml-4">
                        <TrendingUp size={32} strokeWidth={1.5} className="text-gray-200 mb-3" />
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Sem histórico financeiro</h3>
                        <p className="text-xs text-gray-400 max-w-[250px]">
                            À medida que você realizar vendas, o crescimento do seu lucro aparecerá aqui.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                allowDecimals={false}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Lucro']}
                                cursor={{ stroke: '#ec4899', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#ec4899"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText="Gráfico acima de 7 dias"
                featureName="relatórios avançados"
            />
        </div >
    );
}
