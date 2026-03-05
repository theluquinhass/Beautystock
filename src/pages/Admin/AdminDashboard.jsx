import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { subDays, format, parseISO } from 'date-fns';

// Components
import AdminHeader from '../../components/Admin/AdminHeader';
import SystemAlerts from '../../components/Admin/SystemAlerts';
import StatsGrid from '../../components/Admin/StatsGrid';
import ChartsSection from '../../components/Admin/ChartsSection';
import SubscriptionsSection from '../../components/Admin/SubscriptionsSection';
import PaymentsSection from '../../components/Admin/PaymentsSection';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        proUsers: 0,
        monthlyRevenue: 0,
        revenueToday: 0,
        mrr: 0,
        arpu: 0,
        churnedUsers: 0
    });

    const [chartData, setChartData] = useState([]);
    const [recentSubscriptions, setRecentSubscriptions] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hardcoded alerts for demonstration/SaaS realism (could be dynamic in the future)
    const systemAlerts = [
        // { type: 'error', title: 'Webhook do Mercado Pago falhando', message: 'Últimas 3 tentativas retornaram erro 500. Verifique as chaves de API.' },
        // { type: 'warning', title: 'Certificado SSL', message: 'Faltam 14 dias para expirar o certificado da API.' }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Core User Metrics
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: proUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro');

            const { count: churnedUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('plan', 'free')
                .not('expires_at', 'is', null)
                .lt('expires_at', new Date().toISOString());

            // 2. Core Financial Metrics (30 days & Today)
            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: payments } = await supabase
                .from('payments')
                .select('amount, created_at')
                .eq('status', 'approved')
                .gte('created_at', thirtyDaysAgo);

            const monthlyRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

            const revenueToday = payments?.filter(p => new Date(p.created_at) >= today)
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

            // Approximate SaaS Metrics
            const mrr = monthlyRevenue; // Simplified for now since most are monthly plans
            const arpu = proUsers > 0 ? (monthlyRevenue / proUsers) : 0;

            setMetrics({
                totalUsers: totalUsers || 0,
                proUsers: proUsers || 0,
                monthlyRevenue,
                revenueToday,
                mrr,
                arpu,
                churnedUsers: churnedUsers || 0
            });

            // 3. Chart Data
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

            // 4. Recent Data for Tables
            const { data: latestSubs } = await supabase
                .from('profiles')
                .select('first_name, last_name, email, plan, created_at')
                .eq('plan', 'pro')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentSubscriptions(latestSubs || []);

            const { data: latestPayments } = await supabase
                .from('payments')
                .select('user_id, amount, topic, status, created_at')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentPayments(latestPayments || []);

        } catch (error) {
            console.error("Error fetching admin dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 pb-32 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
            <AdminHeader />
            <SystemAlerts alerts={systemAlerts} />
            <StatsGrid metrics={metrics} loading={loading} />
            <ChartsSection chartData={chartData} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <SubscriptionsSection subscriptions={recentSubscriptions} loading={loading} />
                <PaymentsSection payments={recentPayments} loading={loading} />
            </div>
        </div>
    );
}
