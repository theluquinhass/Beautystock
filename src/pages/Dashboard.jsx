import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { startOfMonth, isSameDay, parseISO } from 'date-fns';
import Header from '../components/Dashboard/Header';
import StatCard from '../components/Dashboard/StatCard';
import BestSellers from '../components/Dashboard/BestSellers';
import RecentMovements from '../components/Dashboard/RecentMovements';
import FAB from '../components/Dashboard/FAB';
import { Package, TrendingUp, Users, Wallet, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan'; // [NEW]

export default function Dashboard() {
    const navigate = useNavigate();
    const { isPro } = usePlan(); // [NEW]
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        profit: 0,
        lowStock: 0,
        receivables: 0, // FIADO
        salesToday: 0
    });
    const [recentMovements, setRecentMovements] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [userName, setUserName] = useState('Ana');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get User Name (metadata or profile) - For now hardcoded or simple logic
            // setUserName(user.user_metadata.name || 'Ana');

            // --- PARALLEL FETCHING FOR SPEED ---
            const [
                { data: products },
                { data: movements },
                { data: payments }
            ] = await Promise.all([
                // 1. Products (Cost/Price/Stock)
                supabase.from('products').select('id, cost, price, variations(id, stock_quantity)').eq('user_id', user.id),
                // 2. Movements (Sales & Credits) - Last 2 months maybe? Or all for accurate debt?
                // For debt we need ALL credit sales. For profit we need THIS MONTH sales.
                // Let's fetch a reasonable amount or optimize later. For MVP fetch 'enough'.
                // Actually, for debt we need ALL unpaid credit sales.
                // Let's fetch ALL sales/entries for simplicity in MVP (assuming < 10k rows)
                supabase.from('movements').select('*').eq('user_id', user.id),
                // 3. Payments (for debt calc)
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
            const productSales = {}; // map product_id -> count

            movements?.forEach(m => {
                const date = parseISO(m.date);

                // Sales Today
                if (m.type === 'SALE' && isSameDay(date, now)) {
                    salesTodayTotal += 1; // Count of sales or quantity? Let's do count of transactions for now, or quantity? 
                    // Let's do quantity.
                    // salesTodayTotal += m.quantity; 
                    // actually "Vendas Hoje" usually means "R$ Value" or "Number of sales". 
                    // Let's go with Number of Sales (transactions) to show activity.
                }

                // Profit (Month)
                if (m.type === 'SALE' && date >= startOfCurrentMonth) {
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
            // Total Credit Sales (Value) - Total Payments (Value)
            const totalCreditSales = movements
                ?.filter(m => m.is_on_credit)
                .reduce((acc, m) => acc + (m.quantity * (m.unit_price || 0)), 0) || 0;

            const totalPayments = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
            const totalReceivables = Math.max(0, totalCreditSales - totalPayments);

            // D. Recent Movements (Feed)
            // Sort movements desc
            const sortedMovements = [...(movements || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
            const recent = sortedMovements.map(m => {
                const product = products?.find(p => p.variations?.some(v => v.id === m.variation_id));
                return {
                    id: m.id,
                    productName: product?.name || 'Produto',
                    // Logic to find Variation Name is harder without map, but acceptable for MVP
                    type: m.type,
                    quantity: m.quantity,
                    date: m.date,
                    total: (m.unit_price || product?.price || 0) * m.quantity,
                    customer_id: m.customer_id, // we might need customer name, but we didn't fetch it here...
                    // Let's rely on Dashboard/RecentMovements component to fetch or just show basics.
                    // Actually `RecentMovements` component expects `clientName`. 
                    // We need to fetch customer names.
                };
            });

            // Re-fetch recent movements WITH customer names for the feed to be pretty
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

            // formatting for RecentMovements component
            const formattedRecent = recentWithNames?.map(m => ({
                id: m.id,
                clientName: m.customers?.name || (m.type === 'SALE' ? 'Venda Avulsa' : 'Fornecedor'),
                productName: m.variations?.products?.name || 'Produto',
                total: (m.unit_price || 0) * m.quantity,
                date: m.date,
                type: m.type
            }));

            setRecentMovements(formattedRecent || []);

            setBestSellers(Object.values(productSales).sort((a, b) => b.soldCount - a.soldCount).slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 animate-pulse">Carregando...</div>;

    return (
        <div className="pb-24">
            <Header userName={userName} subtitle="Seu lucro este mês está crescendo! 🚀" />

            <div className="flex flex-col gap-4 mb-8">
                {/* 1. HERO METRIC: Receivables (Fiado) - The "Money in the street" */}
                {stats.receivables > 0 && (
                    <div onClick={() => navigate('/clientes')} className="cursor-pointer">
                        <StatCard
                            title="Total a Receber"
                            value={`R$ ${stats.receivables.toFixed(2)}`}
                            subtitle="Clique para cobrar clientes"
                            type="featured"
                            icon={Wallet}
                        />
                    </div>
                )}

                {/* 2. Grid for Profit & Sales */}
                <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => !isPro && navigate('/upgrade')} className={!isPro ? "cursor-pointer" : ""}>
                        <StatCard
                            title="Lucro (Mês)"
                            value={isPro ? `R$ ${stats.profit.toFixed(2)}` : "R$ ***"}
                            subtitle={!isPro && "🔒 Upgrade para ver"}
                            type="primary"
                            icon={TrendingUp}
                        />
                    </div>
                    <StatCard
                        title="Vendas Hoje"
                        value={stats.salesToday}
                        subtitle="Transações"
                        icon={ArrowUpRight}
                    />
                </div>

                {/* 3. Alerts */}
                {stats.lowStock > 0 && (
                    <div onClick={() => navigate('/produtos')} className="cursor-pointer">
                        <StatCard
                            title="Estoque Baixo"
                            value={stats.lowStock}
                            subtitle="Produtos precisam de reposição"
                            type="warning"
                            icon={Package}
                        />
                    </div>
                )}
            </div>

            <BestSellers products={bestSellers} />

            <div className="mt-4">
                <RecentMovements movements={recentMovements} />
            </div>

            <FAB onClick={() => navigate('/movimentacoes')} />
        </div>
    );
}
