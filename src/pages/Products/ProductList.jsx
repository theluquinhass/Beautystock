import { useState } from 'react';
import { Plus, Search, Package, Loader2, Upload, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FAB from '../../components/Dashboard/FAB';
import ProductCard from '../../components/Products/ProductCard';
import ProductImporter from '../../components/Products/ProductImporter';
import { usePlan } from '../../hooks/usePlan';
import { useProducts } from '../../hooks/useProducts';

export default function ProductList() {
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const { products, loading, deleteProduct, fetchProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [showImporter, setShowImporter] = useState(false);

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        await deleteProduct(id);
    };

    const handleImportSuccess = () => {
        fetchProducts(); // Refresh list
    };

    const handleImportClick = () => {
        if (isPro) {
            setShowImporter(true);
        } else {
            if (confirm('A importação via Excel é exclusiva do plano PRO. Deseja fazer upgrade?')) {
                navigate('/upgrade');
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Meus Produtos</h1>
                <div className="flex items-center gap-2">
                    {!isPro && (
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {products.length}/10 Produtos
                        </span>
                    )}
                </div>
            </div>

            {/* Sticky Search Bar & Actions */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-4 shadow-soft -mx-4 px-4 flex flex-col gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        className="input pl-10 w-full shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleImportClick}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full relative overflow-hidden"
                >
                    <div className="flex items-center gap-2">
                        <Upload size={16} />
                        Importar Excel
                        {!isPro && <Lock size={14} className="text-pink-500" />}
                    </div>
                    {!isPro && <div className="absolute inset-0 bg-gray-50/50 cursor-pointer" />}
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onDelete={handleDelete}
                    />
                ))}

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="bg-pink-50 p-4 rounded-full mb-3">
                            <Package size={32} className="text-pink-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
                        <button
                            onClick={() => navigate('/produtos/novo')}
                            className="mt-2 text-pink-500 text-sm font-semibold hover:underline"
                        >
                            Cadastrar Novo
                        </button>
                    </div>
                )}
            </div>

            <div data-onboarding="add-product">
                <FAB onClick={() => navigate('/produtos/novo')} label="Novo Produto" />
            </div>

            {showImporter && (
                <ProductImporter
                    onClose={() => setShowImporter(false)}
                    onSuccess={handleImportSuccess}
                />
            )}
        </div>
    );
}

