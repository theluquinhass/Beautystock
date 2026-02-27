import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Store, Box, ChevronUp } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import CatalogHeader from '../components/Catalog/CatalogHeader';
import CategoryChips from '../components/Catalog/CategoryChips';
import ProductCardPublic from '../components/Catalog/ProductCardPublic';

export default function PublicCatalog() {
    const { slug } = useParams();
    const [catalog, setCatalog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        if (slug) fetchCatalog();
    }, [slug]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);

            // Simple Intersection Observer logic to highlight chips
            if (catalog?.categories) {
                const scrollPosition = window.scrollY + 200; // offset
                let currentActive = null;

                for (const cat of catalog.categories) {
                    const el = document.getElementById(`category-${cat.id}`);
                    if (el && el.offsetTop <= scrollPosition) {
                        currentActive = cat.id;
                    }
                }

                if (currentActive && currentActive !== activeCategoryId) {
                    setActiveCategoryId(currentActive);
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [catalog, activeCategoryId]);


    const fetchCatalog = async () => {
        try {
            const { data, error: rpcError } = await supabase.rpc('get_public_catalog', {
                p_slug: slug.toLowerCase()
            });

            if (rpcError) throw rpcError;

            if (!data) {
                setError(true);
            } else {
                setCatalog(data);
                if (data.categories?.length > 0) {
                    setActiveCategoryId(data.categories[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching catalog:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Filter categories and products
    const filteredCategories = useMemo(() => {
        if (!catalog?.categories) return [];

        if (!searchQuery.trim()) return catalog.categories;

        const query = searchQuery.toLowerCase();

        return catalog.categories.map(cat => ({
            ...cat,
            products: cat.products?.filter(p => {
                const matchName = p.name.toLowerCase().includes(query);
                const matchCat = cat.name.toLowerCase().includes(query);
                const matchVar = p.variations?.some(v => v.name?.toLowerCase().includes(query));
                return matchName || matchCat || matchVar;
            })
        })).filter(cat => cat.products && cat.products.length > 0);

    }, [catalog, searchQuery]);

    const handleOrder = (product) => {
        if (!catalog?.whatsapp) return;

        let text = `Oi! Vi no seu catálogo o produto *${product.name}*`;
        if (product.variations?.length > 0) {
            text += ` (${product.variations[0].name})`;
        }
        if (catalog.show_prices && product.price) {
            text += ` por R$ ${product.price.toFixed(2)}`;
        }
        text += `. Quero pedir 😊`;

        const formattedWa = catalog.whatsapp.replace(/\D/g, '');
        const url = `https://wa.me/${formattedWa}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4 drop-shadow-sm" />
                <p className="text-pink-600 font-bold animate-pulse text-lg tracking-wide">Carregando catálogo...</p>
            </div>
        );
    }

    if (error || !catalog) {
        return (
            <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-pink-100 max-w-sm w-full text-center">
                    <Store className="w-20 h-20 text-pink-200 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">Ops!</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Este catálogo não está disponível no momento ou não existe.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fdf2f8] to-white font-sans text-gray-900 selection:bg-pink-200">
            <Toaster position="top-right" />

            <CatalogHeader
                catalog={catalog}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 lg:px-8 pb-24 lg:pb-32 relative">

                {/* Categorias Navigation (Sticky Desktop Sidebar / Mobile Top Bar) */}
                <div className="lg:flex lg:gap-8 items-start relative">

                    <div className="lg:w-64 flex-shrink-0 lg:sticky lg:top-[120px]">
                        <div className="hidden lg:block mb-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-2">
                                Categorias
                            </h3>
                        </div>
                        <CategoryChips
                            categories={filteredCategories}
                            activeCategoryId={activeCategoryId}
                        />
                    </div>

                    {/* Products Content */}
                    <div className="flex-1 mt-6 lg:mt-0 min-w-0">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-pink-200 backdrop-blur-sm">
                                <Box className="w-20 h-20 text-pink-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-gray-800 mb-2">Sem produtos</h3>
                                <p className="text-gray-500 font-medium">
                                    {searchQuery ? 'Nenhum item encontrado para essa busca.' : 'Este catálogo ainda não possui produtos visíveis.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-12 sm:space-y-16">
                                {filteredCategories.map((category) => (
                                    <section id={`category-${category.id}`} key={category.id} className="scroll-mt-36">

                                        {/* Category Title Header */}
                                        <div className="flex items-center gap-4 mb-6 sticky top-[170px] sm:static bg-[#fdf2f8]/90 sm:bg-transparent backdrop-blur-md z-30 py-2 sm:py-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                                            <div
                                                className="w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center text-white font-black text-lg border-2 border-white/50"
                                                style={{ backgroundColor: category.color || '#ec4899' }}
                                            >
                                                {category.name.charAt(0).toUpperCase()}
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                                {category.name}
                                            </h2>
                                            <div className="h-px bg-gradient-to-r from-pink-200 to-transparent flex-1 ml-4 hidden sm:block" />
                                        </div>

                                        {/* Products Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                            {category.products?.map((product) => (
                                                <ProductCardPublic
                                                    key={product.id}
                                                    product={product}
                                                    catalog={catalog}
                                                    handleOrder={handleOrder}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Scroll to Top FAB */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 p-4 bg-white text-pink-500 rounded-full shadow-lg border border-pink-100 transition-all z-40 active:scale-95 hover:bg-pink-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
                aria-label="Voltar ao topo"
            >
                <ChevronUp strokeWidth={3} />
            </button>

            {/* Premium Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10 w-full">
                <div className="flex items-center justify-center gap-2">
                    <span className="opacity-70">Powered by</span>
                    <div className="flex items-center gap-1 opacity-90 grayscale hover:grayscale-0 transition-all cursor-default">
                        <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                            B
                        </div>
                        <span className="font-extrabold text-gray-600 tracking-tight normal-case text-sm">Beauty<span className="text-pink-500">Stock</span></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
