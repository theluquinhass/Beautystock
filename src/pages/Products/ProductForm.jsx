import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash, ArrowLeft, Lock, Box, Layers, Save, Loader2 } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';
import { canAddProduct } from '../../lib/planUtils';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { profile, isPro } = usePlan();
    const [productCount, setProductCount] = useState(0);

    useEffect(() => {
        // Check product count for limit
        if (!id) {
            checkLimit();
        }
    }, [id]);

    const checkLimit = async () => {
        const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
        setProductCount(count || 0);
    };

    const [formData, setFormData] = useState({
        name: '',
        category: '',
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
                category: data.category,
                cost: data.cost,
                price: data.price,
                min_stock: data.min_stock
            });
            if (data.variations?.length > 0) {
                setVariations(data.variations);
            }
        } catch (error) {
            toast.error('Erro ao carregar produto');
        }
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
        if (!id && !canAddProduct(profile, productCount)) {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <Lock className="h-10 w-10 text-pink-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Limite Atingido!
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Seu plano grátis permite apenas 10 produtos.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate('/upgrade');
                            }}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-pink-600 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            Fazer Upgrade
                        </button>
                    </div>
                </div>
            ), { duration: 5000 });
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const productPayload = {
                user_id: user.id,
                name: formData.name,
                category: formData.category,
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
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Box size={20} className="text-pink-500" />
                        Dados Gerais
                    </h3>

                    <div className="space-y-4">
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

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Categoria</label>
                            <input
                                name="category"
                                className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                                value={formData.category}
                                onChange={handleInputChange}
                                placeholder="Ex: Perfume, Maquiagem, Hidratante"
                                required
                            />
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
        </div>
    );
}
