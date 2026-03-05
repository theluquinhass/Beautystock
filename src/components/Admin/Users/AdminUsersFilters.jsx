import React from 'react';
import { Filter, X } from 'lucide-react';

export default function AdminUsersFilters({
    planFilter,
    setPlanFilter,
    statusFilter,
    setStatusFilter,
    expirationFilter,
    setExpirationFilter,
    onClearFilters,
    isMobileOpen,
    onCloseMobile
}) {
    // Desktop View
    const desktopFilters = (
        <div className="hidden sm:flex items-center gap-3">
            <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm transition-all"
            >
                <option value="all">Plano: Todos</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
            </select>

            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm transition-all"
            >
                <option value="all">Status: Todos</option>
                <option value="active">Ativos</option>
                <option value="expired">Expirados</option>
                <option value="pending">Pendentes</option>
                <option value="blocked">Bloqueados</option>
            </select>

            <select
                value={expirationFilter}
                onChange={(e) => setExpirationFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-sm transition-all"
            >
                <option value="all">Vencimento: Todos</option>
                <option value="7days">Vencem em 7 dias</option>
                <option value="15days">Vencem em 15 dias</option>
                <option value="30days">Vencem em 30 dias</option>
            </select>

            {(planFilter !== 'all' || statusFilter !== 'all' || expirationFilter !== 'all') && (
                <button
                    onClick={onClearFilters}
                    className="ml-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors underline decoration-dotted"
                >
                    Limpar
                </button>
            )}
        </div>
    );

    // Mobile Bottom Sheet
    const mobileFilters = isMobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onCloseMobile} />

            <div className="relative bg-white w-full rounded-t-3xl shadow-xl p-6 pb-8 animate-in slide-in-from-bottom h-[80vh] flex flex-col">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Filter size={20} className="text-pink-500" />
                        Filtros
                    </h3>
                    <button onClick={onCloseMobile} className="p-2 bg-gray-50 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5 overflow-y-auto flex-1 pb-20">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Plano</label>
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base font-bold text-gray-800 outline-none"
                        >
                            <option value="all">Todos os Planos</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base font-bold text-gray-800 outline-none"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativos</option>
                            <option value="expired">Expirados</option>
                            <option value="pending">Pendentes</option>
                            <option value="blocked">Bloqueados</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Vencimento</label>
                        <select
                            value={expirationFilter}
                            onChange={(e) => setExpirationFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-base font-bold text-gray-800 outline-none"
                        >
                            <option value="all">Qualquer data</option>
                            <option value="7days">Nos próximos 7 dias</option>
                            <option value="15days">Nos próximos 15 dias</option>
                            <option value="30days">Nos próximos 30 dias</option>
                        </select>
                    </div>
                </div>

                {/* Mobile Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
                    <button
                        onClick={() => { onClearFilters(); onCloseMobile(); }}
                        className="w-full py-4 text-center font-bold text-gray-600 bg-gray-100 rounded-2xl"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={onCloseMobile}
                        className="w-full py-4 text-center font-bold text-white bg-gray-900 rounded-2xl shadow-md"
                    >
                        Ver Resultados
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {desktopFilters}
            {mobileFilters}
        </>
    );
}
