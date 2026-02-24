import { Link } from 'react-router-dom';
import { PlusCircle, PackagePlus, Users, TrendingUp, Wallet, Banknote } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useCustomerDebt } from '../../hooks/useCustomerDebt';
import TopDebtorsCard from '../Dashboard/TopDebtorsCard';

export default function SidePanel() {
    const { stats } = useDashboard();
    const { totalReceivables } = useCustomerDebt();

    const profit = stats?.profit || 0;
    const salesToday = stats?.salesToday || 0;
    const receivables = totalReceivables || 0;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-700">

            {/* Boas-vindas / Logo Desk */}
            <div className="px-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Beauty<span className="text-pink-500">Stock</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">Gestão inteligente para o seu negócio</p>
            </div>

            {/* Atalhos Rápidos */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-soft border border-white">
                <h3 className="font-bold text-gray-800 mb-5 text-[11px] uppercase tracking-[0.15em]">Atalhos Rápidos</h3>
                <div className="grid grid-cols-3 gap-4">
                    <Link to="/movimentacoes/nova" className="flex flex-col items-center justify-center p-4 bg-pink-50/50 rounded-2xl hover:bg-pink-100/80 transition-all hover:shadow-sm hover:-translate-y-0.5 group border border-pink-100/50">
                        <PlusCircle size={22} strokeWidth={2.5} className="text-pink-500 mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-pink-700 text-center uppercase tracking-wide">Nova<br />Venda</span>
                    </Link>
                    <Link to="/produtos/novo" className="flex flex-col items-center justify-center p-4 bg-purple-50/50 rounded-2xl hover:bg-purple-100/80 transition-all hover:shadow-sm hover:-translate-y-0.5 group border border-purple-100/50">
                        <PackagePlus size={22} strokeWidth={2.5} className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-purple-700 text-center uppercase tracking-wide">Novo<br />Produto</span>
                    </Link>
                    <Link to="/clientes" className="flex flex-col items-center justify-center p-4 bg-blue-50/50 rounded-2xl hover:bg-blue-100/80 transition-all hover:shadow-sm hover:-translate-y-0.5 group border border-blue-100/50">
                        <Users size={22} strokeWidth={2.5} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-blue-700 text-center uppercase tracking-wide">Lista de<br />Clientes</span>
                    </Link>
                </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-soft border border-white">
                <h3 className="font-bold text-gray-800 mb-5 text-[11px] uppercase tracking-[0.15em]">Resumo Financeiro</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <TrendingUp size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-semibold text-gray-600 text-sm">Lucro (Mês)</span>
                        </div>
                        <span className="font-black text-gray-800 text-lg tracking-tight">R$ {profit.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                <Banknote size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-semibold text-gray-600 text-sm">Vendas (Hoje)</span>
                        </div>
                        <span className="font-black text-gray-800 text-lg">{salesToday}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                <Wallet size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-semibold text-gray-600 text-sm">A Receber</span>
                        </div>
                        <span className="font-black text-orange-600 text-lg tracking-tight">R$ {receivables.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Top Devedores */}
            <div className="w-full">
                <TopDebtorsCard />
            </div>

        </div>
    );
}
