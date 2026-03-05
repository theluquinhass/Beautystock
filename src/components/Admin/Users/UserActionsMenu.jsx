import React from 'react';
import { CheckCircle2, ZapOff, SkipBack, ShieldBan, X, Eye } from 'lucide-react';

export default function UserActionsMenu({ user, onAction, onViewDetails, onClose, isMobile }) {

    const DesktopMenu = (
        <div className="absolute right-0 top-12 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-20 text-left animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Ações Rápidas</span>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 bg-white rounded-full"><X size={14} /></button>
            </div>

            <div className="p-2 space-y-1 text-gray-700">
                <button onClick={onViewDetails} className="w-full px-3 py-2.5 text-sm font-bold hover:bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Eye size={16} /></div>
                    Ver Todos os Detalhes
                </button>
                <div className="h-px bg-gray-100 my-1 mx-2"></div>

                <button onClick={() => onAction('grant-pro')} className="w-full px-3 py-2.5 text-sm font-bold hover:bg-pink-50 text-pink-600 rounded-xl flex items-center gap-3">
                    <div className="p-1.5 bg-pink-100 rounded-lg"><CheckCircle2 size={16} /></div>
                    Dar PRO (30 dias)
                </button>
                <button onClick={() => onAction('revoke-pro')} className="w-full px-3 py-2.5 text-sm font-bold hover:bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg"><ZapOff size={16} /></div>
                    Revogar PRO
                </button>
                <button onClick={() => onAction('reset-onboarding')} className="w-full px-3 py-2.5 text-sm font-bold hover:bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg"><SkipBack size={16} /></div>
                    Resetar Onboarding
                </button>
                <div className="h-px bg-gray-100 my-1 mx-2"></div>

                <button onClick={() => onAction('block-user')} className="w-full px-3 py-2.5 text-sm font-bold hover:bg-red-50 text-red-600 rounded-xl flex items-center gap-3 mb-1">
                    <div className="p-1.5 bg-red-100 rounded-lg"><ShieldBan size={16} /></div>
                    Bloquear Usuário
                </button>
            </div>
        </div>
    );

    const MobileMenu = (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full rounded-t-3xl shadow-xl p-6 pb-auto min-h-[50vh] animate-in slide-in-from-bottom">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            Ações Rápidas
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Para {user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 -mt-4">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3 pb-8">
                    <button onClick={onViewDetails} className="w-full p-4 bg-gray-50 border border-gray-100 hover:border-blue-200 text-gray-900 font-bold rounded-2xl flex items-center gap-4 transition-all">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Eye size={20} /></div>
                        <div className="text-left">
                            <p className="text-base">Ver Todos os Detalhes</p>
                            <p className="text-xs text-gray-500 font-medium">Histórico, assinaturas e logs</p>
                        </div>
                    </button>

                    <button onClick={() => onAction('grant-pro')} className="w-full p-4 bg-pink-50 border border-pink-100 hover:border-pink-300 text-pink-700 font-bold rounded-2xl flex items-center gap-4 transition-all">
                        <div className="p-2.5 bg-pink-200 text-pink-700 rounded-xl"><CheckCircle2 size={20} /></div>
                        <div className="text-left">
                            <p className="text-base">Dar PRO (30 dias)</p>
                            <p className="text-xs text-pink-500/80 font-medium">Libera acesso total no app</p>
                        </div>
                    </button>

                    <button onClick={() => onAction('revoke-pro')} className="w-full p-4 bg-white border border-gray-100 hover:border-gray-200 text-gray-700 font-bold rounded-2xl flex items-center gap-4 transition-all shadow-sm">
                        <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl"><ZapOff size={20} /></div>
                        Ocultar/Revogar PRO
                    </button>

                    <button onClick={() => onAction('reset-onboarding')} className="w-full p-4 bg-white border border-gray-100 hover:border-gray-200 text-gray-700 font-bold rounded-2xl flex items-center gap-4 transition-all shadow-sm">
                        <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl"><SkipBack size={20} /></div>
                        Resetar Onboarding
                    </button>

                    <button onClick={() => onAction('block-user')} className="w-full p-4 bg-red-50 border border-red-100 hover:border-red-300 text-red-600 font-bold rounded-2xl flex items-center gap-4 transition-all">
                        <div className="p-2.5 bg-red-100 text-red-600 rounded-xl"><ShieldBan size={20} /></div>
                        <div className="text-left">
                            <p className="text-base">Bloquear Usuário</p>
                            <p className="text-xs text-red-500/80 font-medium">Impede login no sistema</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    return isMobile ? MobileMenu : DesktopMenu;
}
