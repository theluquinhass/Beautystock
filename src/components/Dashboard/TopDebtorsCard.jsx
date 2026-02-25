import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Crown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { useCustomerDebt } from '../../hooks/useCustomerDebt';
import ChargeModal from '../Customers/ChargeModal';
import { cn } from '../../lib/utils';

export default function TopDebtorsCard() {
    const { user } = useAuth();
    const { isPro } = usePlan();
    const navigate = useNavigate();

    // Custom Hook brings dynamically calculated debts
    const { customers: allDebtors, loading: debtorsLoading } = useCustomerDebt();

    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Get Top 3 Debtors
    const debtors = allDebtors.filter(c => c.debt > 0).slice(0, 3);

    // We only show loading state if PRO is active to prevent unnecesssary flashes for Free tier
    const loading = isPro ? debtorsLoading : false;

    if (!isPro) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 relative overflow-hidden mb-8 group">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:bg-white/60">
                    <div className="bg-pink-100 p-4 rounded-full mb-4 shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-pulse">
                        <Lock className="text-pink-500 animate-bounce" size={28} />
                    </div>
                    <h3 className="text-gray-800 font-extrabold mb-2 text-xl tracking-tight">Cobre quem te deve. 💸</h3>
                    <p className="text-gray-600 text-sm font-medium mb-6 max-w-[280px] leading-relaxed">
                        Pare de perder dinheiro e esquecer dívidas. A Bibi rastreia automaticamente clientes devedores e te ajuda a cobrar com 1 clique.
                    </p>
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center justify-center gap-2 w-full max-w-[240px] bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-pink-500/30 transition-all hover:-translate-y-1 active:scale-95 border border-pink-400/50"
                    >
                        <Crown size={18} className="text-yellow-300 fill-yellow-300" />
                        Desbloquear PRO
                    </button>
                </div>

                {/* Blurred Content (Fake List) */}
                <div className="opacity-40 pointer-events-none filter blur-sm select-none">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Clientes que mais devem</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Maria C.', debt: 'R$ 245,00', color: 'bg-rose-100 text-rose-600' },
                            { name: 'Ana B.', debt: 'R$ 180,00', color: 'bg-purple-100 text-purple-600' },
                            { name: 'Juliana T.', debt: 'R$ 95,50', color: 'bg-emerald-100 text-emerald-600' }
                        ].map((mock, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${mock.color}`}>
                                        {mock.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">{mock.name}</div>
                                        <div className="text-xs font-bold text-red-500">{mock.debt}</div>
                                    </div>
                                </div>
                                <div className="bg-green-100 text-green-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-full">
                                    Cobrar
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Clientes que mais devem</h3>

            {loading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-50 rounded-2xl"></div>
                    ))}
                </div>
            ) : debtors.length === 0 ? (
                <div className="bg-green-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <AlertCircle size={24} />
                    </div>
                    <p className="text-sm font-bold text-green-800 mb-1">Tudo em dia!</p>
                    <p className="text-xs text-green-600">Nenhum cliente com dívida pendente.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {debtors.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-pink-50/30 transition-colors border border-transparent hover:border-pink-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{customer.name.split(' ')[0]}</p>
                                    <p className="text-xs font-semibold text-red-500">R$ {customer.debt.toFixed(2)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-[10px] bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold hover:bg-green-200 active:scale-95 transition-all shadow-sm flex items-center gap-1 uppercase"
                            >
                                Cobrar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedCustomer && (
                <ChargeModal
                    customer={selectedCustomer}
                    debt={selectedCustomer.debt}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
}
