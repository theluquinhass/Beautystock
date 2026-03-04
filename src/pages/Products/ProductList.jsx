import { useState } from 'react';
import { Plus, Search, Package, Loader2, Upload, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FAB from '../../components/Dashboard/FAB';
import ProductCard from '../../components/Products/ProductCard';
import ProductImporter from '../../components/Products/ProductImporter';
import UpgradeModal from '../../components/UpgradeModal';
import { usePlan } from '../../hooks/usePlan';
import { canAddProduct } from '../../lib/planUtils';
import { useProducts } from '../../hooks/useProducts';

export default function ProductList() {
    const navigate = useNavigate();
    const { isPro, profile, usage, limits } = usePlan();
    const { products, loading, deleteProduct, fetchProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [showImporter, setShowImporter] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        await deleteProduct(id);
    };

    const handleImportSuccess = () => {
        fetchProducts(); // Refresh list
    };

    // Extract unique categories for the chips
    const uniqueCategories = ['Todos', ...new Set(products.filter(p => p.categories?.name).map(p => p.categories.name))].sort();

    const handleImportClick = () => {
        if (isPro) {
            setShowImporter(true);
        } else {
            if (confirm('A importação via Excel é exclusiva do plano PRO. Deseja fazer upgrade?')) {
                navigate('/upgrade');
            }
        }
    };

    const handleCreateProduct = () => {
        if (canAddProduct(profile, usage.productsCount)) {
            navigate('/produtos/novo');
        } else {
            setShowUpgradeModal(true);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || p.categories?.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Meus Produtos</h1>
                <div className="flex items-center gap-2">
                    {!isPro && (
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {usage.productsCount}/{limits?.products || 30} Produtos
                        </span>
                    )}
                </div>
            </div>

            {/* Sticky Search Bar & Actions */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-4 shadow-soft -mx-4 px-4 flex flex-col gap-3">

                {/* Category Chips Filter */}
                {uniqueCategories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                        {uniqueCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border shadow-sm ${selectedCategory === cat
                                    ? 'bg-pink-50 text-pink-600 border-pink-200 shadow-pink-100/50'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

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
                            onClick={handleCreateProduct}
                            className="mt-2 text-pink-500 text-sm font-semibold hover:underline"
                        >
                            Cadastrar Novo
                        </button>
                    </div>
                )}
            </div>

            <div data-onboarding="add-product">
                <FAB onClick={handleCreateProduct} label="Novo Produto" />
            </div>

            {showImporter && (
                <ProductImporter
                    onClose={() => setShowImporter(false)}
                    onSuccess={handleImportSuccess}
                />
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={`${limits?.products || 30} produtos`}
                featureName="produtos"
            />
        </div>
    );
}

