import { useNavigate } from 'react-router-dom';
import Header from '../components/Dashboard/Header';
import StatCard from '../components/Dashboard/StatCard';
import BestSellers from '../components/Dashboard/BestSellers';
import RecentMovements from '../components/Dashboard/RecentMovements';
import FAB from '../components/Dashboard/FAB';
import { Package, TrendingUp, Wallet, ArrowUpRight, Loader2 } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import ProfitChart from '../components/ProfitChart';
import TopDebtorsCard from '../components/Dashboard/TopDebtorsCard';
import BibiInsights from '../components/Dashboard/BibiInsights';

export default function Dashboard() {
    const navigate = useNavigate();
    const { loading, stats, recentMovements, bestSellers, userName } = useDashboard();

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="pb-24 lg:pb-0">
            <div className="lg:hidden">
                <Header userName={userName} subtitle="Seu lucro este mês está crescendo! 🚀" />
            </div>

            {/* Metrics Row */}
            <div className="flex flex-col gap-4 mb-6 lg:grid lg:grid-cols-12 lg:gap-6">

                {/* 1. HERO METRIC: Receivables (Fiado) - The "Money in the street" */}
                {stats.receivables > 0 ? (
                    <div onClick={() => navigate('/clientes')} className="cursor-pointer lg:col-span-6">
                        <StatCard
                            title="Total a Receber"
                            value={`R$ ${stats.receivables.toFixed(2)}`}
                            subtitle="Clique para cobrar clientes"
                            type="featured"
                            icon={Wallet}
                        />
                    </div>
                ) : (
                    <div className="hidden lg:col-span-6" />
                )}

                {/* 2. Grid for Profit & Sales */}
                <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:grid-cols-2 lg:gap-6">
                    <div className="h-full" data-onboarding="profit-card">
                        <StatCard
                            title="Lucro (Mês)"
                            value={`R$ ${stats.profit.toFixed(2)}`}
                            type="primary"
                            icon={TrendingUp}
                        />
                    </div>
                    <div className="h-full">
                        <StatCard
                            title="Vendas Hoje"
                            value={stats.salesToday}
                            subtitle="Transações"
                            icon={ArrowUpRight}
                        />
                    </div>
                </div>

                {/* 3. Alerts */}
                {stats.lowStock > 0 && (
                    <div onClick={() => navigate('/produtos')} className="cursor-pointer lg:col-span-12 mt-2 lg:mt-0">
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

            {/* Charts and Data Row 1 */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6 mb-6">
                <div className="lg:col-span-8">
                    <div className="mb-0">
                        <ProfitChart />
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <TopDebtorsCard />
                </div>
            </div>

            {/* Data Row 2 */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <RecentMovements movements={recentMovements} />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <BibiInsights />
                    <BestSellers products={bestSellers} />
                </div>
            </div>

            <div className="lg:hidden" data-onboarding="add-movement">
                <FAB onClick={() => navigate('/movimentacoes/nova')} label="Nova Venda" />
            </div>
        </div>
    );
}

