import { MessageCircle, Copy, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicImageUrl } from '../../lib/productImages';

export default function ProductCardPublic({ product, catalog, handleOrder }) {
    const handleCopy = () => {
        let text = `Gostaria de pedir: ${product.name}`;
        if (product.variations?.length > 0) {
            text += ` (${product.variations[0].name})`;
        }
        if (catalog.show_prices && product.price) {
            text += ` por R$ ${product.price.toFixed(2)}`;
        }
        navigator.clipboard.writeText(text);
        toast.success('Mensagem copiada!');
    };

    const isLowStock = product.variations?.some(v => v.stock_quantity > 0 && v.stock_quantity <= 5);
    const outOfStock = product.variations?.every(v => v.stock_quantity === 0) && product.variations?.length > 0;
    const imageUrl = getPublicImageUrl(product.image_path, product.name);

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-soft border border-pink-50/80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 lg:hover:-translate-y-1 relative group overflow-hidden">
            {/* Image Section */}
            <div className="w-full aspect-square bg-pink-50 rounded-2xl mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100/50 animate-pulse" />

                <img
                    src={imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 transition-opacity duration-500"
                    onLoad={(e) => e.target.classList.remove('opacity-0')}
                    loading="lazy"
                />

                {/* Decorative glow overlay */}
                <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors z-20" />
            </div>

            <div className="flex flex-col flex-1 mb-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {outOfStock ? (
                        <span className="px-2 py-1 bg-red-50 text-red-600 font-bold text-[10px] uppercase rounded-lg border border-red-100 flex items-center gap-1">
                            Esgotado
                        </span>
                    ) : isLowStock ? (
                        <span className="px-2 py-1 bg-orange-50 text-orange-600 font-bold text-[10px] uppercase rounded-lg border border-orange-100">
                            Últimas Unidades
                        </span>
                    ) : null}

                    {product.variations?.map((v, i) => (
                        <span key={v.id || i} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 font-bold text-[10px] uppercase rounded-lg">
                            {v.name}
                        </span>
                    ))}
                </div>

                <h3 className="font-extrabold text-gray-900 text-lg leading-snug mb-2 line-clamp-2" title={product.name}>
                    {product.name}
                </h3>

                {catalog.show_prices && (
                    <p className="text-pink-600 font-black text-2xl mt-1 tracking-tight">
                        <span className="text-sm font-bold opacity-70 mr-1">R$</span>
                        {product.price?.toFixed(2)}
                    </p>
                )}
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                <button
                    onClick={() => handleOrder(product)}
                    disabled={outOfStock}
                    className={`flex-1 font-bold py-3 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 text-sm ${outOfStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#25D366] hover:bg-[#20bd5a] text-white hover:shadow-md'
                        }`}
                >
                    <MessageCircle fill="currentColor" size={18} />
                    <span className="truncate">Pedir agora</span>
                </button>

                {!outOfStock && (
                    <button
                        onClick={handleCopy}
                        className="w-12 h-[44px] flex-shrink-0 bg-white border border-gray-200 text-gray-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:shadow"
                        title="Copiar mensagem do pedido"
                    >
                        <Copy size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
