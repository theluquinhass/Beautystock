import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Store, Box, ChevronUp, Star, ShieldCheck, HeartHandshake, Search, MessageCircle } from 'lucide-react';
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
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
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
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
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

    const filteredCategories = useMemo(() => {
        if (!catalog?.categories) return [];

        const isPro = catalog.plan?.toUpperCase() === 'PRO';
        const limit = 20;
        let count = 0;

        const query = searchQuery.trim().toLowerCase();

        return catalog.categories.map(cat => {
            if (!cat.products) return { ...cat, products: [] };

            // First pass: Only keep products that are within the global 20 limit (if not PRO)
            let allowedProducts = cat.products;
            if (!isPro) {
                allowedProducts = [];
                for (const p of cat.products) {
                    if (count < limit) {
                        allowedProducts.push(p);
                        count++;
                    }
                }
            }

            // Second pass: Filter by search query
            const filteredProducts = allowedProducts.filter(p => {
                if (!query) return true;
                const matchName = p.name.toLowerCase().includes(query);
                const matchCat = cat.name.toLowerCase().includes(query);
                const matchVar = p.variations?.some(v => v.name?.toLowerCase().includes(query));
                return matchName || matchCat || matchVar;
            });

            return {
                ...cat,
                products: filteredProducts
            };
        }).filter(cat => cat.products && cat.products.length > 0);

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
                <p className="text-pink-600 font-bold animate-pulse text-lg tracking-wide">Carregando loja...</p>
            </div>
        );
    }

    if (error || !catalog) {
        return (
            <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-pink-100 max-w-sm w-full text-center">
                    <Store className="w-20 h-20 text-pink-200 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">Ops!</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Esta loja não está disponível no momento.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-pink-200 relative overflow-hidden">
            <Toaster position="top-right" />

            {/* Premium Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ec4899] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.07]"></div>
                <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-[#d8b4fe] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.1]"></div>
            </div>

            <div className="relative z-10">
                <CatalogHeader
                    catalog={catalog}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                <main className="max-w-6xl mx-auto px-4 lg:px-8 pb-24 lg:pb-32">

                    {/* Hero Section */}
                    {!searchQuery && (
                        <div className="py-8 sm:py-12 mt-4 sm:mt-8 mb-4 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border border-white">
                            <div className="max-w-2xl px-2">
                                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
                                    {catalog.hero_title ? (
                                        <span>{catalog.hero_title}</span>
                                    ) : (
                                        <>
                                            Bem-vindo(a) à <br className="hidden sm:block" />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                                                {catalog.store_name || 'Loja'}
                                            </span>
                                        </>
                                    )}
                                </h2>
                                <p className="text-lg text-gray-500 font-medium leading-relaxed sm:max-w-lg mb-8">
                                    {catalog.hero_subtitle ? (
                                        catalog.hero_subtitle
                                    ) : (
                                        'Explore nossa seleção exclusiva de produtos de beleza e cosméticos. Tudo escolhido com carinho para você.'
                                    )}
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                        <ShieldCheck size={18} className="text-green-500" /> Compra Segura
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                        <Star size={18} className="text-yellow-400 fill-current" /> Qualidade Garantida
                                    </div>
                                </div>
                            </div>

                            {/* Visual Graphic */}
                            <div className="hidden lg:flex relative w-64 h-64 shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full animate-pulse-slow opacity-50 blur-2xl"></div>
                                <div className="w-full h-full bg-gradient-to-br from-pink-50 to-white border-4 border-white/50 rounded-[3rem] shadow-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500 relative z-10 overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-400 rounded-full blur-2xl opacity-20"></div>
                                    <HeartHandshake size={80} className="text-pink-300 transform -rotate-12" strokeWidth={1} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categorias Navigation (Sticky Desktop Sidebar / Mobile Top Bar) */}
                    <div className="lg:flex lg:gap-10 items-start relative mt-8 sm:mt-12">

                        <div className="lg:w-64 flex-shrink-0 lg:sticky lg:top-[160px]">
                            <div className="hidden lg:flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Box size={16} className="text-gray-500" />
                                </div>
                                <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                                    Departamentos
                                </h3>
                            </div>
                            <CategoryChips
                                categories={filteredCategories}
                                activeCategoryId={activeCategoryId}
                            />
                        </div>

                        {/* Products Content */}
                        <div className="flex-1 mt-8 lg:mt-0 min-w-0">
                            {filteredCategories.length === 0 ? (
                                <div className="text-center py-24 bg-white/50 rounded-[3rem] border border-dashed border-gray-200 backdrop-blur-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Nada por aqui</h3>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                        {searchQuery ? 'Não encontramos produtos com esse termo. Tente buscar de outra forma.' : 'Essa loja ainda está arrumando as prateleiras!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-16 sm:space-y-20">
                                    {filteredCategories.map((category) => (
                                        <section id={`category-${category.id}`} key={category.id} className="scroll-mt-48">

                                            {/* Category Title Header */}
                                            <div className="flex items-center gap-4 mb-8 sticky top-[138px] sm:static bg-gray-50/90 sm:bg-transparent backdrop-blur-xl z-30 py-4 sm:py-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                                                <div
                                                    className="w-12 h-12 rounded-[1rem] shadow-sm flex items-center justify-center text-white font-black text-xl border-4 border-white"
                                                    style={{ backgroundColor: category.color || '#ec4899' }}
                                                >
                                                    {category.name?.charAt(0).toUpperCase() || 'C'}
                                                </div>
                                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                                    {category.name || 'Categoria'}
                                                    <span className="block text-[13px] text-gray-400 font-bold mt-1 uppercase tracking-wider hidden sm:block">
                                                        {category.products?.length || 0} Produto{(category.products?.length !== 1) && 's'}
                                                    </span>
                                                </h2>
                                                <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-4 hidden sm:block" />
                                            </div>

                                            {/* Products Grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
                                    
                                    {/* Upgrade CTA Block for Free Users */}
                                    {catalog?.plan?.toUpperCase() !== 'PRO' && (
                                        <div className="mt-16 sm:mt-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-[2.5rem] p-8 sm:p-12 text-center border border-pink-100/50 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                                            
                                            <div className="relative z-10 max-w-lg mx-auto">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-pink-100">
                                                    <Store className="w-8 h-8 text-pink-500" />
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 tracking-tight">Gostou deste catálogo?</h3>
                                                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                                    Com o plano BeautyStock Pro você libera seu catálogo ilimitado, gestão completa e muito mais ferramentas para decolar de vez as suas vendas.
                                                </p>
                                                <a 
                                                    href="https://beautystockapp.com" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center bg-gray-900 hover:bg-black text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                                                >
                                                    Crie sua loja grátis hoje
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Scroll to Top FAB */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl transition-all z-40 active:scale-95 hover:bg-black ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}
                    aria-label="Voltar ao topo"
                >
                    <ChevronUp strokeWidth={3} />
                </button>

                {/* Premium Corporate Footer */}
                <footer className="bg-white border-t border-gray-100 pt-16 pb-12 px-6 relative z-10 w-full">
                    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
                        {catalog.store_logo_url ? (
                            <img
                                src={catalog.store_logo_url}
                                alt={catalog.store_name || 'Logo'}
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-gray-100 mb-4 transition-all duration-300"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/20 mb-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                {catalog.store_name?.charAt(0).toUpperCase() || 'L'}
                            </div>
                        )}

                        <h4 className="text-xl font-black text-gray-900">{catalog.store_name || 'Loja'}</h4>

                        {catalog?.whatsapp && (
                            <a href={`https://wa.me/${catalog.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-full text-sm font-bold text-gray-600 transition-colors">
                                <MessageCircle size={18} className="text-[#25D366]" /> Suporte via WhatsApp
                            </a>
                        )}

                        <div className="w-12 h-px bg-gray-200 my-4"></div>

                        {catalog?.plan?.toUpperCase() !== 'PRO' ? (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Feito com</span>
                                <a href="https://beautystockapp.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2.5 rounded-2xl hover:scale-105 transition-transform active:scale-95 border border-pink-100 shadow-sm cursor-pointer">
                                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-[8px] flex items-center justify-center text-white font-black text-[12px] shadow-sm">
                                        B
                                    </div>
                                    <span className="font-extrabold text-gray-700 tracking-tight normal-case text-base">Beauty<span className="text-pink-500">Stock</span></span>
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span className="opacity-70">Tecnologia</span>
                                <a href="https://beautystockapp.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all cursor-pointer">
                                    <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                                        B
                                    </div>
                                    <span className="font-extrabold text-gray-400 tracking-tight normal-case text-sm">Beauty<span className="text-pink-500">Stock</span></span>
                                </a>
                            </div>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
}
