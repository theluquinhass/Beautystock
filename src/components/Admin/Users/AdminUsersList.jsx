import React from 'react';
import { format, parseISO } from 'date-fns';
import { MoreVertical, Crown, Calendar, CalendarX, AlertCircle, PlayCircle, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="font-bold text-gray-400 text-sm">Carregando usuários...</p>
            </div>
        );
    }

    if (!loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-4 border border-blue-100">
                    <AlertCircle size={28} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-1">Nenhum usuário encontrado</h3>
                <p className="text-gray-400 text-sm font-medium">Tente ajustar os filtros ou o termo de busca.</p>
            </div>
        );
    }

    const getStatusBadge = (u) => {
        const isExpired = u.expires_at && new Date(u.expires_at) < new Date();
        const isBlocked = u.status === 'blocked';

        if (isBlocked) return { label: 'Bloqueado', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', icon: XCircle };
        if (isExpired) return { label: 'Expirado', cls: 'bg-rose-100 text-rose-600', dot: 'bg-rose-500', icon: XCircle };
        return { label: 'Ativo', cls: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500', icon: CheckCircle2 };
    };

    const getInitials = (first = '', last = '') =>
        `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';

    const isAlmostExpiring = (dateStr) => {
        if (!dateStr) return false;
        const diff = new Date(dateStr) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);
        return days > 0 && days <= 7;
    };

    return (
        <div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/70">
                            <th className="px-6 py-3.5">Usuário</th>
                            <th className="px-6 py-3.5">Plano</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Vencimento</th>
                            <th className="px-6 py-3.5">Cadastro</th>
                            <th className="px-6 py-3.5 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {users.map((u) => {
                            const status = getStatusBadge(u);
                            const expiring = isAlmostExpiring(u.expires_at);

                            return (
                                <tr
                                    key={u.id}
                                    className="hover:bg-blue-50/20 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-sm shrink-0">
                                                {getInitials(u.first_name, u.last_name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{u.first_name} {u.last_name}</p>
                                                <p className="text-gray-400 text-xs truncate max-w-[160px]">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                                            u.plan === 'pro'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-gray-100 text-gray-500'
                                        )}>
                                            {u.plan === 'pro' && <Crown size={9} strokeWidth={3} />}
                                            {u.plan || 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                                            status.cls
                                        )}>
                                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.expires_at ? (
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    'font-semibold text-sm',
                                                    status.label === 'Expirado' ? 'text-rose-500 line-through opacity-70' : 'text-gray-700'
                                                )}>
                                                    {format(parseISO(u.expires_at), 'dd/MM/yyyy')}
                                                </span>
                                                {expiring && (
                                                    <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-0.5">⚡ Vence em breve</span>
                                                )}
                                            </div>
                                        ) : <span className="text-gray-300 font-medium">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium text-sm">
                                        {format(parseISO(u.created_at), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActionUser(actionUser === u.id ? null : u.id); }}
                                            className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                                        >
                                            <MoreVertical size={17} />
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
            <div className="sm:hidden flex flex-col gap-4 p-4">
                {users.map((u) => {
                    const status = getStatusBadge(u);
                    const expiring = isAlmostExpiring(u.expires_at);

                    return (
                        <div
                            key={u.id}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden"
                        >
                            {/* Accent line */}
                            <div className={cn(
                                'absolute top-0 left-0 right-0 h-0.5',
                                u.plan === 'pro' ? 'bg-amber-400' : 'bg-blue-200',
                                status.label === 'Expirado' ? 'bg-rose-400' : ''
                            )} />

                            {/* Header */}
                            <div className="flex justify-between items-start mt-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-base shrink-0">
                                        {getInitials(u.first_name, u.last_name)}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 leading-tight">{u.first_name} {u.last_name}</p>
                                        <p className="text-gray-400 text-xs truncate max-w-[200px] mt-0.5">{u.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActionUser(u.id)}
                                    className="p-2 -mr-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                                    u.plan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                                )}>
                                    {u.plan === 'pro' && <Crown size={9} strokeWidth={3} />}
                                    {u.plan || 'Free'}
                                </span>
                                <span className={cn(
                                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                                    status.cls
                                )}>
                                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
                                    {status.label}
                                </span>
                                {expiring && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                                        ⚡ Vence em breve
                                    </span>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center text-xs">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Cadastro</span>
                                    <span className="text-gray-700 font-semibold flex items-center gap-1">
                                        <PlayCircle size={11} className="text-gray-300" />
                                        {format(parseISO(u.created_at), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="flex flex-col gap-0.5 text-right">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Vencimento</span>
                                    {u.expires_at ? (
                                        <span className={cn('font-semibold flex items-center justify-end gap-1', status.label === 'Expirado' ? 'text-rose-500' : 'text-gray-700')}>
                                            {status.label === 'Expirado' ? <CalendarX size={11} /> : <Calendar size={11} className="text-gray-300" />}
                                            {format(parseISO(u.expires_at), 'dd/MM/yyyy')}
                                        </span>
                                    ) : <span className="text-gray-300 font-semibold">—</span>}
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => onViewDetails(u)}
                                className="w-full bg-white border-2 border-gray-100 hover:border-blue-200 text-gray-600 hover:text-blue-600 font-bold py-2.5 rounded-xl text-sm transition-all"
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
