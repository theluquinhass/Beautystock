import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Crown, ArrowLeft, CalendarPlus, Ban, RefreshCw, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const map = {
        active: { label: 'Ativo', cls: 'bg-emerald-100 text-emerald-700' },
        authorized: { label: 'Autorizado', cls: 'bg-blue-100 text-blue-700' },
        cancelled: { label: 'Cancelado', cls: 'bg-rose-100 text-rose-700' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', cls)}>
            {label}
        </span>
    );
};

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchSubscriptions(); }, []);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*, profiles:user_id(first_name, last_name, email)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setSubscriptions(data || []);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, sub) => {
        const loadingToast = toast.loading('Executando...');
        try {
            if (action === 'renew') {
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 30);
                await supabase.from('subscriptions').update({ current_period_end: newDate.toISOString(), status: 'active' }).eq('id', sub.id);
                await supabase.from('profiles').update({ expires_at: newDate.toISOString(), plan: 'pro' }).eq('id', sub.user_id);
                toast.success('+30 dias adicionados com sucesso!');
            } else if (action === 'expire') {
                await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', sub.id);
                await supabase.from('profiles').update({ expires_at: new Date().toISOString() }).eq('id', sub.user_id);
                toast.success('Assinatura marcada como expirada.');
            }
            fetchSubscriptions();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao executar ação');
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const getInitials = (first = '', last = '') => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';

    return (
        <div className="p-5 sm:p-8 pb-24 max-w-6xl mx-auto min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
                        <Crown size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Assinaturas</h1>
                        <p className="text-gray-500 font-medium text-sm">Gerencie planos e períodos PRO</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchSubscriptions}
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
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl flex items-center justify-center mb-5 border border-amber-100">
                            <Inbox size={36} className="text-amber-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">Sem assinaturas</h3>
                        <p className="text-gray-400 font-medium text-sm max-w-xs">Nenhuma assinatura foi encontrada no sistema ainda.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/60">
                                        <th className="px-6 py-4">Usuário</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Fim do Período</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {subscriptions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-black text-sm shrink-0">
                                                        {getInitials(sub.profiles?.first_name, sub.profiles?.last_name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{sub.profiles?.first_name} {sub.profiles?.last_name}</p>
                                                        <p className="text-gray-400 text-xs">{sub.profiles?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={sub.status} />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700">
                                                {sub.current_period_end ? format(parseISO(sub.current_period_end), 'dd/MM/yyyy HH:mm') : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {sub.is_recurring ? 'Recorrente' : 'Único'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleAction('renew', sub)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-bold"
                                                    >
                                                        <CalendarPlus size={13} /> +30 dias
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction('expire', sub)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors text-xs font-bold"
                                                    >
                                                        <Ban size={13} /> Expirar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {subscriptions.map(sub => (
                                <div key={sub.id} className="p-5 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-black text-base shrink-0">
                                            {getInitials(sub.profiles?.first_name, sub.profiles?.last_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{sub.profiles?.first_name} {sub.profiles?.last_name}</p>
                                            <p className="text-gray-400 text-xs truncate">{sub.profiles?.email}</p>
                                        </div>
                                        <StatusBadge status={sub.status} />
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between text-xs">
                                        <div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fim do Período</p>
                                            <p className="font-bold text-gray-700">{sub.current_period_end ? format(parseISO(sub.current_period_end), 'dd/MM/yyyy') : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tipo</p>
                                            <p className="font-bold text-gray-700">{sub.is_recurring ? 'Recorrente' : 'Único'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction('renew', sub)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-sm">
                                            <CalendarPlus size={14} /> +30 dias
                                        </button>
                                        <button onClick={() => handleAction('expire', sub)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-bold text-sm">
                                            <Ban size={14} /> Expirar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
