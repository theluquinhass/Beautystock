import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MovementForm() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]); // For Sales
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        product_id: '',
        variation_id: '',
        customer_id: '',
        type: 'SALE', // 'ENTRY' or 'SALE'
        quantity: 1,
        is_on_credit: false,
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { loadInitialData(); }, []);

    const loadInitialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Products
            const { data: prods } = await supabase
                .from('products')
                .select('id, name, price, variations(id, name, stock_quantity)')
                .eq('user_id', user.id);
            setProducts(prods || []);

            // 2. Customers
            const { data: custs } = await supabase
                .from('customers')
                .select('id, name')
                .eq('user_id', user.id)
                .order('name');
            setCustomers(custs || []);
        } catch (error) {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_id || !form.variation_id || !form.quantity) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Get current product price for record
            const product = products.find(p => p.id === form.product_id);
            const unitPrice = product ? product.price : 0;

            const payload = {
                user_id: user.id,
                variation_id: form.variation_id,
                type: form.type,
                quantity: Number(form.quantity),
                date: new Date(form.date),
                unit_price: unitPrice,
                // Only for SALES
                customer_id: form.type === 'SALE' && form.customer_id ? form.customer_id : null,
                is_on_credit: form.type === 'SALE' && form.customer_id ? form.is_on_credit : false
            };

            const { error } = await supabase.from('movements').insert(payload);
            if (error) throw error;

            toast.success('Movimentação registrada!');
            navigate('/movimentacoes');

        } catch (error) {
            console.error(error);
            toast.error('Erro ao registrar');
        }
    };

    const selectedProductVariations = products.find(p => p.id === form.product_id)?.variations || [];

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500">Carregando...</div>;

    return (
        <div className="pb-24">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Nova Movimentação</h1>
            </div>

            <div className="card bg-white p-6 shadow-soft rounded-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* TYPE SWITCHER */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'SALE' })}
                            className={`py-2 rounded-lg text-sm font-bold transition-all ${form.type === 'SALE'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            VENDA (Saída)
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'ENTRY' })}
                            className={`py-2 rounded-lg text-sm font-bold transition-all ${form.type === 'ENTRY'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            COMPRA (Entrada)
                        </button>
                    </div>

                    <div className="form-group mb-0">
                        <label>Data</label>
                        <input
                            type="date"
                            className="input"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group mb-0">
                        <label>Produto</label>
                        <select
                            className="input"
                            value={form.product_id}
                            onChange={e => setForm({ ...form, product_id: e.target.value, variation_id: '' })}
                            required
                        >
                            <option value="">Selecione...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mb-0">
                        <label>Variação</label>
                        <select
                            className="input"
                            value={form.variation_id}
                            onChange={e => setForm({ ...form, variation_id: e.target.value })}
                            required
                            disabled={!form.product_id}
                        >
                            <option value="">Selecione...</option>
                            {selectedProductVariations.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.name} (Estoque: {v.stock_quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    {form.type === 'SALE' && (
                        <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="form-group mb-2">
                                <label className="text-pink-900">Cliente (Opcional)</label>
                                <select
                                    className="input border-pink-200 focus:ring-pink-400"
                                    value={form.customer_id}
                                    onChange={e => setForm({ ...form, customer_id: e.target.value })}
                                >
                                    <option value="">Venda Avulsa</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {form.customer_id && (
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="fiado"
                                            className="w-6 h-6 border-pink-300 rounded text-pink-500 focus:ring-pink-500"
                                            checked={form.is_on_credit}
                                            onChange={e => setForm({ ...form, is_on_credit: e.target.checked })}
                                        />
                                    </div>
                                    <label htmlFor="fiado" className="font-bold text-gray-800 text-sm">
                                        Vender Fiado? (Receber depois)
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group mb-0">
                        <label>Quantidade</label>
                        <input
                            type="number"
                            min="1"
                            className="input text-lg font-bold"
                            value={form.quantity}
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary h-14 text-lg mt-4 shadow-lg shadow-pink-200">
                        Confirmar
                    </button>
                </form>
            </div>
        </div>
    );
}
