import React from 'react';
import { Copy, Download, Send } from 'lucide-react';
import { generateBuyListText, exportToCSV } from './bibiUtils';
import toast from 'react-hot-toast';

export default function BibiFooterActions({ shoppingList }) {
    const listCount = shoppingList.length;
    const hasItems = listCount > 0;

    const handleCopy = () => {
        if (!hasItems) return;
        const text = generateBuyListText(shoppingList);
        navigator.clipboard.writeText(text);
        toast.success("Lista copiada!");
    };

    const handleExport = () => {
        if (!hasItems) return;
        exportToCSV(shoppingList);
        toast.success("CSV gerado!");
    };

    const handleWhatsApp = () => {
        if (!hasItems) return;
        const text = generateBuyListText(shoppingList);
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-20 layout-footer shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Ações Rápidas
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${hasItems ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-500'}`}>
                    Lista de compra: {listCount} {listCount === 1 ? 'item' : 'itens'}
                </span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleCopy}
                    disabled={!hasItems}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-100 transition-all group"
                >
                    <div className={`p-1.5 rounded-lg transition-colors ${hasItems ? 'bg-gray-50 text-gray-700 group-hover:bg-gray-100' : 'bg-gray-100 text-gray-400'}`}>
                        <Copy size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">Copiar</span>
                </button>

                <button
                    onClick={handleExport}
                    disabled={!hasItems}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-100 transition-all group"
                >
                    <div className={`p-1.5 rounded-lg transition-colors ${hasItems ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                        <Download size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">Exportar (CSV)</span>
                </button>

                <button
                    onClick={handleWhatsApp}
                    disabled={!hasItems}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-gray-200 border-r-2 border-b-2 hover:border-emerald-300 hover:shadow-sm disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-100 transition-all group"
                >
                    <div className={`p-1.5 rounded-lg transition-colors ${hasItems ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-gray-100 text-gray-400'}`}>
                        <Send size={16} />
                    </div>
                    <span className={`text-[10px] font-bold ${hasItems ? 'text-emerald-700' : 'text-gray-600'}`}>WhatsApp</span>
                </button>
            </div>
        </div>
    );
}
