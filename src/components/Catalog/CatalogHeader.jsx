import { Search, MessageCircle } from 'lucide-react';

export default function CatalogHeader({ catalog, searchQuery, setSearchQuery }) {
    const handleOrder = () => {
        if (!catalog?.whatsapp) return;
        const text = `Oi! Gostaria de fazer um pedido pelo seu catálogo.`;
        const formattedWa = catalog.whatsapp.replace(/\D/g, '');
        const url = `https://wa.me/${formattedWa}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-pink-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 lg:py-5 flex flex-col gap-4">
                {/* Top Row: Store Info & Action */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-soft flex-shrink-0 border border-white/20">
                            {catalog.store_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                                {catalog.store_name}
                            </h1>
                            <span className="text-[11px] lg:text-xs text-pink-500 font-bold uppercase tracking-widest">
                                Catálogo Oficial
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleOrder}
                        className="hidden lg:flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-5 py-2.5 rounded-xl shadow-soft hover:shadow-md transition-all active:scale-95 text-sm"
                    >
                        <MessageCircle size={18} fill="currentColor" />
                        Contato
                    </button>

                    {/* Mobile WhatsApp Icon button */}
                    <button
                        onClick={handleOrder}
                        className="lg:hidden w-10 h-10 bg-[#25D366] text-white rounded-xl shadow-soft flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <MessageCircle size={20} fill="currentColor" />
                    </button>
                </div>

                {/* Bottom Row: Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar produtos, categorias ou detalhes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 focus:bg-white transition-all shadow-inner"
                    />
                </div>
            </div>
        </header>
    );
}
