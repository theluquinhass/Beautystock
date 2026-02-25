import { TrendingUp, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getProductImage } from '../../lib/productImages';

import { useNavigate } from 'react-router-dom';

export default function BestSellers({ products = [] }) {
    const navigate = useNavigate();

    if (!products.length) return null;

    return (
        <section className="mt-8 mb-4">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="bg-pink-100 p-1.5 rounded-lg">
                        <TrendingUp size={16} className="text-pink-600" />
                    </div>
                    <h2 className="text-lg font-black text-gray-800 tracking-tight">Mais vendidos</h2>
                </div>
                <button
                    onClick={() => navigate('/produtos')}
                    className="text-[11px] font-bold uppercase tracking-wider text-pink-500 hover:text-pink-700 hover:bg-pink-50 px-3 py-1.5 rounded-full transition-colors"
                >
                    Ver tudo
                </button>
            </div>

            {/* Horizontal Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-6 px-2 -mx-2 snap-x hide-scrollbar scroll-smooth">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={cn(
                            "relative min-w-[150px] max-w-[150px] p-2 bg-white rounded-3xl border border-pink-50",
                            "shadow-soft hover:shadow-lg transition-all snap-center flex flex-col group"
                        )}
                    >
                        {/* Top Ranking Badge */}
                        <div className="absolute top-3 left-3 z-10">
                            <span className="flex items-center justify-center bg-white/90 backdrop-blur-sm text-[10px] font-black w-6 h-6 rounded-full shadow-sm text-gray-700 border border-white/50">
                                {index + 1}
                            </span>
                        </div>

                        {/* Image Block */}
                        <div className="w-full aspect-square bg-pink-50 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                            {/* Loading state skeleton */}
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100/50 animate-pulse" />

                            <img
                                src={getProductImage(product.name)}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-0 transition-opacity duration-500 z-10"
                                onLoad={(e) => e.target.classList.remove('opacity-0')}
                            />

                            {/* Decorative soft glow/overlay */}
                            <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors z-20" />
                        </div>

                        {/* Product Info */}
                        <div className="px-1 pb-1 flex flex-col flex-1">
                            <h3 className="text-[13px] font-bold text-gray-800 leading-tight line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors">
                                {product.name}
                            </h3>

                            {/* Spacer to push popular indicator to bottom if title is only 1 line */}
                            <div className="mt-auto" />

                            {/* Popularity Indicator */}
                            <div className="inline-flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100/50 self-start">
                                <Flame size={12} className="text-rose-500 fill-rose-500/20" />
                                <span className="text-[10px] font-black text-rose-600 tracking-tight">
                                    {product.soldCount} VENDIDOS
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
