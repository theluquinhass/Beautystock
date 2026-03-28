import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users, DollarSign } from 'lucide-react';

const ChartCard = ({ title, icon: Icon, iconColor, iconBg, children }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={iconColor} />
            </div>
            <h3 className="text-base font-black text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl px-4 py-3 text-sm">
                <p className="font-bold text-gray-500 text-xs mb-1 uppercase tracking-wide">{label}</p>
                <p className="font-black text-gray-900">{formatter ? formatter(payload[0].value) : payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function ChartsSection({ chartData, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse rounded-3xl" />
                <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Novos Usuários (30d)" icon={Users} iconColor="text-blue-500" iconBg="bg-blue-50">
                <div className="h-[230px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} dy={8} minTickGap={30} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="users" name="Usuários" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>

            <ChartCard title="Receita (30d)" icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50">
                <div className="h-[230px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} dy={8} minTickGap={30} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} tickFormatter={v => `R$${v}`} />
                            <Tooltip content={<CustomTooltip formatter={(v) => `R$ ${v.toFixed(2)}`} />} />
                            <Area type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>
        </div>
    );
}
