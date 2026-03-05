import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AdminHeader() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Admin Dashboard
                    <Sparkles className="text-pink-500 w-6 h-6" />
                </h1>
                <p className="text-gray-500 font-medium text-sm mt-1">
                    Visão geral do BeautyStock HQ
                </p>
            </div>

            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 hover:border-pink-200 transition-all shadow-sm w-full sm:w-auto"
            >
                <ArrowLeft size={18} />
                Ver App
            </button>
        </div>
    );
}
