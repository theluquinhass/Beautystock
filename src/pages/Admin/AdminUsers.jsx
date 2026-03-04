import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, MoreVertical, ShieldAlert, SkipBack, ZapOff, CheckCircle2, ShieldBan, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all'); // all, free, pro
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, expired

    // Pagination (Server side)
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    const [actionUser, setActionUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, planFilter, statusFilter, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (searchTerm) {
                query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }
            if (planFilter !== 'all') {
                query = query.eq('plan', planFilter);
            }
            if (statusFilter === 'expired') {
                query = query.lt('expires_at', new Date().toISOString());
            } else if (statusFilter === 'active') {
                query = query.or(`expires_at.gte.${new Date().toISOString()},expires_at.is.null`);
            }

            const { data, count, error } = await query
                .range((page - 1) * LIMIT, page * LIMIT - 1);

            if (error) throw error;
            setUsers(data || []);
            setTotal(count || 0);

        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Erro ao buscar usuários");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType, userId) => {
        const loadingToast = toast.loading("Executando...");
        setActionUser(null);
        try {
            if (actionType === 'grant-pro') {
                const { error } = await supabase.functions.invoke('admin-grant-pro', {
                    body: { target_user_id: userId, days: 30 }
                });
                if (error) throw error;
                toast.success("PRO ativado com sucesso!");
            } else if (actionType === 'revoke-pro') {
                const { error } = await supabase.functions.invoke('admin-revoke-pro', {
                    body: { target_user_id: userId }
                });
                if (error) throw error;
                toast.success("PRO revogado com sucesso!");
            } else if (actionType === 'reset-onboarding') {
                const { error } = await supabase.from('profiles').update({ onboarding_completed: false }).eq('id', userId);
                if (error) throw error;
                toast.success("Onboarding resetado!");
            } else if (actionType === 'block-user') {
                const { error } = await supabase.functions.invoke('admin-block-user', {
                    body: { target_user_id: userId, block: true }
                });
                if (error) throw error;
                toast.success("Usuário bloqueado!");
            } else if (actionType === 'unblock-user') {
                const { error } = await supabase.functions.invoke('admin-block-user', {
                    body: { target_user_id: userId, block: false }
                });
                if (error) throw error;
                toast.success("Usuário desbloqueado!");
            }
            fetchUsers();
        } catch (error) {
            console.error("Action error:", error);
            toast.error("Falha ao executar ação: " + error.message);
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    return (
        <div className="p-8 pb-24 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Controle de Usuários</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Actions */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <select
                            value={planFilter}
                            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
                        >
                            <option value="all">Todos os Planos</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativos</option>
                            <option value="expired">Expirados</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 whitespace-nowrap">Usuário</th>
                                <th className="p-4 whitespace-nowrap">Plano</th>
                                <th className="p-4 whitespace-nowrap">Vencimento</th>
                                <th className="p-4 whitespace-nowrap">Cadastro</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Carregando usuários...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Nenhum usuário encontrado.</td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isExpired = u.expires_at && new Date(u.expires_at) < new Date();
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900">{u.first_name || ''} {u.last_name || ''}</div>
                                                <div className="text-gray-500 text-xs">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-md text-xs font-bold",
                                                    u.plan === 'pro' ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700"
                                                )}>
                                                    {u.plan?.toUpperCase()} {u.is_recurring && '🔄'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {u.expires_at ? (
                                                    <div className={cn("text-xs font-medium", isExpired ? "text-red-600" : "text-gray-700")}>
                                                        {format(parseISO(u.expires_at), 'dd/MM/yyyy')}
                                                        {isExpired && <span className="ml-1 text-[10px] bg-red-100 px-1 py-0.5 rounded">Expirado</span>}
                                                    </div>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {format(parseISO(u.created_at), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="p-4 text-right relative">
                                                <button
                                                    onClick={() => setActionUser(actionUser === u.id ? null : u.id)}
                                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Actions Dropdown */}
                                                {actionUser === u.id && (
                                                    <div className="absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-20 text-left">
                                                        <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-b border-gray-100">
                                                            <span className="text-xs font-bold text-gray-500">Ações Admin</span>
                                                            <button onClick={() => setActionUser(null)}><X size={14} className="text-gray-400" /></button>
                                                        </div>
                                                        <button onClick={() => handleAction('grant-pro', u.id)} className="w-full px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 flex items-center gap-2">
                                                            <CheckCircle2 size={14} /> Dar PRO 30 dias
                                                        </button>
                                                        <button onClick={() => handleAction('revoke-pro', u.id)} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <ZapOff size={14} /> Revogar PRO
                                                        </button>
                                                        <button onClick={() => handleAction('reset-onboarding', u.id)} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <SkipBack size={14} /> Resetar Onboarding
                                                        </button>
                                                        <button onClick={() => handleAction('block-user', u.id)} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1">
                                                            <ShieldBan size={14} /> Bloquear Usuário
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>Mostrando {Math.min(LIMIT, users.length)} de {total}</div>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                        <button disabled={page * LIMIT >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Próxima</button>
                    </div>
                </div>
            </div>

            {/* Click outside to close actions */}
            {actionUser && <div className="fixed inset-0 z-10" onClick={() => setActionUser(null)}></div>}
        </div>
    );
}
