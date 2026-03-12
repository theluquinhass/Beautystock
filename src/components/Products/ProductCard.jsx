import { Link } from 'react-router-dom';
import { Package, Edit, Trash, AlertTriangle, Box } from 'lucide-react';
import { Card } from '../ui/card';
import { getPublicImageUrl } from '../../lib/productImages';

export default function ProductCard({ product, onDelete }) {
    const totalStock = product.variations?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) || 0;
    const lowStock = totalStock <= (product.min_stock || 0);
    const imageUrl = getPublicImageUrl(product.image_path, product.name);

    return (
        <Card className="p-3.5 sm:p-4 flex flex-row items-center gap-3 sm:gap-4 shadow-sm border border-gray-100/50 hover:border-pink-200 hover:shadow-md transition-all group overflow-hidden bg-white/50 backdrop-blur-sm relative">
            {/* Thumbnail / Icon Placeholder */}
            {product.image_path ? (
                <div className="relative flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-gray-50 border border-gray-100 shadow-sm"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${lowStock ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-pink-50 text-pink-400 border border-pink-100'}`}>
                    {lowStock ? <AlertTriangle size={24} /> : <Box size={24} />}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 min-w-0 pr-1">
                <h3 className="font-bold text-gray-800 text-[15px] sm:text-base leading-tight truncate mb-1.5 group-hover:text-pink-600 transition-colors">
                    {product.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0">
                    <span className="font-black text-gray-900 text-sm sm:text-[15px] whitespace-nowrap">
                        R$ {product.price?.toFixed(2)}
                    </span>
                    
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${lowStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {totalStock} un
                        </span>
                        
                        {product.categories && (
                            <span
                                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-white truncate max-w-[100px]"
                                style={{ backgroundColor: product.categories.color || '#ec4899' }}
                            >
                                {product.categories.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions (Edit / Delete) */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 border-l border-gray-100 pl-2 sm:pl-3 flex-shrink-0">
                <Link
                    to={`/produtos/${product.id}`}
                    className="p-2 text-gray-400/80 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                    title="Editar"
                >
                    <Edit size={18} strokeWidth={2.5} />
                </Link>
                <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Excluir"
                >
                    <Trash size={18} strokeWidth={2.5} />
                </button>
            </div>
            
            {/* Low stock indicator strip */}
            {lowStock && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl"></div>
            )}
        </Card>
    );
}
