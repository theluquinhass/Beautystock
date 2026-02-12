import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function PaymentModal({ customerId, onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('payments').insert({
                user_id: user.id,
                customer_id: customerId,
                amount: Number(amount),
                date: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Pagamento registrado!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao registrar pagamento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Registrar Pagamento</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input text-xl font-bold text-center h-14"
                            autoFocus
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full h-12 text-lg"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Confirmar Pagamento'}
                    </button>
                </form>
            </div>
        </div>
    );
}
