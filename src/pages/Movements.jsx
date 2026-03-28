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

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-primary bg-background">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );

    return (
        <div className="pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Extrato de Movimentações</h1>
            </div>

            <div className="flex flex-col gap-3">
                {movements.map(m => {
                    const isEntry = m.type === 'ENTRY';
                    const productName = m.variations?.products?.name || 'Produto';
                    const variationName = m.variations?.name || '';
                    const clientName = m.customers?.name;
                    const totalValue = (m.unit_price || m.variations?.products?.price || 0) * m.quantity;

                    return (
                        <div
                            key={m.id}
                            className="card p-4 flex justify-between items-center gap-4 hover:border-border-strong hover:shadow-card-hover transition-all"
                        >
                            {/* Ícone + Info */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!isEntry
                                        ? 'bg-success/15 text-success'
                                        : 'bg-destructive/15 text-destructive'
                                    }`}>
                                    {!isEntry
                                        ? <ArrowDownLeft size={20} strokeWidth={2.5} />
                                        : <ArrowUpRight size={20} strokeWidth={2.5} />
                                    }
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                                        {productName}{' '}
                                        <span className="text-muted-foreground font-normal">• {variationName}</span>
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar size={10} />
                                            {format(new Date(m.date), 'dd/MM/yyyy')}
                                        </span>
                                        {clientName && (
                                            <span className="flex items-center gap-1 text-xs text-primary font-medium">
                                                <User size={10} />
                                                {clientName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Valor + badges */}
                            <div className="text-right flex-shrink-0">
                                <div className={`font-bold text-sm ${!isEntry ? 'text-success' : 'text-destructive'}`}>
                                    {!isEntry ? '+' : '-'} R$ {totalValue.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {m.quantity} un
                                </div>
                                {m.is_on_credit && (
                                    <span className="inline-block px-2 py-0.5 bg-destructive/15 text-destructive text-[10px] font-bold rounded-md uppercase mt-1 tracking-wider">
                                        Fiado
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {movements.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
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
        </div>
    );
}