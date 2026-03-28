import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { X, Loader2, CheckCheck } from 'lucide-react';

// ⚠️ Adicione `debt` na chamada em CustomerView.jsx:
// <PaymentModal customerId={id} debt={debt} onClose={...} onSuccess={...} />

export default function PaymentModal({ customerId, debt = 0, onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const numAmount = Number(amount) || 0;
    const overLimit = numAmount > debt;
    const isValid = numAmount > 0 && !overLimit;

    const handlePayAll = () => setAmount(debt.toFixed(2));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('payments').insert({
                user_id: user.id,
                customer_id: customerId,
                amount: numAmount,
                date: new Date().toISOString()
            });
            if (error) throw error;
            toast.success('Pagamento registrado!');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Erro ao registrar pagamento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-soft border border-border animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-foreground">Registrar Pagamento</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Saldo devedor */}
                <p className="text-sm text-muted-foreground mb-5">
                    Dívida atual:{' '}
                    <span className="font-bold text-destructive">R$ {debt.toFixed(2)}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Valor a pagar (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={debt}
                            className={`input text-xl font-bold text-center h-14 w-full transition-all ${overLimit
                                    ? 'border-destructive ring-2 ring-destructive/30'
                                    : numAmount > 0 && numAmount === debt
                                        ? 'border-success ring-2 ring-success/20'
                                        : ''
                                }`}
                            autoFocus
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />

                        {overLimit && (
                            <p className="text-xs text-destructive font-medium mt-1.5 ml-1">
                                Valor maior que a dívida (R$ {debt.toFixed(2)}).
                            </p>
                        )}
                    </div>

                    {/* Atalho pagar tudo */}
                    {debt > 0 && numAmount !== debt && (
                        <button
                            type="button"
                            onClick={handlePayAll}
                            className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl border border-success/30 bg-success/10 text-success text-sm font-bold hover:bg-success/20 transition-colors"
                        >
                            <CheckCheck size={16} />
                            Pagar tudo — R$ {debt.toFixed(2)}
                        </button>
                    )}

                    {/* Confirmação quando vai quitar */}
                    {numAmount === debt && debt > 0 && (
                        <div className="flex items-center gap-2 py-2.5 mb-4 px-3 rounded-xl bg-success/10 border border-success/20">
                            <CheckCheck size={16} className="text-success flex-shrink-0" />
                            <p className="text-xs text-success font-medium">Dívida será quitada por completo!</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full h-12 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !isValid}
                    >
                        {loading
                            ? <><Loader2 size={18} className="animate-spin" /> Registrando...</>
                            : 'Confirmar Pagamento'
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}