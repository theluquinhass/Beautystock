import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { startOfMonth, isSameDay, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export function useDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        profit: 0,
        lowStock: 0,
        receivables: 0,
        salesToday: 0
    });
    const [recentMovements, setRecentMovements] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [userName, setUserName] = useState('');

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Set user name from metadata
            // Fetch Profile Name
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();

            if (profile?.first_name) {
                setUserName(`${profile.first_name} ${profile.last_name || ''}`.trim());
            } else {
                const { first_name, last_name } = user.user_metadata || {};
                if (first_name) {
                    setUserName(`${first_name} ${last_name || ''}`.trim());
                } else if (user.email) {
                    setUserName(user.email.split('@')[0]);
                }
            }

            // --- PARALLEL FETCHING ---
            const [
                { data: products },
                { data: movements },
                { data: payments }
            ] = await Promise.all([
                supabase.from('products').select('id, name, cost, price, variations(id, stock_quantity)').eq('user_id', user.id),
                supabase.from('movements').select('*').eq('user_id', user.id),
                supabase.from('payments').select('customer_id, amount').eq('user_id', user.id)
            ]);

            // --- CALCULATIONS ---

            // A. Low Stock
            let lowStockCount = 0;
            products?.forEach(p => p.variations?.forEach(v => {
                if (v.stock_quantity < 5) lowStockCount++;
            }));

            // Filter for THIS MONTH
            const now = new Date();
            const startOfCurrentMonth = startOfMonth(now);

            // B. Sales Today & Profit Month
            let monthlyProfit = 0;
            let salesTodayTotal = 0;
            const productSales = {};

            movements?.forEach(m => {
                const date = parseISO(m.date);

                // Sales Today
                if (m.type === 'EXIT' && isSameDay(date, now)) {
                    salesTodayTotal += 1;
                }

                // Profit (Month)
                if (m.type === 'EXIT' && date >= startOfCurrentMonth) {
                    const product = products?.find(p => p.variations?.some(v => v.id === m.variation_id));
                    if (product) {
                        const profit = (product.price - product.cost) * m.quantity;
                        monthlyProfit += profit;

                        // Best Sellers logic
                        if (!productSales[product.id]) {
                            productSales[product.id] = { ...product, soldCount: 0 };
                        }
                        productSales[product.id].soldCount += m.quantity;
                    }
                }
            });

            // C. Receivables (Fiado Total)
            const totalCreditSales = movements
                ?.filter(m => m.is_on_credit)
                .reduce((acc, m) => acc + (m.quantity * (m.unit_price || 0)), 0) || 0;

            const totalPayments = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
            const totalReceivables = Math.max(0, totalCreditSales - totalPayments);

            // D. Recent Movements (Feed)
            // Re-fetch recent movements WITH customer names for the feed
            const { data: recentWithNames } = await supabase
                .from('movements')
                .select(`*, variations(name, products(name)), customers(name)`)
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(7);

            setStats({
                profit: monthlyProfit,
                lowStock: lowStockCount,
                receivables: totalReceivables,
                salesToday: salesTodayTotal
            });

            const formattedRecent = recentWithNames?.map(m => ({
                id: m.id,
                clientName: m.customers?.name || (m.type === 'EXIT' ? 'Venda Avulsa' : 'Fornecedor'),
                productName: m.variations?.products?.name || 'Produto',
                total: (m.unit_price || 0) * m.quantity,
                date: m.date,
                type: m.type
            }));

            setRecentMovements(formattedRecent || []);
            setBestSellers(Object.values(productSales).sort((a, b) => b.soldCount - a.soldCount).slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Erro ao carregar dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        loading,
        stats,
        recentMovements,
        bestSellers,
        userName,
        refresh: fetchDashboardData
    };
}
