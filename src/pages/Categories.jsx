import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash, Loader2, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import FAB from '../components/Dashboard/FAB';
import { usePlan } from '../hooks/usePlan';
import { canAddCategory } from '../lib/planUtils';
import UpgradeModal from '../components/UpgradeModal';

const CATEGORY_COLORS = [
    { value: '#ec4899', label: 'Rosa' },
    { value: '#a855f7', label: 'Lilás' },
    { value: '#0ea5e9', label: 'Azul Claro' },
    { value: '#10b981', label: 'Verde Menta' },
    { value: '#f97316', label: 'Pêssego' },
    { value: '#f43f5e', label: 'Rose' },
];

export default function Categories() {
    const navigate = useNavigate();
    const { profile, isPro, usage, limits } = usePlan();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', color: '#ec4899' });

    const handleOpenModal = () => {
        if (!canAddCategory(profile, usage.categoriesCount)) {
            setShowUpgradeModal(true);
            return;
        }
        setShowModal(true);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch categories with exact count of products related to them
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    id, 
                    name, 
                    color, 
                    products (count)
                `)
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;

            // Format the count properly
            const formattedData = data.map(cat => ({
                ...cat,
                productsCount: cat.products[0]?.count || 0
            }));

            setCategories(formattedData);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Erro ao listar categorias.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?\nOs produtos não serão excluídos.`)) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Categoria excluída com sucesso.');
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Erro ao excluir categoria.');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Check duplicate
            if (categories.some(c => c.name.toLowerCase() === formData.name.trim().toLowerCase())) {
                toast.error('Já existe uma categoria com este nome.');
                setIsSubmitting(false);
                return;
            }

            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: user.id,
                    name: formData.name.trim(),
                    color: formData.color
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Categoria criada!');
            setCategories([...categories, { ...data, productsCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
            setShowModal(false);
            setFormData({ name: '', color: '#ec4899' });
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Erro ao criar categoria.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/produtos')}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center justify-between flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
                    {!isPro && (
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {usage.categoriesCount}/{limits?.categories || 5} Categorias
                        </span>
                    )}
                </div>
            </div>

            {/* Smart Organization Banner */}
            <div className="bg-gradient-to-r from-pink-50 to-white p-4 rounded-2xl border border-pink-100 mb-6 shadow-sm">
                <h2 className="text-sm font-bold text-pink-600 flex items-center gap-2 mb-1">
                    🗂 Organização Inteligente
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                    Separe seus produtos por linha e controle melhor seu estoque.
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar categoria..."
                    className="input pl-10 w-full shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Categories List */}
            <div className="space-y-3">
                {filteredCategories.map(category => (
                    <div
                        key={category.id}
                        className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex items-center justify-between transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                                style={{ backgroundColor: category.color || '#ec4899' }}
                            >
                                {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 leading-tight">{category.name}</h3>
                                <div className="text-xs text-gray-500 font-medium mt-0.5">
                                    {category.productsCount} {category.productsCount === 1 ? 'produto' : 'produtos'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <Trash size={18} />
                        </button>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-pink-100">
                        <p className="text-gray-500 font-medium">Nenhuma categoria encontrada.</p>
                        <button
                            onClick={handleOpenModal}
                            className="mt-2 text-pink-500 font-bold hover:underline"
                        >
                            Tentar criar uma?
                        </button>
                    </div>
                )}
            </div>

            <FAB onClick={handleOpenModal} label="Nova Categoria" />

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl relative animate-enter">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Nova Categoria</h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Nome</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Perfume, Maquiagem..."
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Cor</label>
                                <div className="flex flex-wrap gap-3 items-center">
                                    {CATEGORY_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${formData.color === color.value ? 'ring-4 ring-pink-100 scale-110 shadow-sm' : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.label}
                                        />
                                    ))}

                                    {/* Custom Color Picker Option */}
                                    <div className="relative" title="Cor Personalizada">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className={`w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center transition-all ${!CATEGORY_COLORS.some(c => c.value === formData.color) ? 'ring-4 ring-pink-100 scale-110 shadow-sm' : 'hover:scale-105 opacity-80'
                                                }`}
                                        >
                                            {!CATEGORY_COLORS.some(c => c.value === formData.color) ? (
                                                <div
                                                    className="w-6 h-6 rounded-full border-2 border-white shadow-inner"
                                                    style={{ backgroundColor: formData.color }}
                                                />
                                            ) : (
                                                <span className="text-white text-lg font-bold leading-none">+</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 text-white font-bold bg-pink-500 hover:bg-pink-600 rounded-xl shadow-soft transition-all flex justify-center items-center"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={`${limits?.categories || 5} categorias`}
                featureName="categorias"
            />
        </div>
    );
}
