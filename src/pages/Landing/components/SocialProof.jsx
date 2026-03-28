import React from 'react';
import { ShieldCheck, Zap, Heart } from 'lucide-react';

export default function SocialProof() {
    return (
        <section className="py-6 sm:py-8 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:justify-around text-center md:text-left">

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs text-white ${i === 1 ? 'bg-pink-400' : i === 2 ? 'bg-purple-400' : i === 3 ? 'bg-indigo-400' : 'bg-rose-400'
                                    }`}>
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="font-bold text-[13px] sm:text-base text-gray-800 flex flex-col justify-center">
                            + de 10.000 revendedoras
                            <span className="text-[11px] sm:text-sm text-gray-500 font-medium">organizando o estoque</span>
                        </p>
                    </div>

                    <div className="hidden md:block h-10 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <ShieldCheck size={20} className="text-amber-600" />
                        </div>
                        <p className="font-bold text-[13px] sm:text-base text-gray-800 flex flex-col justify-center">
                            Evite prejuízo
                            <span className="text-[11px] sm:text-sm text-gray-500 font-medium">Tempo e dinheiro</span>
                        </p>
                    </div>

                    <div className="hidden md:block h-10 w-px bg-gray-200"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Zap size={20} className="text-green-600" />
                        </div>
                        <p className="font-bold text-[13px] sm:text-base text-gray-800 flex flex-col justify-center">
                            Vendas rápidas
                            <span className="text-[11px] sm:text-sm text-gray-500 font-medium">Via WhatsApp</span>
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
