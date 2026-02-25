import { useNavigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';
import { Crown, Lock, Sparkles, Star } from 'lucide-react';

export default function RequirePro({ children }) {
    const { isPro, loading } = usePlan();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center text-pink-300 animate-pulse">
                <Sparkles size={32} className="mb-4" />
                <span className="font-bold text-lg">Verificando acesso...</span>
            </div>
        );
    }

    if (!isPro) {
        return (
            <div className="h-[calc(100vh-120px)] w-full bg-white rounded-[32px] shadow-soft border border-gray-100 relative overflow-hidden group flex items-center justify-center">
                {/* Overlay Content */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-md transition-all duration-300 group-hover:bg-white/60">
                    <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-5 rounded-full mb-6 shadow-[0_0_40px_rgba(236,72,153,0.4)] animate-pulse">
                        <Lock className="text-white animate-bounce" size={36} />
                    </div>

                    <h2 className="text-gray-800 font-black mb-3 text-3xl tracking-tight">Recurso Premium ✨</h2>

                    <p className="text-gray-600 text-base font-medium mb-8 max-w-[400px] leading-relaxed">
                        Você descobriu uma funcionalidade exclusiva! Profissionalize ainda mais a sua gestão e desbloqueie ferramentas avançadas para alavancar seu salão ou loja.
                    </p>

                    <button
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center justify-center gap-3 w-full max-w-[300px] bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-gray-900/30 transition-all hover:-translate-y-1 active:scale-95 border border-gray-700"
                    >
                        <Crown size={22} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-lg">Conhecer o PRO</span>
                    </button>

                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                        <Star size={16} className="text-pink-400 fill-pink-400" />
                        Invista no seu negócio
                        <Star size={16} className="text-pink-400 fill-pink-400" />
                    </div>
                </div>

                {/* Blurred Fake Background representing complex UI */}
                <div className="absolute inset-0 z-10 opacity-30 pointer-events-none filter blur-[8px] select-none p-8 flex flex-col gap-6">
                    {/* Fake Header */}
                    <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl h-32 w-full">
                        <div className="space-y-3 w-1/3">
                            <div className="h-6 bg-pink-200 rounded-md w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
                            <div className="h-12 w-32 bg-pink-100 rounded-xl"></div>
                        </div>
                    </div>
                    {/* Fake Grid Content */}
                    <div className="grid grid-cols-3 gap-6 flex-1">
                        <div className="col-span-2 bg-gray-50 p-6 rounded-3xl flex flex-col gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-16 w-full bg-white rounded-xl shadow-sm border border-gray-100 flex items-center px-4 gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-1/4 bg-gray-100 rounded ml-auto"></div>
                                </div>
                            ))}
                        </div>
                        <div className="col-span-1 bg-gray-50 p-6 rounded-3xl flex flex-col gap-4">
                            <div className="h-48 w-full bg-pink-50 rounded-2xl"></div>
                            <div className="h-32 w-full bg-white rounded-2xl border border-gray-100"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
