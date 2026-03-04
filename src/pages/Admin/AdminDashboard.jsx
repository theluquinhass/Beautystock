import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { subDays, format, parseISO } from 'date-fns';
import { Users, Crown, DollarSign, UserMinus } from 'lucide-react';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        proUsers: 0,
        monthlyRevenue: 0,
        churnedUsers: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: proUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro');

            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

            const { data: payments } = await supabase
                .from('payments')
                .select('amount, created_at')
                .eq('status', 'approved')
                .gte('created_at', thirtyDaysAgo);

            const monthlyRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

            const { count: churnedUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('plan', 'free')
                .not('expires_at', 'is', null)
                .lt('expires_at', new Date().toISOString());

            setMetrics({
                totalUsers: totalUsers || 0,
                proUsers: proUsers || 0,
                monthlyRevenue,
                churnedUsers: churnedUsers || 0
            });

            const { data: newProfiles } = await supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', thirtyDaysAgo);

            const groups = {};
            for (let i = 29; i >= 0; i--) {
                const dateKey = format(subDays(new Date(), i), 'yyyy-MM-dd');
                groups[dateKey] = { date: format(subDays(new Date(), i), 'dd/MM'), users: 0, revenue: 0 };
            }

            newProfiles?.forEach(p => {
                const dateKey = format(parseISO(p.created_at), 'yyyy-MM-dd');
                if (groups[dateKey]) groups[dateKey].users += 1;
            });

            payments?.forEach(p => {
                const dateKey = format(parseISO(p.created_at), 'yyyy-MM-dd');
                if (groups[dateKey]) groups[dateKey].revenue += Number(p.amount) || 0;
            });

            setChartData(Object.values(groups));
        } catch (error) {
            console.error("Error fetching admin dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Usuários', value: metrics.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'PRO Ativos', value: metrics.proUsers, icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { label: 'Receita (30d)', value: `R$ ${metrics.monthlyRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Churn (Expirados)', value: metrics.churnedUsers, icon: UserMinus, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    return (
        <div className="p-8 pb-24">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>

            {loading ? (
                <div className="animate-pulse space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl w-full"></div>)}
                    </div>
                    <div className="h-80 bg-white border border-gray-100 rounded-2xl w-full"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Novos Usuários (30d)</h3>
                            <div className="h-[250px] w-full -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={10} minTickGap={30} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                                        <Area type="monotone" dataKey="users" name="Usuários" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Receita (30d)</h3>
                            <div className="h-[250px] w-full -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={10} minTickGap={30} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `R$ ${v}`} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
                                        <Area type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
