import React from 'react';

export default function BibiFilters({
    periodDays, setPeriodDays,
    strategyDays, setStrategyDays,
    sortBy, setSortBy,
    isDesktop = false
}) {
    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 ${isDesktop ? 'flex-row items-end mb-0 border-none px-4 py-2 shadow-none' : 'flex-col mb-4'}`}>
            <div className={`w-full ${isDesktop ? 'w-1/3' : ''}`}>
                <label className="text-xs font-bold text-gray-500 uppercase flex mb-1.5 ml-0.5 tracking-wide">
                    Vendas de
                </label>
                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                    {[
                        { label: '7 dias', value: 7 },
                        { label: '30 dias', value: 30 },
                        { label: '90 dias', value: 90 },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriodDays(opt.value)}
                            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${periodDays === opt.value
                                ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`w-full ${isDesktop ? 'w-1/3' : ''}`}>
                <label className="text-xs font-bold text-gray-500 uppercase flex mb-1.5 ml-0.5 tracking-wide">
                    Meta para
                </label>
                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                    {[
                        { label: '15 dias', value: 15 },
                        { label: '30 dias', value: 30 },
                        { label: '45 dias', value: 45 },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setStrategyDays(opt.value)}
                            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${strategyDays === opt.value
                                ? 'bg-pink-500 text-white shadow-md shadow-pink-200 border-none'
                                : 'text-gray-500 hover:text-gray-700 border border-transparent'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`w-full ${isDesktop ? 'w-1/3' : ''}`}>
                <label className="text-xs font-bold text-gray-500 uppercase flex mb-1.5 ml-0.5 tracking-wide">
                    Ordenar por
                </label>
                <select
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2 font-medium appearance-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="acaba_mais_rapido">Acaba mais rápido</option>
                    <option value="maior_risco">Maior risco financeiro</option>
                    <option value="mais_vendido">Mais vendido</option>
                </select>
            </div>
        </div>
    );
}
