import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { CreditCard, ArrowLeft, RefreshCw, Inbox, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const config = {
        approved: { label: 'Aprovado', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'Pendente', icon: Clock, cls: 'bg-amber-100 text-amber-700' },
        rejected: { label: 'Recusado', icon: XCircle, cls: 'bg-rose-100 text-rose-700' },
        cancelled: { label: 'Cancelado', icon: XCircle, cls: 'bg-rose-100 text-rose-700' },
    }[status] || { label: status, icon: Clock, cls: 'bg-gray-100 text-gray-600' };

    const { label, icon: Icon, cls } = config;

    return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', cls)}>
            <Icon size={9} strokeWidth={3} />{label}
        </span>
    );
};

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchPayments(); }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*, profiles:user_id(first_name, last_name, email)')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 sm:p-8 pb-24 max-w-6xl mx-auto min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-400/20 shrink-0">
                        <CreditCard size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Pagamentos</h1>
                        <p className="text-gray-500 font-medium text-sm">Histórico de transações · Asaas</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchPayments}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm"
                    >
                        <RefreshCw size={15} />
                        Atualizar
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-violet-200 hover:text-violet-600 transition-all shadow-sm text-sm"
                    >
                        <ArrowLeft size={15} />
                        Dashboard
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-5 border border-violet-100">
                            <Inbox size={36} className="text-violet-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">Sem pagamentos</h3>
                        <p className="text-gray-400 font-medium text-sm max-w-xs">Nenhum pagamento foi registrado pelo Asaas ainda.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/60">
                                        <th className="px-6 py-4">ID MP</th>
                                        <th className="px-6 py-4">Usuário</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Valor</th>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4 text-right">Ext Ref</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {payments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {String(payment.mp_payment_id || payment.id).substring(0, 10)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{payment.profiles?.first_name} {payment.profiles?.last_name}</p>
                                                <p className="text-gray-400 text-xs">{payment.profiles?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={payment.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-base font-black text-gray-900">R$ {Number(payment.amount || 0).toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium text-sm">
                                                {payment.created_at && format(parseISO(payment.created_at), 'dd/MM/yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg select-all font-mono">
                                                    {payment.external_reference || '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {payments.map(payment => (
                                <div key={payment.id} className="p-5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                            {String(payment.mp_payment_id || payment.id).substring(0, 12)}
                                        </span>
                                        <StatusBadge status={payment.status} />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Valor</p>
                                            <p className="text-2xl font-black text-gray-900">R$ {Number(payment.amount || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Data</p>
                                            <p className="text-sm font-medium text-gray-600">
                                                {payment.created_at && format(parseISO(payment.created_at), 'dd/MM/yyyy HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    {(payment.profiles?.first_name || payment.profiles?.email) && (
                                        <p className="text-xs text-gray-400 font-medium truncate bg-gray-50 rounded-xl px-3 py-2">
                                            {payment.profiles?.first_name} {payment.profiles?.last_name} · {payment.profiles?.email}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
