import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentsSection({ payments, loading }) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-6 w-48 bg-gray-100 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl w-full"></div>)}
                </div>
            </div>
        );
    }

    if (!payments || payments.length === 0) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">Pago</span>;
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">Pendente</span>;
            case 'rejected':
            case 'cancelled':
                return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">Falhou</span>;
            default:
                return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">{status}</span>;
        }
    };

    return (
        <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-500" />
                Pagamentos Recentes
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                            <th className="pb-3 font-semibold">Usuário (ID)</th>
                            <th className="pb-3 font-semibold">Valor</th>
                            <th className="pb-3 font-semibold">Tópico</th>
                            <th className="pb-3 font-semibold">Data</th>
                            <th className="pb-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {payments.map((payment, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-bold text-gray-900 truncate max-w-[150px]" title={payment.user_id}>
                                    {payment.user_id.substring(0, 8)}...
                                </td>
                                <td className="py-4 font-black text-gray-800">
                                    R$ {Number(payment.amount || 0).toFixed(2)}
                                </td>
                                <td className="py-4 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    {payment.topic || 'payment'}
                                </td>
                                <td className="py-4 text-gray-600 font-medium">
                                    {format(parseISO(payment.created_at), "dd MMM HH:mm", { locale: ptBR })}
                                </td>
                                <td className="py-4 text-right">
                                    {getStatusBadge(payment.status)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden space-y-3">
                {payments.map((payment, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                {payment.topic || 'payment'}
                            </span>
                            {getStatusBadge(payment.status)}
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Valor</p>
                                <p className="text-xl font-black text-gray-900">R$ {Number(payment.amount || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Data</p>
                                <p className="text-sm font-medium text-gray-600">
                                    {format(parseISO(payment.created_at), "dd/MM HH:mm")}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate('/admin/pagamentos')}
                    className="text-gray-500 hover:text-pink-500 font-bold text-sm transition-colors border-b border-dashed border-gray-300 hover:border-pink-300 pb-0.5"
                >
                    Ver todos os pagamentos
                </button>
            </div>
        </div>
    );
}
