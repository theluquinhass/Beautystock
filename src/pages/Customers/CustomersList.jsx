import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Dashboard/Header';
import CustomerCard from '../../components/Customers/CustomerCard';
import FAB from '../../components/Dashboard/FAB';
import StatCard from '../../components/Dashboard/StatCard';

export default function CustomersList() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalReceivables, setTotalReceivables] = useState(0);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // PARALLEL FETCH for performance
            const [
                { data: customersData },
                { data: creditMovements },
                { data: payments }
            ] = await Promise.all([
                supabase.from('customers').select('*').eq('user_id', user.id),
                supabase.from('movements').select('customer_id, quantity, unit_price').eq('user_id', user.id).eq('is_on_credit', true),
                supabase.from('payments').select('customer_id, amount').eq('user_id', user.id)
            ]);

            // Calculate Debt per Customer
            const customersWithDebt = customersData?.map(c => {
                const customerCredits = creditMovements?.filter(m => m.customer_id === c.id) || [];
                const customerPayments = payments?.filter(p => p.customer_id === c.id) || [];

                const totalCredit = customerCredits.reduce((acc, curr) => acc + (curr.quantity * (curr.unit_price || 0)), 0);
                const totalPaid = customerPayments.reduce((acc, curr) => acc + curr.amount, 0);
                const debt = totalCredit - totalPaid;

                return { ...c, debt };
            }) || [];

            // Sort by Debt DESC (Biggest debtors first)
            customersWithDebt.sort((a, b) => b.debt - a.debt);

            // Calculate Total Receivables
            const total = customersWithDebt.reduce((acc, c) => acc + (c.debt > 0 ? c.debt : 0), 0);
            setTotalReceivables(total);

            setCustomers(customersWithDebt);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 animate-pulse">Carregando lista...</div>;

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
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-2">
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

            <FAB onClick={() => navigate('/clientes/novo')} />
        </div>
    );
}
