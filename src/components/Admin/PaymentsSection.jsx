import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const config = {
        approved: { label: 'Pago', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'Pendente', icon: Clock, cls: 'bg-amber-100 text-amber-700' },
        rejected: { label: 'Falhou', icon: XCircle, cls: 'bg-rose-100 text-rose-700' },
        cancelled: { label: 'Cancelado', icon: XCircle, cls: 'bg-rose-100 text-rose-700' },
    }[status] || { label: status, icon: Clock, cls: 'bg-gray-100 text-gray-600' };

    const { label, icon: Icon, cls } = config;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cls}`}>
            <Icon size={9} strokeWidth={3} />{label}
        </span>
    );
};

export default function PaymentsSection({ payments, loading }) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-5 w-44 bg-gray-100 rounded-lg mb-5" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl w-full" />)}
                </div>
            </div>
        );
    }

    if (!payments || payments.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                        <CreditCard size={16} className="text-violet-500" />
                    </div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Pagamentos Recentes</h3>
                </div>
                <button
                    onClick={() => navigate('/admin/pagamentos')}
                    className="text-xs font-bold text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-1"
                >
                    Ver todos <ArrowRight size={12} />
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50">
                {payments.map((payment, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 flex items-center justify-center shrink-0">
                            <CreditCard size={15} className="text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-gray-900 text-sm leading-tight">R$ {Number(payment.amount || 0).toFixed(2)}</p>
                            <p className="text-gray-400 text-xs font-medium truncate">{(payment.topic || 'payment').toUpperCase()}</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <StatusBadge status={payment.status} />
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {payment.created_at && format(parseISO(payment.created_at), "dd MMM HH:mm", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
