import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Edit, Trash, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import CustomerHistory from '../../components/Customers/CustomerHistory';
import PaymentModal from '../../components/Customers/PaymentModal';
import ChargeModal from '../../components/Customers/ChargeModal';
import { getPublicCustomerPhotoUrl } from '../../lib/customerPhotos';
import toast from 'react-hot-toast';

export default function CustomerView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [movements, setMovements] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

    useEffect(() => { fetchCustomerData(); }, [id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            const { data: customerData } = await supabase
                .from('customers').select('*').eq('id', id).single();
            setCustomer(customerData);

            const { data: movementsData } = await supabase
                .from('movements')
                .select(`*, variations(id, name, products(name))`)
                .eq('customer_id', id)
                .order('date', { ascending: false });
            setMovements(movementsData || []);

            const { data: paymentsData } = await supabase
                .from('payments').select('*').eq('customer_id', id).order('date', { ascending: false });
            setPayments(paymentsData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este cliente? Histórico associado pode impedir a exclusão em caso de faturas abertas.')) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('customers').delete().eq('id', id);
            if (error) throw error;
            toast.success('Cliente excluído com sucesso!');
            navigate('/clientes');
        } catch (error) {
            toast.error('Erro ao excluir. O cliente pode ter movimentações registradas.');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !customer) return (
        <div className="h-screen flex items-center justify-center text-primary bg-background">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );

    const totalCredit = movements.filter(m => m.is_on_credit).reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);
    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const debt = totalCredit - totalPaid;

    return (
        <div className="pb-24">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/clientes')}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {customer.photo_path ? (
                        <img
                            src={getPublicCustomerPhotoUrl(customer.photo_path)}
                            alt={customer.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-soft flex-shrink-0"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold shadow-soft flex-shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-foreground leading-tight truncate">{customer.name}</h1>
                </div>

                <button
                    onClick={() => navigate(`/clientes/${id}/editar`)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors bg-card rounded-full shadow-soft border border-border flex-shrink-0"
                >
                    <Edit size={20} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 text-destructive/60 hover:text-destructive transition-colors bg-card rounded-full shadow-soft border border-border hover:bg-destructive/10 flex-shrink-0"
                    title="Excluir Cliente"
                >
                    <Trash size={20} />
                </button>
            </div>

            {/* Debt Card */}
            <Card className="bg-gradient-to-br from-primary to-pink-600 text-white p-6 mb-6 border-0 shadow-pink">
                <p className="text-pink-100 text-sm mb-1">Total Devido</p>
                <div className="text-4xl font-bold mb-4">
                    R$ {debt.toFixed(2)}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white font-semibold py-2 rounded-xl text-sm active:scale-95 transition-all"
                    >
                        Registrar Pagamento
                    </button>
                    {customer.phone && (
                        <button
                            onClick={() => setIsChargeModalOpen(true)}
                            className="flex-1 bg-success text-success-foreground font-semibold py-2 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                        >
                            WhatsApp
                        </button>
                    )}
                </div>
            </Card>

            <h3 className="font-bold text-foreground mb-4 px-1">Histórico</h3>
            <CustomerHistory movements={movements} payments={payments} />

            {isPaymentModalOpen && (
                <PaymentModal
                    customerId={id}
                    debt={debt}
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