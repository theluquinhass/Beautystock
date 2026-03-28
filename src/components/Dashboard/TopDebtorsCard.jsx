import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import { useCustomerDebt } from '../../hooks/useCustomerDebt';
import ChargeModal from '../Customers/ChargeModal';

const TopDebtorsCard = memo(function TopDebtorsCard() {
    const { user } = useAuth();
    const { isPro } = usePlan();
    const navigate = useNavigate();

    const { customers: allDebtors, loading: debtorsLoading, predictedProfit } = useCustomerDebt();
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const debtors = allDebtors.filter(c => c.debt > 0).slice(0, 3);

    return (
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border h-full flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground">Clientes que mais devem</h3>

            {debtorsLoading ? (
                <div className="space-y-3 animate-pulse flex-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded-2xl" />
                    ))}
                </div>
            ) : debtors.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle size={32} strokeWidth={1.5} className="text-success mb-2" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tudo em dia!</p>
                    <p className="text-xs text-muted-foreground/70">Nenhum cliente com dívida pendente.</p>
                </div>
            ) : (
                <div className="space-y-3 flex-1">
                    {debtors.map((customer) => (
                        <div
                            key={customer.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-2xl hover:bg-accent transition-colors border border-transparent hover:border-primary/10"
                        >
                            <button
                                onClick={() => navigate(`/clientes/${customer.id}`)}
                                className="flex items-center gap-3 text-left hover:opacity-75 active:scale-95 transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground truncate max-w-[120px] underline-offset-2 hover:underline">
                                        {customer.name.split(' ')[0]}
                                    </p>
                                    <p className="text-xs font-semibold text-destructive">
                                        R$ {customer.debt.toFixed(2)}
                                    </p>
                                </div>
                            </button>

                            {/* Botão Cobrar */}
                            <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="
                                    text-[10px] font-black uppercase tracking-wider
                                    px-3 py-1.5 rounded-full
                                    bg-success/15 text-success
                                    border border-success/25
                                    hover:bg-success/25 hover:border-success/40
                                    active:scale-95
                                    transition-all shadow-sm
                                    flex items-center gap-1
                                "
                            >
                                Cobrar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Predicted Profit Footer */}
            <div className="mt-auto pt-3 border-t border-border/50">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-success/70" />
                        <span className="text-[11px] font-medium text-muted-foreground/70 tracking-wide">
                            Lucro previsto total
                        </span>
                    </div>
                    <span className="text-[12px] font-bold text-success/80">
                        R$ {(predictedProfit || 0).toFixed(2).replace('.', ',')}
                    </span>
                </div>
            </div>

            {selectedCustomer && (
                <ChargeModal
                    customer={selectedCustomer}
                    debt={selectedCustomer.debt}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
});

export default TopDebtorsCard;