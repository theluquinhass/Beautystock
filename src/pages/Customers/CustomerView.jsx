import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Edit, Wallet } from 'lucide-react';
import { Card } from '../../components/ui/card';
import CustomerHistory from '../../components/Customers/CustomerHistory';
import PaymentModal from '../../components/Customers/PaymentModal';
import ChargeModal from '../../components/Customers/ChargeModal';
import { getPublicCustomerPhotoUrl } from '../../lib/customerPhotos';

export default function CustomerView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [movements, setMovements] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            // 1. Customer
            const { data: customerData } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();
            setCustomer(customerData);

            // 2. Movements (Credit)
            // To show ALL history we might want credit and non-credit? Usually "Customers" module focuses on debt.
            // Let's show all sales to this customer for context.
            const { data: movementsData } = await supabase
                .from('movements')
                .select(`
                    *,
                    variations (
                        id,
                        name,
                        products ( name )
                    )
                `)
                .eq('customer_id', id)
                .order('date', { ascending: false });
            setMovements(movementsData || []);

            // 3. Payments
            const { data: paymentsData } = await supabase
                .from('payments')
                .select('*')
                .eq('customer_id', id)
                .order('date', { ascending: false });
            setPayments(paymentsData || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !customer) return <div>Carregando...</div>;

    // Calc Debt
    const totalCredit = movements
        .filter(m => m.is_on_credit)
        .reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);
    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const debt = totalCredit - totalPaid;

    return (
        <div className="pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/clientes')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-3 flex-1">
                    {customer.photo_path ? (
                        <img
                            src={getPublicCustomerPhotoUrl(customer.photo_path)}
                            alt={customer.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-primary font-bold shadow-sm">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-gray-800 leading-tight">{customer.name}</h1>
                </div>
                <button onClick={() => navigate(`/clientes/${id}/editar`)} className="p-2 text-gray-500 hover:text-primary transition-colors bg-white rounded-full shadow-sm border border-gray-100">
                    <Edit size={20} />
                </button>
            </div>

            {/* Debt Card */}
            <Card className="bg-gradient-to-br from-primary to-pink-600 text-white p-6 mb-6">
                <p className="text-pink-100 text-sm mb-1">Total Devido</p>
                <div className="text-4xl font-bold mb-4">
                    R$ {debt.toFixed(2)}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="flex-1 bg-white text-primary font-semibold py-2 rounded-xl text-sm hover:bg-gray-50 active:scale-95 transition-transform"
                    >
                        Registrar Pagamento
                    </button>
                    {customer.phone && (
                        <button
                            onClick={() => setIsChargeModalOpen(true)}
                            className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-xl text-sm hover:bg-green-600 active:scale-95 transition-transform"
                        >
                            WhatsApp
                        </button>
                    )}
                </div>
            </Card>

            <h3 className="font-bold text-gray-800 mb-4 px-1">Histórico</h3>
            <CustomerHistory movements={movements} payments={payments} />

            {isPaymentModalOpen && (
                <PaymentModal
                    customerId={id}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={fetchCustomerData}
                />
            )}

            {isChargeModalOpen && (
                <ChargeModal
                    customer={customer}
                    debt={debt}
                    onClose={() => setIsChargeModalOpen(false)}
                />
            )}
        </div>
    );
}
