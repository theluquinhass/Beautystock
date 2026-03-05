import React from 'react';
import { X, Crown, Calendar, CalendarX, ZapOff, ShieldBan, Info, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../lib/utils';

export default function UserDetailsModal({ user, onClose, onAction }) {
    if (!user) return null;

    const isExpired = user.expires_at && new Date(user.expires_at) < new Date();
    const isPro = user.plan === 'pro';

    const formatDate = (dateString, withTime = false) => {
        if (!dateString) return '-';
        return format(parseISO(dateString), withTime ? "dd/MM/yyyy 'às' HH:mm" : "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    const getInitials = (first = '', last = '') => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/50 backdrop-blur-sm animate-in fade-in transition-all">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">

                {/* Header Profile Banner */}
                <div className={cn(
                    "relative p-6 sm:p-8 flex items-end gap-5 border-b border-gray-100",
                    isPro ? 'bg-gradient-to-r from-pink-50 to-purple-50' : 'bg-gray-50'
                )}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-gray-500 transition-colors shadow-sm backdrop-blur"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-3xl sm:text-4xl font-black text-gray-800 shrink-0">
                        {getInitials(user.first_name, user.last_name)}
                    </div>

                    <div className="flex-1 pb-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide shadow-sm",
                                isPro ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-700"
                            )}>
                                {isPro && <Crown size={14} strokeWidth={3} />}
                                {user.plan || 'Free'}
                            </span>

                            {isExpired && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black uppercase tracking-wide">
                                    <CalendarX size={14} /> Expirado
                                </span>
                            )}

                            {user.status === 'blocked' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-lg text-xs font-black uppercase tracking-wide">
                                    <ShieldBan size={14} /> Bloqueado
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                            {user.first_name} {user.last_name}
                        </h2>
                        <p className="text-gray-500 font-medium font-mono text-sm mt-0.5">{user.email}</p>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white hide-scrollbar">

                    {/* Left Column: Info Grid */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                                <Info size={14} /> Informações Básicas
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">ID do Usuário</p>
                                    <p className="text-sm font-mono text-gray-700 bg-white p-2 rounded-lg border border-gray-100 truncate mt-1">
                                        {user.id}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Cadastro</p>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Onboarding</p>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            {user.onboarding_completed ? (
                                                <span className="text-green-600">Completo</span>
                                            ) : (
                                                <span className="text-yellow-600">Pendente</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                                <Crown size={14} /> Assinatura Atual
                            </h3>
                            <div className={cn(
                                "rounded-2xl p-5 space-y-4 border",
                                isPro ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-100'
                            )}>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Vencimento</p>
                                    <p className={cn(
                                        "font-black text-sm",
                                        isExpired ? "text-red-600" : (isPro ? "text-pink-700" : "text-gray-900")
                                    )}>
                                        {formatDate(user.expires_at)}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Tipo da conta</p>
                                    <p className="font-bold text-sm text-gray-900">{user.is_recurring ? 'Recorrente 🔄' : 'Mensal (Avulso)'}</p>
                                </div>

                                {isExpired && (
                                    <button
                                        onClick={() => onAction('grant-pro')}
                                        className="w-full mt-2 py-3 bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-500 hover:text-white hover:border-pink-500 font-bold rounded-xl text-sm transition-all shadow-sm"
                                    >
                                        Renovar Assinatura (30 dias)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payments & Logs Placeholder */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                                <CreditCard size={14} /> Últimos Eventos
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                {/* Simulated Empty State/Logs for now until we query payments here */}
                                <div className="p-8 text-center flex flex-col items-center opacity-50">
                                    <CreditCard size={32} className="text-gray-400 mb-3" />
                                    <p className="text-sm font-bold text-gray-600">Histórico simplificado</p>
                                    <p className="text-xs font-medium text-gray-400 mt-1 max-w-[200px]">
                                        Painel de pagamentos em desenvolvimento.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick admin dangerous actions */}
                        <div className="pt-6 border-t border-gray-100 mt-auto">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-1.5">
                                <ShieldBan size={12} /> Zona de Perigo
                            </h3>
                            <button
                                onClick={() => onAction('block-user')}
                                className="w-full py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition-all text-left px-5 flex items-center gap-3"
                            >
                                <div className="p-1.5 bg-red-100 rounded-lg"><ShieldBan size={16} /></div>
                                Bloquear Acesso do Usuário
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer fixed */}
                <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="py-2.5 px-6 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Fechar
                    </button>
                    {!isPro && (
                        <button
                            onClick={() => onAction('grant-pro')}
                            className="py-2.5 px-6 bg-pink-500 border border-pink-600 text-white font-bold rounded-xl hover:bg-pink-600 transition-colors shadow-sm"
                        >
                            Tornar PRO
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
