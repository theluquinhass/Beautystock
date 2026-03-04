import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

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
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-24 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos (Mercado Pago)</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 whitespace-nowrap">ID MP</th>
                                <th className="p-4 whitespace-nowrap">Usuário</th>
                                <th className="p-4 whitespace-nowrap">Status</th>
                                <th className="p-4 whitespace-nowrap">Valor</th>
                                <th className="p-4 whitespace-nowrap">Data</th>
                                <th className="p-4 text-right">Ext Ref</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Carregando pagamentos...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Nenhum pagamento encontrado.</td></tr>
                            ) : (
                                payments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-500">
                                            {payment.mp_payment_id || payment.id}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{payment.profiles?.first_name} {payment.profiles?.last_name}</div>
                                            <div className="text-gray-500 text-xs">{payment.profiles?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-xs font-bold",
                                                payment.status === 'approved' ? "bg-green-100 text-green-700" :
                                                    payment.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {payment.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">
                                            R$ {Number(payment.amount)?.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {payment.created_at && format(parseISO(payment.created_at), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded select-all font-mono">
                                                {payment.external_reference}
                                            </span>
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
