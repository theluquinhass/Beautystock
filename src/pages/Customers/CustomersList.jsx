import { useState } from 'react';
import { Search, Wallet, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerCard from '../../components/Customers/CustomerCard';
import FAB from '../../components/Dashboard/FAB';
import StatCard from '../../components/Dashboard/StatCard';
import { useCustomerDebt } from '../../hooks/useCustomerDebt';
import { usePlan } from '../../hooks/usePlan';
import { canAddCustomer } from '../../lib/planUtils';
import UpgradeModal from '../../components/UpgradeModal';

export default function CustomersList() {
    const navigate = useNavigate();
    const { profile, isPro, usage, limits } = usePlan();
    const { customers, loading, totalReceivables } = useCustomerDebt();
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleNewCustomer = () => {
        if (!canAddCustomer(profile, usage.customersCount)) {
            setShowUpgradeModal(true);
            return;
        }
        navigate('/clientes/novo');
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-primary bg-background">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );

    return (
        <div className="pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-foreground">Clientes & Fiado</h1>
                {!isPro && (
                    <span className="text-[10px] font-bold bg-accent text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {usage.customersCount}/{limits?.customers || 15} Clientes
                    </span>
                )}
            </div>

            {/* Total a Receber */}
            {totalReceivables > 0 && (
                <div className="mb-6">
                    <StatCard
                        title="Total para Receber"
                        value={`R$ ${totalReceivables.toFixed(2)}`}
                        subtitle="Dinheiro na rua"
                        type="featured"
                        icon={Wallet}
                    />
                </div>
            )}

            {/* Search Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-2 shadow-soft -mx-4 px-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="input pl-10 w-full shadow-soft"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-2">
                {filteredCustomers.map(customer => (
                    <CustomerCard key={customer.id} customer={customer} />
                ))}

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
                        <button
                            onClick={handleNewCustomer}
                            className="mt-4 text-primary font-medium hover:underline"
                        >
                            Cadastrar o primeiro
                        </button>
                    </div>
                )}
            </div>

            <FAB onClick={handleNewCustomer} label="Novo Cliente" />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={`${limits?.customers || 15} clientes`}
                featureName="clientes"
            />
        </div>
    );
}