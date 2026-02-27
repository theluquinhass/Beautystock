import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

export default function DashboardCategories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch categories and product count
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, color, products(count)')
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setCategories(data?.slice(0, 4) || []); // Show only top 4
        } catch (error) {
            console.error('Error fetching categories for dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                        <LayoutGrid size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Categorias</h3>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">Organização da Loja</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/categorias')}
                    className="p-2 text-pink-500 hover:bg-pink-50 rounded-xl transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-6">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <span className="text-sm font-medium">Carregando...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                        <LayoutGrid size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhuma categoria</p>
                    <p className="text-xs text-gray-400 max-w-[200px] mb-4">Crie categorias para organizar seus produtos.</p>
                    <button
                        onClick={() => navigate('/categorias')}
                        className="text-xs font-bold text-pink-600 bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition-colors"
                    >
                        Criar Categoria
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate('/categorias')}
                                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="font-bold text-gray-700 text-sm group-hover:text-pink-600 transition-colors">
                                        {cat.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                                        {cat.products[0]?.count || 0}
                                    </span>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-pink-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/categorias')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl text-sm transition-colors border border-gray-100 group"
                    >
                        Ver todas
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                </div>
            )}
        </div>
    );
}
