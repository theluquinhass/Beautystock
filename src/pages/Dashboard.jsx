import { useNavigate } from 'react-router-dom';
import Header from '../components/Dashboard/Header';
import StatCard from '../components/Dashboard/StatCard';
import BestSellers from '../components/Dashboard/BestSellers';
import RecentMovements from '../components/Dashboard/RecentMovements';
import FAB from '../components/Dashboard/FAB';
import { Package, TrendingUp, Wallet, ArrowUpRight, Loader2, CircleDollarSign } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import ProfitChart from '../components/ProfitChart';
import TopDebtorsCard from '../components/Dashboard/TopDebtorsCard';
import BibiInsights from '../components/Dashboard/BibiInsights';
import GettingStartedChecklist from '../components/Dashboard/GettingStartedChecklist';
import { useState } from 'react';
import DashboardCategories from '../components/Dashboard/DashboardCategories';
import { usePlan } from '../hooks/usePlan';
import { canRegisterSale } from '../lib/planUtils';
import UpgradeModal from '../components/UpgradeModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const { loading, stats, recentMovements, bestSellers, userName } = useDashboard();
    const { profile, usage, limits } = usePlan();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleNewSale = () => {
        if (!canRegisterSale(profile, usage.monthlySalesCount)) {
            setShowUpgradeModal(true);
            return;
        }
        navigate('/movimentacoes/nova');
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="pb-32 lg:pb-10">
            <div className="lg:hidden relative z-50">
                <Header userName={userName} subtitle="Seu lucro este mês está crescendo! 🚀" />
            </div>

            <GettingStartedChecklist />

            {/* Metrics Row */}
            <div className="flex flex-col gap-4 mb-6 xl:grid xl:grid-cols-12 xl:gap-6">

                {/* 1. HERO METRIC: Receivables (Fiado) */}
                {stats.receivables > 0 && (
                    <div onClick={() => navigate('/clientes')} className="cursor-pointer xl:col-span-3">
                        <StatCard
                            title="A Receber"
                            value={`R$ ${stats.receivables.toFixed(2)}`}
                            subtitle="Clique para cobrar"
                            type="featured"
                            icon={Wallet}
                        />
                    </div>
                )}

                {/* 2. Grid for Core Financials (Lucro & Caixa) */}
                <div className={`grid grid-cols-2 gap-3 lg:gap-6 ${stats.receivables > 0 ? 'xl:col-span-6' : 'xl:col-span-8'}`}>
                    <div className="h-full" data-onboarding="profit-card">
                        <StatCard
                            title="Lucro (Mês)"
                            value={`R$ ${stats.profit.toFixed(2)}`}
                            subtitle="Reflete vendas feitas"
                            type="primary"
                            icon={TrendingUp}
                        />
                    </div>
                    <div className="h-full">
                        <StatCard
                            title="Caixa (Mês)"
                            value={`R$ ${stats.receivedThisMonth.toFixed(2)}`}
                            subtitle="Entradas reais em $$"
                            type="success"
                            icon={CircleDollarSign}
                        />
                    </div>
                </div>

                {/* 3. Vendas Hoje */}
                <div className={`h-full ${stats.receivables > 0 ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                    <StatCard
                        title="Vendas Hoje"
                        value={stats.salesToday}
                        subtitle={`${stats.itemsSoldToday} unid. (${stats.salesToday} vendas)`}
                        icon={ArrowUpRight}
                    />
                </div>
                {/* 4. Alerts */}
                {stats.lowStock > 0 && (
                    <div onClick={() => navigate('/produtos')} className="cursor-pointer xl:col-span-12 mt-2 lg:mt-0">
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
                <div className="lg:col-span-8 h-full">
                    <div className="mb-0 h-full">
                        <ProfitChart />
                    </div>
                </div>
                <div className="lg:col-span-4 h-full">
                    <TopDebtorsCard />
                </div>
            </div>

            {/* Data Row 2 - Movements & Bibi */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6 mb-6">
                <div className="lg:col-span-8 h-full">
                    <RecentMovements movements={recentMovements} />
                </div>
                <div className="lg:col-span-4 h-full">
                    <BibiInsights />
                </div>
            </div>

            {/* Data Row 3 - Best Sellers & Categories */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-8 h-full">
                    <BestSellers products={bestSellers} />
                </div>
                <div className="lg:col-span-4 h-full">
                    <DashboardCategories />
                </div>
            </div>

            <div className="lg:hidden" data-onboarding="add-movement">
                <FAB onClick={handleNewSale} label="Nova Venda" />
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={`${limits?.monthly_sales || 60} vendas no mês`}
                featureName="vendas"
            />
        </div>
    );
}

