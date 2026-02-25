import React from 'react';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';

export default function BibiTopProducts({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 pt-10">
                <Trophy size={40} className="mb-4 text-emerald-300" strokeWidth={1.5} />
                <p className="text-base font-bold text-gray-600 text-center">Nenhum campeão ainda!</p>
                <p className="text-sm text-center mt-2 px-4">Continue vendendo para ver seus melhores produtos.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 pb-20">
            {products.map((item, idx) => (
                <div key={item.id || idx} className="relative p-4 rounded-2xl border border-gray-100 bg-white shadow-soft transition-shadow">

                    {idx === 0 && (
                        <div className="absolute -top-3 -right-2 bg-gradient-to-br from-yellow-300 to-yellow-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 transform rotate-12">
                            <Trophy size={16} className="text-yellow-900" />
                        </div>
                    )}
                    {idx === 1 && (
                        <div className="absolute -top-2 -right-1 bg-gradient-to-br from-gray-200 to-gray-400 w-6 h-6 rounded-full flex items-center justify-center shadow-md shadow-gray-400/30">
                            <span className="text-[10px] font-black text-gray-800">2º</span>
                        </div>
                    )}
                    {idx === 2 && (
                        <div className="absolute -top-2 -right-1 bg-gradient-to-br from-orange-300 to-orange-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md shadow-orange-500/30">
                            <span className="text-[10px] font-black text-orange-900">3º</span>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-2 pr-4">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight flex-1">{item.product_name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                            <TrendingUp size={14} className="text-gray-200 absolute -bottom-1 -right-1 w-10 h-10" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1 z-10">Crescimento</span>
                            <span className={`text-lg font-black leading-none z-10 ${item.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {item.trend >= 0 ? '+' : ''}{item.trend.toFixed(0)}%
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold mt-1 z-10">
                                vs período anterior
                            </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                            <DollarSign size={14} className="text-green-100 absolute -bottom-1 -right-1 w-10 h-10" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1 z-10">Lucro</span>
                            <span className="text-lg font-black text-gray-800 leading-none z-10">
                                {item.profitGenerated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold mt-1 z-10">
                                ({item.currentPeriodSold} un)
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
