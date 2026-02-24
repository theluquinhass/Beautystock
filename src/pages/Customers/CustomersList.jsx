import { useState } from 'react';
import { Plus, Search, Wallet, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerCard from '../../components/Customers/CustomerCard';
import FAB from '../../components/Dashboard/FAB';
import StatCard from '../../components/Dashboard/StatCard';
import { useCustomerDebt } from '../../hooks/useCustomerDebt';

export default function CustomersList() {
    const navigate = useNavigate();
    const { customers, loading, totalReceivables } = useCustomerDebt();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Clientes & Fiado</h1>

            {/* Total Goal Card */}
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="input pl-10 w-full shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {filteredCustomers.map(customer => (
                    <CustomerCard key={customer.id} customer={customer} />
                ))}

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Nenhum cliente encontrado.</p>
                        <button
                            onClick={() => navigate('/clientes/novo')}
                            className="mt-4 text-pink-500 font-medium hover:underline"
                        >
                            Cadastrar o primeiro
                        </button>
                    </div>
                )}
            </div>

            <FAB onClick={() => navigate('/clientes/novo')} label="Novo Cliente" />
        </div>
    );
}

