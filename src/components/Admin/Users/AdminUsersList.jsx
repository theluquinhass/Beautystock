import React from 'react';
import { format, parseISO } from 'date-fns';
import { MoreVertical, Crown, Calendar, CalendarX, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import UserActionsMenu from './UserActionsMenu';

export default function AdminUsersList({
    users,
    loading,
    actionUser,
    setActionUser,
    onAction,
    onViewDetails
}) {
    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 min-h-[400px]">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
                <p className="font-bold text-gray-500">Carregando usuários...</p>
            </div>
        );
    }

    if (!loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 border-dashed min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Nenhum usuário encontrado</h3>
                <p className="text-gray-500 text-sm font-medium mb-6">Tente ajustar seus filtros ou termos de busca.</p>
            </div>
        );
    }

    const getStatusText = (u) => {
        const isExpired = u.expires_at && new Date(u.expires_at) < new Date();
        const isBlocked = u.status === 'blocked'; // Assuming 'status' column exists for block state

        if (isBlocked) return { label: 'Bloqueado', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
        if (isExpired) return { label: 'Expirado', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
        if (u.plan === 'pro') return { label: 'Ativo', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' };
        return { label: 'Ativo', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
    };

    const getInitials = (first = '', last = '') => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
    };

    const isAlmostExpiring = (dateStr) => {
        if (!dateStr) return false;
        const diff = new Date(dateStr) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);
        return days > 0 && days <= 2;
    };

    return (
        <div className="bg-transparent sm:bg-white sm:rounded-3xl sm:shadow-sm sm:border sm:border-gray-100">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Plano</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Vencimento</th>
                            <th className="px-6 py-4">Cadastro</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {users.map((u) => {
                            const status = getStatusText(u);
                            const almostExpiring = isAlmostExpiring(u.expires_at);

                            return (
                                <tr key={u.id} className="hover:bg-pink-50/30 transition-colors group cursor-default">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-700 font-bold shrink-0">
                                                {getInitials(u.first_name, u.last_name)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 line-clamp-1">{u.first_name} {u.last_name}</div>
                                                <div className="text-gray-500 text-xs font-medium truncate max-w-[180px]">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide",
                                            u.plan === 'pro' ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {u.plan === 'pro' && <Crown size={12} strokeWidth={3} />}
                                            {u.plan || 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide", status.color)}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)}></span>
                                            {status.label}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.expires_at ? (
                                            <div className="flex flex-col">
                                                <span className={cn("font-semibold", status.label === 'Expirado' ? "text-red-600 line-through opacity-70" : "text-gray-700")}>
                                                    {format(parseISO(u.expires_at), 'dd/MM/yyyy')}
                                                </span>
                                                {almostExpiring && (
                                                    <span className="text-[10px] text-yellow-600 font-bold mt-0.5">Vence em breve!</span>
                                                )}
                                            </div>
                                        ) : <span className="text-gray-400 font-medium">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {format(parseISO(u.created_at), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActionUser(actionUser === u.id ? null : u.id); }}
                                            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {actionUser === u.id && (
                                            <UserActionsMenu
                                                user={u}
                                                onAction={(type) => { setActionUser(null); onAction(type, u.id); }}
                                                onViewDetails={() => { setActionUser(null); onViewDetails(u); }}
                                                onClose={() => setActionUser(null)}
                                                isMobile={false}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="sm:hidden flex flex-col gap-4">
                {users.map((u) => {
                    const status = getStatusText(u);
                    const almostExpiring = isAlmostExpiring(u.expires_at);

                    return (
                        <div key={u.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
                            {/* Accent line top */}
                            <div className={cn("absolute top-0 left-0 right-0 h-1",
                                u.plan === 'pro' ? 'bg-pink-400' : 'bg-gray-200',
                                status.label === 'Expirado' ? 'bg-red-400' : ''
                            )} />

                            {/* Card Header */}
                            <div className="flex justify-between items-start mt-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-black text-lg shadow-inner">
                                        {getInitials(u.first_name, u.last_name)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-base leading-tight">
                                            {u.first_name} {u.last_name}
                                        </h3>
                                        <p className="text-gray-400 text-xs font-semibold truncate max-w-[200px] mt-0.5">
                                            {u.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActionUser(u.id)}
                                    className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Badges Row */}
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                    u.plan === 'pro' ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600"
                                )}>
                                    {u.plan === 'pro' && <Crown size={12} strokeWidth={3} />}
                                    {u.plan || 'Free'}
                                </span>
                                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider", status.color)}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)}></span>
                                    {status.label}
                                </div>
                                {almostExpiring && (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        Vence Logo
                                    </span>
                                )}
                            </div>

                            {/* Dates Row */}
                            <div className="bg-gray-50 rounded-2xl p-3 flex justify-between items-center text-xs">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cadastro</span>
                                    <span className="text-gray-700 font-semibold flex items-center gap-1">
                                        <PlayCircle size={12} className="text-gray-400" />
                                        {format(parseISO(u.created_at), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Vencimento</span>
                                    {u.expires_at ? (
                                        <span className={cn("font-semibold flex items-center justify-end gap-1", status.label === 'Expirado' ? "text-red-600" : "text-gray-700")}>
                                            {status.label === 'Expirado' ? <CalendarX size={12} /> : <Calendar size={12} className="text-gray-400" />}
                                            {format(parseISO(u.expires_at), 'dd/MM/yyyy')}
                                        </span>
                                    ) : <span className="text-gray-400 font-semibold">-</span>}
                                </div>
                            </div>

                            {/* CTA Action */}
                            <button
                                onClick={() => onViewDetails(u)}
                                className="w-full mt-1 bg-white border-2 border-gray-100 hover:border-pink-200 text-gray-700 hover:text-pink-600 font-bold py-3 rounded-xl text-sm transition-all shadow-sm"
                            >
                                Ver detalhes completos
                            </button>

                            {/* Mobile Actions Bottom Sheet */}
                            {actionUser === u.id && (
                                <UserActionsMenu
                                    user={u}
                                    onAction={(type) => { setActionUser(null); onAction(type, u.id); }}
                                    onViewDetails={() => { setActionUser(null); onViewDetails(u); }}
                                    onClose={() => setActionUser(null)}
                                    isMobile={true}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
