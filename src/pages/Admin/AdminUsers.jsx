import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import AdminUsersHeader from '../../components/Admin/Users/AdminUsersHeader';
import AdminUsersKPIs from '../../components/Admin/Users/AdminUsersKPIs';
import AdminUsersFilters from '../../components/Admin/Users/AdminUsersFilters';
import AdminUsersList from '../../components/Admin/Users/AdminUsersList';
import UserDetailsModal from '../../components/Admin/Users/UserDetailsModal';

export default function AdminUsers() {
    // Data State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ total: 0, pro: 0, expiringSoon: 0, expired: 0 });

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('all'); // all, free, pro
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, expired, pending, blocked
    const [expirationFilter, setExpirationFilter] = useState('all'); // all, 7days, 15days, 30days
    const [activeKpiFilter, setActiveKpiFilter] = useState('all');

    // UI State
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [actionUser, setActionUser] = useState(null); // ID of user with open actions menu
    const [detailsUser, setDetailsUser] = useState(null); // Full user object for details modal

    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    // Debounce search term to prevent rapid querying
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
        fetchKPIs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, planFilter, statusFilter, expirationFilter]);

    const fetchKPIs = async () => {
        try {
            // Count queries
            const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: pro } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro');

            const now = new Date();
            const in7Days = new Date();
            in7Days.setDate(in7Days.getDate() + 7);

            const { count: expiringSoon } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('expires_at', now.toISOString())
                .lte('expires_at', in7Days.toISOString());

            const { count: expired } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .not('expires_at', 'is', null)
                .lt('expires_at', now.toISOString());

            setKpis({
                total: total || 0,
                pro: pro || 0,
                expiringSoon: expiringSoon || 0,
                expired: expired || 0
            });
        } catch (err) {
            console.error("Error fetching admin KPIs:", err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            // Apply Search
            if (searchTerm) {
                query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            // Apply Filters
            if (planFilter !== 'all') {
                query = query.eq('plan', planFilter);
            }

            const now = new Date();
            if (statusFilter === 'active') {
                query = query.or(`expires_at.gte.${now.toISOString()},expires_at.is.null`);
            } else if (statusFilter === 'expired') {
                query = query.lt('expires_at', now.toISOString());
            } else if (statusFilter === 'blocked') {
                query = query.eq('status', 'blocked');
            }

            if (expirationFilter !== 'all') {
                const futureDate = new Date();
                if (expirationFilter === '7days') futureDate.setDate(futureDate.getDate() + 7);
                if (expirationFilter === '15days') futureDate.setDate(futureDate.getDate() + 15);
                if (expirationFilter === '30days') futureDate.setDate(futureDate.getDate() + 30);

                query = query.gt('expires_at', now.toISOString()).lte('expires_at', futureDate.toISOString());
            }

            // Execute
            const { data, count, error } = await query
                .range((page - 1) * LIMIT, page * LIMIT - 1);

            if (error) throw error;
            setUsers(data || []);
            setTotal(count || 0);

        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Erro ao buscar lista de usuários");
        } finally {
            setLoading(false);
        }
    };

    const handleKpiClick = (kpiId) => {
        setActiveKpiFilter(kpiId);
        setPage(1);

        // Reset all normal filters when clicking a KPI card
        setSearchTerm('');
        setPlanFilter('all');
        setStatusFilter('all');
        setExpirationFilter('all');

        // Apply specific KPI filter combos
        if (kpiId === 'pro') {
            setPlanFilter('pro');
        } else if (kpiId === 'expiring') {
            setExpirationFilter('7days');
        } else if (kpiId === 'expired') {
            setStatusFilter('expired');
        }
        // fetchUsers is triggered by effect on filters change
    };

    const handleClearFilters = () => {
        setPlanFilter('all');
        setStatusFilter('all');
        setExpirationFilter('all');
        setActiveKpiFilter('all');
        setSearchTerm('');
        setPage(1);
    };

    const handleAction = async (actionType, userId) => {
        const loadingToast = toast.loading("Aplicando modificações ao usuário...");
        try {
            if (actionType === 'grant-pro') {
                const { error } = await supabase.functions.invoke('admin-grant-pro', { body: { target_user_id: userId, days: 30 } });
                if (error) throw error;
                toast.success("Plano PRO (30 dias) ativado com sucesso!");
            } else if (actionType === 'revoke-pro') {
                const { error } = await supabase.functions.invoke('admin-revoke-pro', { body: { target_user_id: userId } });
                if (error) throw error;
                toast.success("Acesso PRO revogado!");
            } else if (actionType === 'block-user') {
                const { error } = await supabase.functions.invoke('admin-block-user', { body: { target_user_id: userId, block: true } });
                if (error) throw error;
                toast.success("Usuário foi bloqueado no sistema.");
            } else if (actionType === 'reset-onboarding') {
                const { error } = await supabase.from('profiles').update({ onboarding_completed: false }).eq('id', userId);
                if (error) throw error;
                toast.success("Onboarding do usuário foi resetado.");
            }

            // Refresh data
            fetchUsers();
            fetchKPIs();

            // Auto close details modal if open
            if (detailsUser && detailsUser.id === userId) {
                setDetailsUser(null);
            }

        } catch (error) {
            console.error("Action error:", error);
            toast.error("Falha na operação: " + error.message);
        } finally {
            toast.dismiss(loadingToast);
            setActionUser(null);
        }
    };

    const handleExportCSV = () => {
        // Simple CSV export of current view
        if (!users.length) return toast.error("Não há dados para exportar");

        const headers = ["ID", "Nome", "Email", "Plano", "Vencimento", "Cadastro"];
        const csvRows = users.map(u => [
            u.id,
            `"${u.first_name} ${u.last_name}"`,
            u.email,
            u.plan || 'free',
            u.expires_at ? format(new Date(u.expires_at), 'yyyy-MM-dd') : '',
            u.created_at ? format(new Date(u.created_at), 'yyyy-MM-dd') : ''
        ]);

        const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `beautystock_users_${format(new Date(), 'ddMMyyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exportado com sucesso!");
    };

    return (
        <div className="p-4 sm:p-8 pb-32 max-w-7xl mx-auto min-h-screen relative" onClick={() => setActionUser(null)}>

            <AdminUsersHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onExport={handleExportCSV}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            />

            <AdminUsersKPIs
                kpis={kpis}
                activeFilter={activeKpiFilter}
                onKpiClick={handleKpiClick}
            />

            {/* White container for Desktop filters and List */}
            <div className="bg-transparent sm:bg-white sm:rounded-3xl sm:shadow-sm sm:border sm:border-gray-100 flex flex-col sm:p-2 overflow-hidden mb-6">

                <div className="px-4 py-3 border-b border-gray-100 hidden sm:block bg-gray-50/50 rounded-t-2xl">
                    <AdminUsersFilters
                        planFilter={planFilter}
                        setPlanFilter={(v) => { setPlanFilter(v); setPage(1); setActiveKpiFilter('all'); }}
                        statusFilter={statusFilter}
                        setStatusFilter={(v) => { setStatusFilter(v); setPage(1); setActiveKpiFilter('all'); }}
                        expirationFilter={expirationFilter}
                        setExpirationFilter={(v) => { setExpirationFilter(v); setPage(1); setActiveKpiFilter('all'); }}
                        onClearFilters={handleClearFilters}
                        isMobileOpen={isMobileFiltersOpen}
                        onCloseMobile={() => setIsMobileFiltersOpen(false)}
                    />
                </div>

                {/* The Mobile filters component manages its own mobile bottom sheet logic based on isMobileFiltersOpen */}
                <div className="sm:hidden">
                    <AdminUsersFilters
                        planFilter={planFilter}
                        setPlanFilter={(v) => { setPlanFilter(v); setPage(1); setActiveKpiFilter('all'); }}
                        statusFilter={statusFilter}
                        setStatusFilter={(v) => { setStatusFilter(v); setPage(1); setActiveKpiFilter('all'); }}
                        expirationFilter={expirationFilter}
                        setExpirationFilter={(v) => { setExpirationFilter(v); setPage(1); setActiveKpiFilter('all'); }}
                        onClearFilters={handleClearFilters}
                        isMobileOpen={isMobileFiltersOpen}
                        onCloseMobile={() => setIsMobileFiltersOpen(false)}
                    />
                </div>

                <div className="sm:mt-0 mt-2">
                    <AdminUsersList
                        users={users}
                        loading={loading}
                        actionUser={actionUser}
                        setActionUser={setActionUser}
                        onAction={(type, id) => {
                            // Don't auto-stop propagation here, the list does it
                            handleAction(type, id);
                        }}
                        onViewDetails={setDetailsUser}
                    />
                </div>
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-sm font-bold text-gray-500 text-center sm:text-left">
                        Mostrando <span className="text-gray-900">{Math.min(page * LIMIT, total)}</span> de <span className="text-gray-900">{total}</span> usuários
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm text-sm"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page * LIMIT >= total}
                            onClick={() => setPage(page + 1)}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm text-sm"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}

            {/* Sub-modals */}
            <UserDetailsModal
                user={detailsUser}
                onClose={() => setDetailsUser(null)}
                onAction={(type) => handleAction(type, detailsUser.id)}
            />
        </div>
    );
}
