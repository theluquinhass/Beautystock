import { MessageCircle, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicImageUrl } from '../../lib/productImages';

export default function ProductCardPublic({ product, catalog, handleOrder }) {
    if (!product) return null;

    const handleCopy = () => {
        let text = `Gostaria de pedir: ${product.name || 'Produto'}`;
        if (product.variations?.length > 0) {
            text += ` (${product.variations[0].name || ''})`;
        }
        if (catalog?.show_prices && product.price) {
            text += ` por R$ ${Number(product.price).toFixed(2)}`;
        }
        navigator.clipboard.writeText(text);
        toast.success('Produto copiado!');
    };

    const variations = Array.isArray(product.variations) ? product.variations : [];
    const isLowStock = variations.some(v => v.stock_quantity > 0 && v.stock_quantity <= 5);
    const outOfStock = variations.length > 0 && variations.every(v => v.stock_quantity === 0);
    const imageUrl = getPublicImageUrl(product.image_path, product.name || '');

    const price = product.price ? Number(product.price).toFixed(2) : null;

    return (
        <div className="bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.15)] transition-all duration-500 hover:border-pink-100/50 lg:hover:-translate-y-1.5 relative group overflow-hidden h-full">
            {/* Image Section */}
            <div className="w-full aspect-[4/5] sm:aspect-square bg-gray-50 rounded-[1.5rem] mb-5 relative overflow-hidden group-hover:shadow-inner transition-all flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-pink-50/30" />

                <img
                    src={imageUrl}
                    alt={product.name || 'Produto'}
                    className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 transition-opacity duration-700 sm:group-hover:scale-105 transform origin-center"
                    onLoad={(e) => e.target.classList.remove('opacity-0')}
                    loading="lazy"
                />

                {/* Decorative glow overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />

                {/* Out of Stock Overlay completely blocks image softly */}
                {outOfStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-30 flex items-center justify-center">
                        <span className="bg-gray-900 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-lg rotate-[-12deg]">
                            Esgotado
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 mb-5 relative z-30">
                {/* Badges Container */}
                <div className="flex flex-wrap gap-1.5 mb-3 min-h-[22px]">
                    {!outOfStock && isLowStock && (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg border border-orange-100/50 flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                            Últimas Unidades
                        </span>
                    )}

                    {!outOfStock && variations.slice(0, 2).map((v, i) => (
                        <span key={v.id || i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 font-bold text-[10px] uppercase rounded-lg">
                            {v.name || 'Variação'}
                        </span>
                    ))}
                    {!outOfStock && variations.length > 2 && (
                        <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-400 font-bold text-[10px] uppercase rounded-lg">
                            +{variations.length - 2}
                        </span>
                    )}
                </div>

                <h3 className="font-extrabold text-gray-900 text-[17px] sm:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors" title={product.name}>
                    {product.name || 'Produto sem nome'}
                </h3>

                {catalog?.show_prices ? (
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-gray-400">R$</span>
                        <p className="font-black text-2xl tracking-tight text-gray-900">
                            {price || '0.00'}
                        </p>
                    </div>
                ) : (
                    <div className="mt-1 flex items-center text-xs font-bold text-gray-400 gap-1 opacity-70">
                        <CheckCircle2 size={14} /> Consulte disponibilidade
                    </div>
                )}
            </div>

            <div className="flex gap-2.5 mt-auto relative z-30">
                <button
                    onClick={() => handleOrder(product)}
                    disabled={outOfStock}
                    className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 text-[13px] uppercase tracking-wide
                    ${outOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50'
                            : 'bg-black hover:bg-gray-800 text-white hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:-translate-y-0.5'
                        }`}
                >
                    {outOfStock ? 'Indisponível' : (
                        <>
                            <MessageCircle size={16} />
                            <span className="truncate">Eu Quero</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
