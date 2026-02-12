import { Link } from 'react-router-dom';
import { Package, Edit, Trash, AlertTriangle, Box } from 'lucide-react';
import { Card } from '../ui/card';

export default function ProductCard({ product, onDelete }) {
    const totalStock = product.variations?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) || 0;
    const lowStock = totalStock <= (product.min_stock || 0);

    return (
        <Card className="p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                {/* Icon Placeholder */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStock ? 'bg-red-100 text-red-500' : 'bg-pink-100 text-pink-500'}`}>
                    {lowStock ? <AlertTriangle size={24} /> : <Box size={24} />}
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="font-bold text-gray-900">
                            R$ {product.price?.toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lowStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {totalStock} un
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    to={`/produtos/${product.id}`}
                    className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
                >
                    <Edit size={20} />
                </Link>
                {/* Optional: Add Delete with confirmation here or generic delete handler */}
                {/* For simplicity/safety on mobile, maybe hide delete or make it harder to hit accidentally. 
                    Let's keep it but maybe visually subtle. */}
                <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                    <Trash size={20} />
                </button>
            </div>
        </Card>
    );
}
