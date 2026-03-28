import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getInitials = (first = '', last = '') => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '??';

export default function SubscriptionsSection({ subscriptions, loading }) {
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

    if (!subscriptions || subscriptions.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Crown size={16} className="text-amber-500" />
                    </div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Assinaturas PRO Recentes</h3>
                </div>
                <button
                    onClick={() => navigate('/admin/assinaturas')}
                    className="text-xs font-bold text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-1"
                >
                    Ver todas <ArrowRight size={12} />
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50">
                {subscriptions.map((sub, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-pink-100 flex items-center justify-center text-amber-700 font-black text-sm shrink-0">
                            {getInitials(sub.first_name, sub.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{sub.first_name} {sub.last_name}</p>
                            <p className="text-gray-400 text-xs truncate">{sub.email}</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                <Crown size={8} />PRO
                            </span>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {format(parseISO(sub.created_at), "dd MMM yy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
