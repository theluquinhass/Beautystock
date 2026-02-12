import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FAB from '../../components/Dashboard/FAB';
import ProductCard from '../../components/Products/ProductCard';
import { usePlan } from '../../hooks/usePlan';

export default function ProductList() {
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('products')
                .select(`*, variations(stock_quantity)`)
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            toast.error('Erro ao carregar produtos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
            toast.success('Produto excluído');
        } catch (error) {
            toast.error('Erro ao excluir');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 animate-pulse">Carregando estoque...</div>;

    return (
        <div className="pb-24">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Meus Produtos</h1>
                {!isPro && (
                    <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {products.length}/5 Produtos
                    </span>
                )}
            </div>

            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-4">
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

            <FAB onClick={() => navigate('/produtos/novo')} />
        </div>
    );
}
