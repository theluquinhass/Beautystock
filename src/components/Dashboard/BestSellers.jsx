import { Card } from '../ui/card';

export default function BestSellers({ products = [] }) {
    if (!products.length) return null;

    return (
        <section className="mt-8">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg font-bold text-gray-800">Mais vendidos</h2>
                <button className="text-sm text-primary font-medium hover:text-pink-600">
                    Ver tudo
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 px-2 -mx-2 snap-x hide-scrollbar">
                {products.map((product) => (
                    <Card
                        key={product.id}
                        className="min-w-[140px] p-3 flex-col gap-2 snap-center hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-square rounded-xl bg-pink-50 flex items-center justify-center mb-2">
                            {/* Fallback image or product image */}
                            <span className="text-2xl">💄</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                            {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {product.soldCount} vendidos
                        </p>
                    </Card>
                ))}
            </div>
        </section>
    );
}
