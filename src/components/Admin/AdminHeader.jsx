import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Shield } from 'lucide-react';

export default function AdminHeader() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                    <Shield size={22} className="text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Admin Dashboard
                        </h1>
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={10} />
                            HQ
                        </span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mt-0.5">
                        Visão geral do BeautyStock · Painel de controle
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 transition-all shadow-sm w-full sm:w-auto group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                Ver App
            </button>
        </div>
    );
}
