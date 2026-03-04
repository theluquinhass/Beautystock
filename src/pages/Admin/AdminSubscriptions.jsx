import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

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
            console.error("Error fetching subscriptions:", error);
            // Ignore if table doesn't exist just show empty
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, sub) => {
        const loadingToast = toast.loading("Executando...");
        try {
            if (action === 'renew') {
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 30);

                await supabase.from('subscriptions').update({ current_period_end: newDate.toISOString(), status: 'active' }).eq('id', sub.id);
                // Also update profile
                await supabase.from('profiles').update({ expires_at: newDate.toISOString(), plan: 'pro' }).eq('id', sub.user_id);

                toast.success("+30 dias adicionados com sucesso!");
            } else if (action === 'expire') {
                await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', sub.id);
                await supabase.from('profiles').update({ expires_at: new Date().toISOString() }).eq('id', sub.user_id);
                toast.success("Assinatura marcada como expirada.");
            }
            fetchSubscriptions();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao executar ação");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    return (
        <div className="p-8 pb-24 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Assinaturas</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 whitespace-nowrap">Usuário</th>
                                <th className="p-4 whitespace-nowrap">Status</th>
                                <th className="p-4 whitespace-nowrap">Fim do Período</th>
                                <th className="p-4 whitespace-nowrap">Tipo</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Carregando assinaturas...</td></tr>
                            ) : subscriptions.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Nenhuma assinatura encontrada.</td></tr>
                            ) : (
                                subscriptions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{sub.profiles?.first_name} {sub.profiles?.last_name}</div>
                                            <div className="text-gray-500 text-xs">{sub.profiles?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-xs font-bold",
                                                sub.status === 'active' || sub.status === 'authorized' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {sub.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {sub.current_period_end ? format(parseISO(sub.current_period_end), 'dd/MM/yyyy HH:mm') : '-'}
                                        </td>
                                        <td className="p-4">
                                            {sub.is_recurring ? 'Recorrente' : 'Pagamento Único'}
                                        </td>
                                        <td className="p-4 text-right flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleAction('renew', sub)}
                                                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium flex items-center gap-1"
                                            >
                                                <CheckCircle size={14} /> +30 dias
                                            </button>
                                            <button
                                                onClick={() => handleAction('expire', sub)}
                                                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center gap-1"
                                            >
                                                <XCircle size={14} /> Expirar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
