import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2, Save, Minus, Plus, AlertCircle, ShoppingCart, Trash2, Search, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { movementService } from '../../services/movement.service';

export default function MovementForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Form State
    const [type, setType] = useState('EXIT'); // 'EXIT' (Venda) | 'ENTRY' (Recebimento de Estoque)

    // Cart State
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Checkbox & Optional
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [isOnCredit, setIsOnCredit] = useState(false);

    // Entry Extra Fields
    const [supplierName, setSupplierName] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // Parallel fetch
            const [productsRes, customersRes] = await Promise.all([
                supabase.from('products').select('id, name, price, cost, variations(id, name, stock_quantity)').eq('user_id', user.id).order('name'),
                supabase.from('customers').select('id, name').eq('user_id', user.id).order('name')
            ]);

            if (productsRes.error) throw productsRes.error;
            if (customersRes.error) throw customersRes.error;

            setProducts(productsRes.data || []);
            setCustomers(customersRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar produtos e clientes.');
        } finally {
            setLoading(false);
        }
    };

    // --- CART LOGIC ---

    const filteredProducts = products.filter(p => {
        const term = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(term);
        // We pretend p.sku exists for future compatibility, or fallback to exact name
        const matchSku = p.sku && String(p.sku).toLowerCase() === term.trim();
        return matchName || matchSku;
    });

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            e.preventDefault();
            const term = searchQuery.toLowerCase().trim();

            let foundProduct = null;
            let foundVariation = null;

            for (const p of products) {
                // Exact match by SKU or Name
                if ((p.sku && String(p.sku).toLowerCase() === term) || p.name.toLowerCase() === term) {
                    foundProduct = p;
                    foundVariation = p.variations?.[0];
                    break;
                }
                const vMatch = p.variations?.find(v => (v.sku && String(v.sku).toLowerCase() === term) || v.name.toLowerCase() === term);
                if (vMatch) {
                    foundProduct = p;
                    foundVariation = vMatch;
                    break;
                }
            }

            if (foundProduct && foundVariation) {
                addToCart(foundProduct, foundVariation);
            } else {
                toast.error('SKU não encontrado');
            }
        }
    };

    const addToCart = (product, variation) => {
        setCart(prev => {
            const existing = prev.find(item => item.variation_id === variation.id);
            if (existing) {
                return prev.map(item =>
                    item.variation_id === variation.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                variation_id: variation.id,
                name: `${product.name} - ${variation.name}`,
                unit_price: type === 'ENTRY' ? (product.cost || 0) : (product.price || 0), // Use cost for ENTRY
                cost: product.cost || 0,
                quantity: 1,
                current_stock: variation.stock_quantity
            }];
        });
        setSearchQuery(''); // clear search after adding
        toast.success(`${product.name} adicionado!`);
    };

    const updateQuantity = (variationId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.variation_id === variationId) {
                const newQ = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQ };
            }
            return item;
        }));
    };

    const updatePrice = (variationId, newPrice) => {
        setCart(prev => prev.map(item => {
            if (item.variation_id === variationId) {
                return { ...item, unit_price: Number(newPrice) || 0 };
            }
            return item;
        }));
    };

    const removeFromCart = (variationId) => {
        setCart(prev => prev.filter(item => item.variation_id !== variationId));
    };

    const clearCart = () => {
        setCart([]);
        setSupplierName('');
        setNotes('');
        setSelectedCustomerId('');
        setIsOnCredit(false);
    }

    const cartTotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const cartItemsCount = cart.reduce((a, b) => a + b.quantity, 0);

    // --- SUBMIT LOGIC ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error('Adicione pelo menos um produto.');
            return;
        }

        // Validate negatives
        if (cart.some(item => item.unit_price < 0)) {
            toast.error('O valor/custo dos itens não pode ser negativo.');
            return;
        }

        try {
            setSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (type === 'EXIT') {
                // MULTI-PRODUCT SALE VIA RPC
                const payload = {
                    p_user_id: user.id,
                    p_customer_id: selectedCustomerId || null,
                    p_is_on_credit: selectedCustomerId ? isOnCredit : false,
                    p_total_amount: cartTotal,
                    p_items: cart.map(item => ({
                        variation_id: item.variation_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price
                    }))
                };

                const { error } = await supabase.rpc('process_sale_transaction', payload);
                if (error) {
                    console.error("RPC Error:", error);
                    if (error.message.includes('function process_sale_transaction does not exist')) {
                        toast.error('Por favor, execute o script SQL "multi_sales_rpc.sql" no Supabase primeiro!');
                        return;
                    } else {
                        throw error;
                    }
                }

                toast.success('Venda concluída com sucesso!');
                navigate(-1);
            } else {
                // MULTI-PRODUCT ENTRY VIA RPC
                const payload = {
                    p_user_id: user.id,
                    p_supplier_name: supplierName || null,
                    p_notes: notes || null,
                    p_total_cost: cartTotal,
                    p_items_count: cartItemsCount,
                    p_items: cart.map(item => ({
                        product_id: item.product_id,
                        variation_id: item.variation_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price // this is the cost the user typed
                    }))
                };

                const { error } = await supabase.rpc('process_entry_transaction', payload);
                if (error) {
                    console.error("RPC Error:", error);
                    if (error.message.includes('function process_entry_transaction does not exist')) {
                        toast.error('Por favor, execute o script "multi_entries_rpc.sql" no Supabase primeiro!');
                        return;
                    } else {
                        throw error;
                    }
                }

                toast.success('Entrada de estoque confirmada!');
                navigate(-1);
            }

        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-pink-500 bg-background">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-4 shadow-soft sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden lg:block">
                    <ArrowLeft size={24} />
                </button>
                <div className={cn("flex-1 px-4 lg:px-0", type === 'ENTRY' ? "text-emerald-800" : "text-gray-800")}>
                    <h1 className="text-xl font-bold tracking-tight">
                        {type === 'EXIT' ? 'PDV Rápido' : 'Receber Estoque'}
                    </h1>
                    <p className="text-xs font-medium opacity-70">
                        {type === 'EXIT' ? 'Caixa Aberto' : 'Atualização de Inventário'}
                    </p>
                </div>
            </div>

            <main className="p-4 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">

                {/* LEFT COLUMN: Controls & Search */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                    {/* Operation Type */}
                    <div className="flex bg-gray-200/50 p-1 rounded-2xl w-full">
                        <button
                            type="button"
                            onClick={() => {
                                setType('EXIT');
                                // Transform carts prices to retail prices if switching
                                setCart(prev => prev.map(item => ({ ...item, unit_price: products.find(p => p.id === item.product_id)?.price || 0 })));
                            }}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                type === 'EXIT'
                                    ? "bg-white text-pink-600 shadow-sm scale-100"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <ShoppingCart size={18} />
                            SAÍDA (VENDA)
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setType('ENTRY');
                                // Transform carts prices to cost prices if switching
                                setCart(prev => prev.map(item => ({ ...item, unit_price: item.cost })));
                            }}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                type === 'ENTRY'
                                    ? "bg-white text-emerald-600 shadow-sm scale-100"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <PackageOpen size={18} />
                            ENTRADA DE ESTOQUE
                        </button>
                    </div>

                    {/* Customer Selection (Only for EXIT) */}
                    {type === 'EXIT' && (
                        <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">1. Identificação</h3>
                            <select
                                value={selectedCustomerId}
                                onChange={e => {
                                    setSelectedCustomerId(e.target.value);
                                    if (!e.target.value) setIsOnCredit(false);
                                }}
                                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all font-medium text-gray-800"
                            >
                                <option value="">Venda Avulsa (Cliente Padrão)</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            {selectedCustomerId && (
                                <label className="flex items-center gap-3 p-4 mt-4 rounded-xl bg-pink-50/50 border border-pink-100 cursor-pointer hover:bg-pink-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isOnCredit}
                                        onChange={e => setIsOnCredit(e.target.checked)}
                                        className="w-5 h-5 border-pink-300 rounded text-pink-500 focus:ring-pink-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 text-sm">Vender Fiado</span>
                                        <span className="text-xs text-gray-500">Adicionar à conta deste cliente</span>
                                    </div>
                                </label>
                            )}
                        </div>
                    )}

                    {/* Product Search & List */}
                    <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            {type === 'EXIT' ? '2. Adicionar Produtos' : '1. Adicionar Estoque'}
                        </h3>

                        {/* Search Input */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou SKU..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchEnter}
                                className={cn(
                                    "w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 transition-all font-medium text-gray-800",
                                    type === 'ENTRY' ? "focus:border-emerald-300 focus:ring-emerald-100" : "focus:border-pink-300 focus:ring-pink-100"
                                )}
                            />
                        </div>

                        {/* Product List / Search Results (Always Visible) */}
                        <div className="mb-6 max-h-[400px] overflow-y-auto space-y-2 pr-2 no-scrollbar">
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 text-sm">Nenhum produto encontrado.</div>
                            ) : (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                        <div className="px-4 py-2 bg-gray-100/50 border-b border-gray-100 font-bold text-sm text-gray-700">
                                            {product.name}
                                        </div>
                                        <div className="p-2 space-y-2">
                                            {product.variations?.map(variation => (
                                                <div key={variation.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors group">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 text-sm">{variation.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            Estoque atual: <strong className={variation.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}>{variation.stock_quantity}</strong>
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => addToCart(product, variation)}
                                                        className={cn(
                                                            "bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm group-hover:shadow group-hover:-translate-y-0.5",
                                                            type === 'ENTRY' ? "hover:text-emerald-600 hover:border-emerald-200" : "hover:text-pink-600 hover:border-pink-200"
                                                        )}
                                                    >
                                                        + Adicionar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Cart & Checkout / Resumo da Entrada */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex-1 flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                {type === 'EXIT' ? <ShoppingCart size={16} /> : <PackageOpen size={16} />}
                                {type === 'EXIT' ? `3. Carrinho (${cartItemsCount})` : `2. Resumo da Entrada (${cartItemsCount})`}
                            </h3>
                            {cart.length > 0 && (
                                <button type="button" onClick={clearCart} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                                    Limpar
                                </button>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 opacity-60 mt-10">
                                    {type === 'EXIT' ? <ShoppingCart size={48} strokeWidth={1} /> : <PackageOpen size={48} strokeWidth={1} />}
                                    <p className="text-sm font-medium">{type === 'EXIT' ? 'Carrinho vazio' : 'Nenhum item selecionado'}</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.variation_id} className="relative bg-gray-50 border border-gray-100 p-3 rounded-2xl animate-in fade-in zoom-in-95 mt-2">
                                        <button
                                            onClick={() => removeFromCart(item.variation_id)}
                                            className="absolute -top-3 -right-2 bg-white text-gray-400 hover:text-red-500 border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors z-10"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        <div className="pr-4 mb-3">
                                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h4>
                                            {type === 'EXIT' && item.quantity > item.current_stock && (
                                                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                                    <AlertCircle size={10} /> Estoque insuficiente ({item.current_stock})
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                <button type="button" onClick={() => updateQuantity(item.variation_id, -1)} className={cn("w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors", type === 'ENTRY' ? "hover:text-emerald-600" : "hover:text-pink-600")}>
                                                    <Minus size={14} strokeWidth={3} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.variation_id, 1)} className={cn("w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors", type === 'ENTRY' ? "hover:text-emerald-600" : "hover:text-pink-600")}>
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                            </div>

                                            {/* Price/Cost Input & Subtotal */}
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1.5 rounded-xl shadow-sm w-28 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-300 transition-all">
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase">{type === 'ENTRY' ? 'Custo' : 'Venda'}</span>
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={e => updatePrice(item.variation_id, e.target.value)}
                                                        className="w-full text-right font-bold text-sm text-gray-800 p-0 border-none focus:ring-0 bg-transparent"
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-semibold mr-1">
                                                    Sub: R$ {(item.unit_price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Extra Fields For Entry */}
                        {type === 'ENTRY' && cart.length > 0 && (
                            <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Fornecedor (Opcional)"
                                        value={supplierName}
                                        onChange={e => setSupplierName(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 transition-all font-medium text-gray-800 text-sm"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Observações da compra..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        rows={2}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 transition-all font-medium text-gray-800 text-sm resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Checkout Footer */}
                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-end justify-between px-1 mb-4">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 font-medium text-sm">{type === 'EXIT' ? 'Total da Venda' : 'Custo Total da Entrada'}</span>
                                    <span className="text-xs text-gray-400 font-medium mt-0.5">{cartItemsCount} unidades</span>
                                </div>
                                <span className={cn("text-2xl font-black tracking-tight", type === 'ENTRY' ? "text-emerald-700" : "text-gray-900")}>
                                    R$ {cartTotal.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || cart.length === 0}
                                className={cn(
                                    "w-full text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
                                    submitting || cart.length === 0 ? "opacity-50 cursor-not-allowed" : "",
                                    type === 'ENTRY'
                                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                                        : "bg-pink-500 hover:bg-pink-600 shadow-pink-500/30"
                                )}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                {type === 'EXIT' ? 'Finalizar Venda' : 'Confirmar Entrada'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
