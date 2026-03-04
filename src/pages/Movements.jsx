import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Calendar, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FAB from '../components/Dashboard/FAB';
import { useMovements } from '../hooks/useMovements';
import { usePlan } from '../hooks/usePlan';
import { canRegisterSale } from '../lib/planUtils';
import UpgradeModal from '../components/UpgradeModal';

export default function Movements() {
    const navigate = useNavigate();
    const { movements, loading } = useMovements();
    const { profile, isPro, usage, limits } = usePlan();
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
        <div className="pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Extrato de Movimentações</h1>
                {!isPro && (
                    <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                        {usage.monthlySalesCount}/{limits?.monthly_sales || 60} Vendas/Mês
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {movements.map(m => {
                    const isEntry = m.type === 'ENTRY';
                    const productName = m.variations?.products?.name || 'Produto';
                    const variationName = m.variations?.name || '';
                    const clientName = m.customers?.name;
                    // Fallback price if unit_price is null (for old records)
                    const totalValue = (m.unit_price || m.variations?.products?.price || 0) * m.quantity;

                    return (
                        <div key={m.id} className="card p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!isEntry ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {!isEntry ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                        {productName} <span className="text-gray-400 font-normal">• {variationName}</span>
                                    </h3>
                                    <div className="flex flex-col mt-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} />
                                                {format(new Date(m.date), 'dd/MM/yyyy')}
                                            </span>
                                            {clientName && (
                                                <span className="flex items-center gap-1 text-pink-500 font-medium">
                                                    <User size={10} />
                                                    {clientName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`font-bold ${!isEntry ? 'text-green-600' : 'text-red-500'}`}>
                                    {!isEntry ? '+' : '-'} R$ {totalValue.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {m.quantity} un
                                </div>
                                {m.is_on_credit && (
                                    <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase mt-1">
                                        Fiado
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {movements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Nenhuma movimentação registrada.
                    </div>
                )}
            </div>

            <FAB onClick={handleNewSale} label="Nova Venda" />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={`${limits?.monthly_sales || 60} vendas no mês`}
                featureName="vendas"
            />
        </div >
    );
}

