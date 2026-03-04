import { Search, MessageCircle, Truck } from 'lucide-react';

export default function CatalogHeader({ catalog, searchQuery, setSearchQuery }) {
    const handleOrder = () => {
        if (!catalog?.whatsapp) return;
        const text = `Oi! Gostaria de fazer um pedido pelo seu catálogo.`;
        const formattedWa = catalog.whatsapp.replace(/\D/g, '');
        const url = `https://wa.me/${formattedWa}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    if (!catalog) return null;

    return (
        <div className="flex flex-col">

            <header className="bg-white/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
                <div className="max-w-6xl mx-auto px-4 py-4 lg:py-5 flex flex-col gap-4">
                    {/* Top Row: Store Info & Action */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 group cursor-default">
                            {/* Logo */}
                            {catalog.store_logo_url ? (
                                <img
                                    src={catalog.store_logo_url}
                                    alt={catalog.store_name || 'Logo'}
                                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl object-cover shadow-[0_8px_16px_rgba(236,72,153,0.2)] flex-shrink-0 border border-gray-100 transform group-hover:scale-105 transition-all duration-300"
                                />
                            ) : (
                                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl lg:text-3xl shadow-[0_8px_16px_rgba(236,72,153,0.2)] flex-shrink-0 border border-white/20 transform group-hover:scale-105 transition-all duration-300">
                                    {catalog.store_name?.charAt(0).toUpperCase() || 'L'}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                                    {catalog.store_name || 'Loja'}
                                </h1>
                                <span className="text-[10px] lg:text-xs text-pink-500 font-extrabold uppercase tracking-widest bg-pink-50 w-fit px-1.5 py-0.5 rounded-md mt-0.5">
                                    Catálogo Oficial
                                </span>
                            </div>
                        </div>

                        {/* CTA Desktop */}
                        <button
                            onClick={handleOrder}
                            className="hidden lg:flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3 rounded-2xl shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] transition-all active:scale-95 text-sm hover:-translate-y-0.5 duration-200"
                        >
                            <MessageCircle size={18} fill="currentColor" />
                            Atendimento
                        </button>

                        {/* Mobile WhatsApp Icon button */}
                        <button
                            onClick={handleOrder}
                            className="lg:hidden w-12 h-12 bg-[#25D366] text-white rounded-xl shadow-[0_4px_14px_rgba(37,211,102,0.3)] flex items-center justify-center active:scale-95 transition-transform"
                            aria-label="Falar no WhatsApp"
                        >
                            <MessageCircle size={22} fill="currentColor" />
                        </button>
                    </div>

                    {/* Bottom Row: Search Bar */}
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="O que você está procurando hoje?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100/50 rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 focus:bg-white transition-all shadow-inner hover:bg-gray-100/50"
                        />
                    </div>
                </div>
            </header>
        </div>
    );
}
