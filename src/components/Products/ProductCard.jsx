import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, AlertTriangle, Box } from 'lucide-react';
import { Card } from '../ui/card';
import { getPublicImageUrl } from '../../lib/productImages';

const ProductCard = memo(function ProductCard({ product, onDelete }) {
    const totalStock = product.variations?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) || 0;
    const lowStock = totalStock <= (product.min_stock || 0);
    const imageUrl = getPublicImageUrl(product.image_path, product.name);

    return (
        <Card className="p-3.5 sm:p-4 flex flex-row items-center gap-3 sm:gap-4 shadow-soft border border-border hover:border-primary/30 hover:shadow-pink transition-all group overflow-hidden bg-card relative">

            {/* Thumbnail / Icon Placeholder */}
            {product.image_path ? (
                <div className="relative flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-muted border border-border shadow-sm"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            ) : (
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${lowStock
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-accent text-primary border border-primary/15'
                    }`}>
                    {lowStock ? <AlertTriangle size={24} /> : <Box size={24} />}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 min-w-0 pr-1">
                <h3 className="font-bold text-foreground text-[15px] sm:text-base leading-tight truncate mb-1.5 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0">
                    <span className="font-black text-foreground text-sm sm:text-[15px] whitespace-nowrap">
                        R$ {product.price?.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className={`flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${lowStock
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-muted text-muted-foreground'
                            }`}>
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 border-l border-border pl-2 sm:pl-3 flex-shrink-0">
                <Link
                    to={`/produtos/${product.id}`}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-xl transition-all"
                    title="Editar"
                >
                    <Edit size={18} strokeWidth={2.5} />
                </Link>
                <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                    title="Excluir"
                >
                    <Trash size={18} strokeWidth={2.5} />
                </button>
            </div>

            {/* Low stock strip */}
            {lowStock && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-xl" />
            )}
        </Card>
    );
});

export default ProductCard;