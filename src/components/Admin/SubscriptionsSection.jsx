import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Crown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionsSection({ subscriptions, loading }) {
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

    if (!subscriptions || subscriptions.length === 0) return null;

    return (
        <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Crown size={20} className="text-yellow-500" />
                Assinaturas PRO Recentes
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                            <th className="pb-3 font-semibold">Usuário</th>
                            <th className="pb-3 font-semibold">Email</th>
                            <th className="pb-3 font-semibold">Plano</th>
                            <th className="pb-3 font-semibold">Início</th>
                            <th className="pb-3 font-semibold text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {subscriptions.map((sub, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-bold text-gray-900">{sub.first_name} {sub.last_name}</td>
                                <td className="py-4 text-gray-500">{sub.email}</td>
                                <td className="py-4">
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                                        PRO
                                    </span>
                                </td>
                                <td className="py-4 text-gray-600 font-medium">
                                    {format(parseISO(sub.created_at), "dd MMM yyyy", { locale: ptBR })}
                                </td>
                                <td className="py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/admin/usuarios?search=${sub.email}`)}
                                        className="text-pink-500 hover:text-pink-600 font-bold text-sm inline-flex items-center gap-1 transition-colors"
                                    >
                                        Ver <ExternalLink size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden space-y-3">
                {subscriptions.map((sub, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                PRO PLAN
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                                {format(parseISO(sub.created_at), "dd/MM/yy")}
                            </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base">{sub.first_name} {sub.last_name}</h4>
                        <p className="text-sm text-gray-500 mb-3 truncate">{sub.email}</p>

                        <button
                            onClick={() => navigate(`/admin/usuarios?search=${sub.email}`)}
                            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                            Ver Usuário <ExternalLink size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
