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

    // We show loading state based on actual data fetching
    const loading = debtorsLoading;

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
