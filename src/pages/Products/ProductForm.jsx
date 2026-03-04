import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash, ArrowLeft, Lock, Box, Layers, Save, Loader2, ImagePlus, X } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';
import { canAddProduct, canAddPhoto, canAddCategory } from '../../lib/planUtils';
import { uploadProductImage, getPublicImageUrl } from '../../lib/productImages';
import UpgradeModal from '../../components/UpgradeModal';

const CATEGORY_COLORS = [
    { value: '#ec4899', label: 'Rosa' },
    { value: '#a855f7', label: 'Lilás' },
    { value: '#0ea5e9', label: 'Azul Claro' },
    { value: '#10b981', label: 'Verde Menta' },
    { value: '#f97316', label: 'Pêssego' },
    { value: '#f43f5e', label: 'Rose' },
];

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { profile, isPro, usage, limits } = usePlan();

    // Image states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImagePath, setCurrentImagePath] = useState(null);

    // Limit States
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
    const [upgradeLimitText, setUpgradeLimitText] = useState('');

    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({ name: '', color: '#ec4899' });
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase.from('categories').select('*').eq('user_id', user.id).order('name');
        if (data) setCategories(data);
    };

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        cost: '',
        price: '',
        min_stock: ''
    });

    const [variations, setVariations] = useState([
        { name: '', stock_quantity: 0 }
    ]);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`*, variations(*)`)
                .eq('id', id)
                .single();

            if (error) throw error;
            setFormData({
                name: data.name,
                category_id: data.category_id || '',
                cost: data.cost,
                price: data.price,
                min_stock: data.min_stock
            });
            if (data.variations?.length > 0) {
                setVariations(data.variations);
            }
            if (data.image_path) {
                setCurrentImagePath(data.image_path);
                setImagePreview(getPublicImageUrl(data.image_path));
            }
        } catch (error) {
            toast.error('Erro ao carregar produto');
        }
    };

    const handleImageChange = (e) => {
        if (!canAddPhoto(profile, usage.photosCount) && !currentImagePath) {
            setUpgradeFeatureName('fotos');
            setUpgradeLimitText(`${limits?.product_photos || 30} fotos de produto`);
            setShowUpgradeModal(true);
            return;
        }

        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setCurrentImagePath(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVariationChange = (index, field, value) => {
        const newVariations = [...variations];
        newVariations[index][field] = value;
        setVariations(newVariations);
    };

    const addVariation = () => {
        setVariations([...variations, { name: '', stock_quantity: 0 }]);
    };

    const removeVariation = (index) => {
        const newVariations = variations.filter((_, i) => i !== index);
        setVariations(newVariations);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Guard: Check limit if creating new product
        if (!id && !canAddProduct(profile, usage.productsCount)) {
            setUpgradeFeatureName('produtos');
            setUpgradeLimitText(`${limits?.products || 30} produtos`);
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!id && !canAddProduct(profile, usage.productsCount)) {
                const { count } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (!canAddProduct(profile, count)) {
                    setLoading(false);
                    setUpgradeFeatureName('produtos');
                    setUpgradeLimitText(`${limits?.products || 30} produtos`);
                    setShowUpgradeModal(true);
                    return;
                }
            }

            const productPayload = {
                user_id: user.id,
                name: formData.name,
                category: '', // Legacy support or clear it entirely, but db still has it unless dropped. We'll set it to empty later when safe.
                category_id: formData.category_id || null, // Updated relation
                cost: Number(formData.cost),
                price: Number(formData.price),
                min_stock: Number(formData.min_stock)
            };

            let productId = id;

            if (id) {
                // Update Product
                const { error } = await supabase
                    .from('products')
                    .update(productPayload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                // Create Product
                const { data, error } = await supabase
                    .from('products')
                    .insert(productPayload)
                    .select()
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            // Upload image if selected
            if (imageFile) {
                try {
                    const uploadedPath = await uploadProductImage(imageFile, user.id, productId);
                    await supabase.from('products').update({ image_path: uploadedPath }).eq('id', productId);
                } catch (imgError) {
                    console.error('Error uploading image:', imgError);
                    toast.error('Produto salvo, mas houve um erro ao enviar a imagem.');
                }
            } else if (currentImagePath === null && id) {
                // Image was removed
                await supabase.from('products').update({ image_path: null }).eq('id', productId);
            }

            // Handle Variations
            // 1. Upsert all current variations
            // 2. Delete removed variations (complex in UI, simple approach: just upsert those present)
            // To handle deletions correctly without complex state tracking: 
            // simple logic: we only added upsert logic here. 
            // If user removed a variation row, we should delete it. 
            // For MVP, we'll implement full sync optionally or just upsert.
            // Let's do a smart thing: get existing IDs for this product, compare with current form IDs.

            // But for Simplicity (MVP):
            // We will loop through form variations. If it has an ID, update. If not, insert.
            // We won't auto-delete variations removed from UI in this simple version unless we track original list.
            // Wait, "CRUD completo" implies delete.
            // I'll skip auto-delete logic for simplicity unless user clicks a delete button on a previously saved item.
            // If `removeVariation` is called, it removes from state. If that item had an ID, we should probably record it to delete on save?
            // Or we can just delete it immediately if it has an ID? -> Better UX: delete immediately with confirm?
            // Let's make `removeVariation` delete from DB immediately if it has ID.

            for (const v of variations) {
                const variationPayload = {
                    product_id: productId,
                    name: v.name,
                    stock_quantity: Number(v.stock_quantity)
                };

                if (v.id) {
                    await supabase.from('variations').update(variationPayload).eq('id', v.id);
                } else {
                    await supabase.from('variations').insert(variationPayload);
                }
            }

            toast.success('Produto salvo com sucesso!');
            navigate('/produtos');
        } catch (error) {
            console.error('FULL ERROR:', error);
            toast.error(`Erro ao salvar produto: ${error.message || date.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMutation = async (index) => {
        const v = variations[index];
        if (v.id) {
            if (!confirm('Isso excluirá a variação do banco de dados imediatamente. Continuar?')) return;
            try {
                await supabase.from('variations').delete().eq('id', v.id);
                removeVariation(index);
                toast.success('Variação removida');
            } catch (e) {
                toast.error('Erro ao remover variação');
            }
        } else {
            removeVariation(index);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setIsCreatingCategory(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { count } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (!canAddCategory(profile, count)) {
                setIsCreatingCategory(false);
                setShowCategoryModal(false);
                setUpgradeFeatureName('categorias');
                setUpgradeLimitText(`${limits?.categories || 5} categorias`);
                setShowUpgradeModal(true);
                return;
            }

            if (categories.some(c => c.name.toLowerCase() === newCategoryData.name.trim().toLowerCase())) {
                toast.error('Categoria já existe!');
                setIsCreatingCategory(false);
                return;
            }

            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: user.id,
                    name: newCategoryData.name.trim(),
                    color: newCategoryData.color
                })
                .select()
                .single();

            if (error) throw error;

            setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
            setFormData({ ...formData, category_id: data.id });
            setShowCategoryModal(false);
            setNewCategoryData({ name: '', color: '#ec4899' });
            toast.success('Categoria criada!');
        } catch (err) {
            toast.error('Erro ao criar categoria.');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    return (
        <div className="pb-24">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/produtos')}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{id ? 'Editar Produto' : 'Novo Produto'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* General Data */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Box size={20} className="text-pink-500" />
                        Detalhes do Produto
                    </h3>

                    {/* Image Upload */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-full sm:w-32 h-32 flex-shrink-0 relative group">
                            {imagePreview ? (
                                <>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-2xl shadow-sm border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md border border-gray-100 hover:scale-110 hover:bg-red-50 transition-all z-10"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-pink-50 border-2 border-dashed border-gray-200 hover:border-pink-300 rounded-2xl cursor-pointer transition-colors group-hover:shadow-inner">
                                    <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-pink-500 mb-2 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-pink-500">Adicionar Foto</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png, image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
                                <input
                                    name="name"
                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ex: Perfume Floral 100ml"
                                />
                            </div>

                            <div className="space-y-1.5 focus-within:z-10 relative">
                                <label className="text-sm font-medium text-gray-700">Categoria</label>
                                <div className="flex gap-2">
                                    <select
                                        name="category_id"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all outline-none appearance-none"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Selecione uma categoria...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!canAddCategory(profile, usage.categoriesCount)) {
                                                setUpgradeFeatureName('categorias');
                                                setUpgradeLimitText(`${limits?.categories || 5} categorias`);
                                                setShowUpgradeModal(true);
                                                return;
                                            }
                                            setShowCategoryModal(true);
                                        }}
                                        className="px-4 bg-pink-50 text-pink-600 border border-pink-100 rounded-xl hover:bg-pink-100 transition-colors flex items-center justify-center font-bold"
                                        title="Nova Categoria"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Custo (R$)</label>
                                    <input
                                        name="cost"
                                        type="number"
                                        step="0.01"
                                        className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Venda (R$)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Estoque Mín.</label>
                                    <input
                                        name="min_stock"
                                        type="number"
                                        className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                        value={formData.min_stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variations */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Layers size={20} className="text-pink-500" />
                            Variações
                        </h3>
                        <button
                            type="button"
                            onClick={addVariation}
                            className="bg-pink-50 text-pink-600 hover:bg-pink-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Adicionar
                        </button>
                    </div>

                    {variations.length === 0 && (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            Nenhuma variação adicionada.
                        </div>
                    )}

                    <div className="space-y-4">
                        {variations.map((v, index) => (
                            <div key={index} className="flex gap-3 items-end p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-pink-100 transition-colors">
                                <div className="flex-[2] space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nome / Tamanho</label>
                                    <input
                                        value={v.name}
                                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                                        className="w-full p-2.5 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 transition-all text-sm"
                                        placeholder="Ex: 50ml"
                                        required
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Estoque</label>
                                    <input
                                        type="number"
                                        value={v.stock_quantity}
                                        onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                                        className="w-full p-2.5 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMutation(index)}
                                    className="p-2.5 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg transition-all"
                                    title="Remover variação"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-gray-200 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {loading ? 'Salvando...' : 'Salvar Produto'}
                </button>
            </form>

            {/* Create Category Modal inline */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl relative animate-enter">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Nova Categoria</h2>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Nome</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={newCategoryData.name}
                                    onChange={e => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                                    placeholder="Ex: Perfume"
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
                                            onClick={() => setNewCategoryData({ ...newCategoryData, color: color.value })}
                                            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${newCategoryData.color === color.value ? 'ring-4 ring-pink-100 scale-110 shadow-sm' : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.label}
                                        />
                                    ))}

                                    {/* Custom Color Picker Option */}
                                    <div className="relative" title="Cor Personalizada">
                                        <input
                                            type="color"
                                            value={newCategoryData.color}
                                            onChange={e => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className={`w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center transition-all ${!CATEGORY_COLORS.some(c => c.value === newCategoryData.color) ? 'ring-4 ring-pink-100 scale-110 shadow-sm' : 'hover:scale-105 opacity-80'
                                                }`}
                                        >
                                            {!CATEGORY_COLORS.some(c => c.value === newCategoryData.color) ? (
                                                <div
                                                    className="w-6 h-6 rounded-full border-2 border-white shadow-inner"
                                                    style={{ backgroundColor: newCategoryData.color }}
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
                                    onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                    disabled={isCreatingCategory}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingCategory}
                                    className="flex-1 py-3 text-white font-bold bg-pink-500 hover:bg-pink-600 rounded-xl shadow-soft transition-all flex justify-center items-center"
                                >
                                    {isCreatingCategory ? <Loader2 className="animate-spin w-5 h-5" /> : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={upgradeLimitText}
                featureName={upgradeFeatureName}
            />
        </div>
    );
}
