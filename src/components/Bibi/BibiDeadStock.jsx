import React from 'react';
import { PackageX, Tag, Megaphone, Smartphone } from 'lucide-react';

export default function BibiDeadStock({ alerts }) {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 pt-10">
                <PackageX size={40} className="mb-4 text-emerald-300" strokeWidth={1.5} />
                <p className="text-base font-bold text-gray-600 text-center">Nenhum estoque parado!</p>
                <p className="text-sm text-center mt-2 px-4">Seus produtos estão girando bem.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 pb-20">
            {alerts.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-soft transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2 flex-1">{item.product_name}</h4>
                        <div className="px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap bg-purple-50 text-purple-600 border border-purple-100">
                            {item.stock} parados
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                        <div className="text-xs text-gray-600 font-medium">
                            {item.status === 'no_sales' ? (
                                <span className="text-red-500 font-bold">Nenhuma venda</span>
                            ) : (
                                <span className="text-orange-500 font-bold">Giro muito lento</span>
                            )} no período analisado.
                        </div>
                    </div>

                    <div className="border-t border-gray-50 pt-2 mt-1">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">Sugestões para girar:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <div className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 px-2 py-1.5 rounded-lg text-xs font-bold text-yellow-700">
                                <Tag size={12} /> Promocão
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2 py-1.5 rounded-lg text-xs font-bold text-indigo-700">
                                <Megaphone size={12} /> Criar Combo
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-1.5 rounded-lg text-xs font-bold text-emerald-700">
                                <Smartphone size={12} /> Disparo WhatsApp
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
