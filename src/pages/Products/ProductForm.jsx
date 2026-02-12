import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash, ArrowLeft, Lock } from 'lucide-react';
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
                                    Seu plano grátis permite apenas 5 produtos.
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
            console.error(error);
            toast.error('Erro ao salvar produto');
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
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/produtos')} className="btn" style={{ background: 'transparent', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{id ? 'Editar Produto' : 'Novo Produto'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="layout-form" style={{ maxWidth: '800px' }}>
                <div className="card">
                    <h3>Dados Gerais</h3>
                    <div className="form-group">
                        <label>Nome do Produto</label>
                        <input name="name" className="input" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Categoria</label>
                        <input name="category" className="input" value={formData.category} onChange={handleInputChange} placeholder="Ex: Perfume, Batom" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Custo (R$)</label>
                            <input name="cost" type="number" step="0.01" className="input" value={formData.cost} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Preço Venda (R$)</label>
                            <input name="price" type="number" step="0.01" className="input" value={formData.price} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Estoque Mínimo (Alerta)</label>
                            <input name="min_stock" type="number" className="input" value={formData.min_stock} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Variações</h3>
                        <button type="button" onClick={addVariation} className="btn" style={{ background: '#f3f4f6', fontSize: '0.8rem' }}>
                            <Plus size={16} /> Adicionar
                        </button>
                    </div>

                    {variations.length === 0 && <p style={{ color: '#6b7280' }}>Nenhuma variação adicionada.</p>}

                    {variations.map((v, index) => (
                        <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ flex: 2 }}>
                                <label style={{ fontSize: '0.8rem' }}>Nome (Ex: 50ml, Vermelho)</label>
                                <input
                                    value={v.name}
                                    onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem' }}>Estoque Atual</label>
                                <input
                                    type="number"
                                    value={v.stock_quantity}
                                    onChange={(e) => handleVariationChange(index, 'stock_quantity', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <button type="button" onClick={() => handleRemoveMutation(index)} className="btn btn-danger" style={{ marginBottom: '4px' }}>
                                <Trash size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Produto'}
                </button>
            </form>
        </div>
    );
}
