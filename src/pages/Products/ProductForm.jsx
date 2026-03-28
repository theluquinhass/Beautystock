import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash, ArrowLeft, Box, Layers, Save, Loader2, ImagePlus, X } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';
import { canAddProduct, canAddPhoto, canAddCategory } from '../../lib/planUtils';
import { uploadProductImage, getPublicImageUrl } from '../../lib/productImages';
import UpgradeModal from '../../components/UpgradeModal';
import { validateForm, productSchema } from '../../lib/validation';

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

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImagePath, setCurrentImagePath] = useState(null);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
    const [upgradeLimitText, setUpgradeLimitText] = useState('');

    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({ name: '', color: '#ec4899' });
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const [formData, setFormData] = useState({
        name: '', category_id: '', cost: '', price: '', min_stock: ''
    });
    const [variations, setVariations] = useState([{ name: '', stock_quantity: 0 }]);

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { if (id) fetchProduct(); }, [id]);

    const fetchCategories = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase.from('categories').select('*').eq('user_id', user.id).order('name');
        if (data) setCategories(data);
    };

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products').select(`*, variations(*)`).eq('id', id).single();
            if (error) throw error;
            setFormData({
                name: data.name, category_id: data.category_id || '',
                cost: data.cost, price: data.price, min_stock: data.min_stock
            });
            if (data.variations?.length > 0) setVariations(data.variations);
            if (data.image_path) {
                setCurrentImagePath(data.image_path);
                setImagePreview(getPublicImageUrl(data.image_path));
            }
        } catch { toast.error('Erro ao carregar produto'); }
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
        if (file.size > 2 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 2MB'); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); setCurrentImagePath(null); };
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleVariationChange = (index, field, value) => {
        const n = [...variations]; n[index][field] = value; setVariations(n);
    };
    const addVariation = () => setVariations([...variations, { name: '', stock_quantity: 0 }]);
    const removeVariation = (index) => setVariations(variations.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalStock = variations.reduce((acc, v) => acc + Number(v.stock_quantity), 0);
        const { success, errors, data: validatedData } = validateForm(productSchema, {
            ...formData, 
            cost_price: Number(formData.cost), 
            price: Number(formData.price), 
            stock: totalStock 
        });
        if (!success) { toast.error(errors[0]); return; }
        if (validatedData.cost_price > validatedData.price) { toast.error('O custo não pode ser maior que o preço de venda!'); return; }
        if (Number(formData.min_stock) < 1) { toast.error('O estoque mínimo precisa ser 1 ou maior!'); return; }
        if (!id && !canAddProduct(profile, usage.productsCount)) {
            setUpgradeFeatureName('produtos'); setUpgradeLimitText(`${limits?.products || 30} produtos`);
            setShowUpgradeModal(true); return;
        }
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const productPayload = {
                user_id: user.id, name: formData.name, category: '',
                category_id: formData.category_id || null,
                cost: Number(formData.cost), price: Number(formData.price), min_stock: Number(formData.min_stock)
            };
            let productId = id;
            if (id) {
                const { error } = await supabase.from('products').update(productPayload).eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('products').insert(productPayload).select().single();
                if (error) throw error;
                productId = data.id;
            }
            if (imageFile) {
                try {
                    const uploadedPath = await uploadProductImage(imageFile, user.id, productId);
                    await supabase.from('products').update({ image_path: uploadedPath }).eq('id', productId);
                } catch { toast.error('Produto salvo, mas houve um erro ao enviar a imagem.'); }
            } else if (currentImagePath === null && id) {
                await supabase.from('products').update({ image_path: null }).eq('id', productId);
            }
            for (const v of variations) {
                const vp = { product_id: productId, name: v.name, stock_quantity: Number(v.stock_quantity) };
                if (v.id) await supabase.from('variations').update(vp).eq('id', v.id);
                else await supabase.from('variations').insert(vp);
            }
            toast.success('Produto salvo com sucesso!');
            navigate('/produtos');
        } catch (error) {
            toast.error(`Erro ao salvar produto: ${error.message || 'Erro desconhecido'}`);
        } finally { setLoading(false); }
    };

    const handleRemoveMutation = async (index) => {
        const v = variations[index];
        if (v.id) {
            if (!confirm('Isso excluirá a variação do banco de dados imediatamente. Continuar?')) return;
            try {
                await supabase.from('variations').delete().eq('id', v.id);
                removeVariation(index); toast.success('Variação removida');
            } catch { toast.error('Erro ao remover variação'); }
        } else { removeVariation(index); }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setIsCreatingCategory(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
            if (!canAddCategory(profile, count)) {
                setIsCreatingCategory(false); setShowCategoryModal(false);
                setUpgradeFeatureName('categorias'); setUpgradeLimitText(`${limits?.categories || 5} categorias`);
                setShowUpgradeModal(true); return;
            }
            if (categories.some(c => c.name.toLowerCase() === newCategoryData.name.trim().toLowerCase())) {
                toast.error('Categoria já existe!'); setIsCreatingCategory(false); return;
            }
            const { data, error } = await supabase.from('categories')
                .insert({ user_id: user.id, name: newCategoryData.name.trim(), color: newCategoryData.color })
                .select().single();
            if (error) throw error;
            setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
            setFormData({ ...formData, category_id: data.id });
            setShowCategoryModal(false);
            setNewCategoryData({ name: '', color: '#ec4899' });
            toast.success('Categoria criada!');
        } catch { toast.error('Erro ao criar categoria.'); }
        finally { setIsCreatingCategory(false); }
    };

    /* ── shared input classes ── */
    const inputCls = "w-full p-3 bg-input-bg border border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:bg-card focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none text-sm";
    const labelCls = "text-sm font-medium text-muted-foreground";

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/produtos')}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-foreground">
                    {id ? 'Editar Produto' : 'Novo Produto'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-6">

                {/* ── Detalhes ── */}
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Box size={20} className="text-primary" />
                        Detalhes do Produto
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Image upload */}
                        <div className="w-full sm:w-32 h-32 flex-shrink-0 relative group">
                            {imagePreview ? (
                                <>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-2xl shadow-sm border border-border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-card text-destructive rounded-full p-1.5 shadow-md border border-border hover:scale-110 hover:bg-destructive/10 transition-all z-10"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center bg-muted hover:bg-accent border-2 border-dashed border-border hover:border-primary/40 rounded-2xl cursor-pointer transition-colors">
                                    <ImagePlus className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wider transition-colors">
                                        Adicionar Foto
                                    </span>
                                    <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        {/* Fields */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Nome do Produto</label>
                                <input
                                    name="name"
                                    className={inputCls}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ex: Perfume Floral 100ml"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Categoria</label>
                                <div className="flex gap-2">
                                    <select
                                        name="category_id"
                                        className={inputCls + " appearance-none"}
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Selecione uma categoria...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!canAddCategory(profile, usage.categoriesCount)) {
                                                setUpgradeFeatureName('categorias');
                                                setUpgradeLimitText(`${limits?.categories || 5} categorias`);
                                                setShowUpgradeModal(true); return;
                                            }
                                            setShowCategoryModal(true);
                                        }}
                                        className="px-4 bg-accent text-primary border border-primary/20 rounded-xl hover:bg-primary/15 transition-colors flex items-center justify-center font-bold flex-shrink-0"
                                        title="Nova Categoria"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: 'cost', label: 'Custo (R$)', type: 'number' },
                                    { name: 'price', label: 'Venda (R$)', type: 'number' },
                                    { name: 'min_stock', label: 'Estoque Mín.', type: 'number' },
                                ].map(field => (
                                    <div key={field.name} className="space-y-1.5">
                                        <label className={labelCls}>{field.label}</label>
                                        <input
                                            name={field.name}
                                            type={field.type}
                                            step="0.01"
                                            className={inputCls}
                                            value={formData[field.name]}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Variações ── */}
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Layers size={20} className="text-primary" />
                            Variações
                        </h3>
                        <button
                            type="button"
                            onClick={addVariation}
                            className="bg-accent text-primary hover:bg-primary/15 border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Adicionar
                        </button>
                    </div>

                    {variations.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-xl border border-dashed border-border">
                            Nenhuma variação adicionada.
                        </div>
                    )}

                    <div className="space-y-3">
                        {variations.map((v, index) => (
                            <div
                                key={index}
                                className="flex gap-3 items-end p-4 bg-muted/40 rounded-xl border border-border hover:border-primary/20 transition-colors"
                            >
                                <div className="flex-[2] space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Nome / Tamanho
                                    </label>
                                    <input
                                        value={v.name}
                                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                                        className={inputCls}
                                        placeholder="Ex: 50ml"
                                        required
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Estoque
                                    </label>
                                    <input
                                        type="number"
                                        value={v.stock_quantity}
                                        onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMutation(index)}
                                    className="p-2.5 bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border rounded-xl transition-all flex-shrink-0"
                                    title="Remover variação"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Submit ── */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-pink hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Salvando...' : 'Salvar Produto'}
                </button>
            </form>

            {/* ── Modal Nova Categoria ── */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-soft border border-border relative animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-foreground">Nova Categoria</h2>
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(false)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Nome</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    value={newCategoryData.name}
                                    onChange={e => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                                    placeholder="Ex: Perfume"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={labelCls}>Cor</label>
                                <div className="flex flex-wrap gap-3 items-center">
                                    {CATEGORY_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setNewCategoryData({ ...newCategoryData, color: color.value })}
                                            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${newCategoryData.color === color.value ? 'ring-4 ring-primary/30 scale-110 shadow-sm' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.label}
                                        />
                                    ))}
                                    <div className="relative" title="Cor Personalizada">
                                        <input
                                            type="color"
                                            value={newCategoryData.color}
                                            onChange={e => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center transition-all ${!CATEGORY_COLORS.some(c => c.value === newCategoryData.color) ? 'ring-4 ring-primary/30 scale-110 shadow-sm' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}>
                                            {!CATEGORY_COLORS.some(c => c.value === newCategoryData.color) ? (
                                                <div className="w-6 h-6 rounded-full border-2 border-white shadow-inner" style={{ backgroundColor: newCategoryData.color }} />
                                            ) : (
                                                <span className="text-white text-lg font-bold leading-none">+</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 py-3 text-muted-foreground font-bold bg-muted hover:bg-border rounded-xl transition-colors"
                                    disabled={isCreatingCategory}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingCategory}
                                    className="flex-1 py-3 text-primary-foreground font-bold bg-primary hover:opacity-90 rounded-xl shadow-pink transition-all flex justify-center items-center"
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