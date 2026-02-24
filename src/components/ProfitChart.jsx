import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { subDays, format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { Crown, Lock } from 'lucide-react';

export default function ProfitChart() {
    const { user } = useAuth();
    const { isPro } = usePlan();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState(30);

    useEffect(() => {
        if (isPro && user) {
            fetchData();
        }
    }, [user, isPro, days]);

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

    if (!isPro) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-pink-100 p-3 rounded-full mb-3">
                        <Lock className="text-pink-500" size={24} />
                    </div>
                    <h3 className="text-gray-800 font-bold mb-1">Crescimento de Lucro</h3>
                    <div className="flex items-center gap-2 text-pink-600 font-bold bg-pink-50 px-4 py-2 rounded-full text-xs mt-2 border border-pink-100">
                        <Crown size={14} />
                        Disponível no plano PRO
                    </div>
                </div>

                {/* Blurred Background Content */}
                <div className="opacity-30 pointer-events-none filter blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Crescimento de Lucro</h3>
                    </div>
                    <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2">
                        {/* Fake chart bars */}
                        <div className="w-full bg-pink-200 h-[20%] rounded-t"></div>
                        <div className="w-full bg-pink-200 h-[35%] rounded-t"></div>
                        <div className="w-full bg-pink-200 h-[50%] rounded-t"></div>
                        <div className="w-full bg-pink-200 h-[45%] rounded-t"></div>
                        <div className="w-full bg-pink-200 h-[60%] rounded-t"></div>
                        <div className="w-full bg-pink-200 h-[75%] rounded-t"></div>
                        <div className="w-full bg-pink-200 h-[90%] rounded-t"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Crescimento de Lucro</h3>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${days === d
                                ? 'bg-white text-pink-500 shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {d === 90 ? '3 Meses' : `${d} Dias`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[250px] w-full -ml-4">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-pink-300 animate-pulse">
                        Carregando...
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
        </div>
    );
}
