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

    // Cart & Discount State
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [discountType, setDiscountType] = useState('NONE'); // 'NONE' | 'PERCENTAGE' | 'FIXED'
    const [discountValue, setDiscountValue] = useState('');

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
        setDiscountType('NONE');
        setDiscountValue('');
    }

    const cartItemsCount = cart.reduce((a, b) => a + b.quantity, 0);
    const cartSubtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    let discountAmount = 0;
    const numDiscountValue = Number(discountValue) || 0;
    if (type === 'EXIT' && numDiscountValue > 0) {
        if (discountType === 'PERCENTAGE') {
            discountAmount = cartSubtotal * (numDiscountValue / 100);
        } else if (discountType === 'FIXED') {
            discountAmount = numDiscountValue;
        }
    }

    // Ensure discount isn't greater than subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);
    const cartTotal = cartSubtotal - discountAmount;

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
                // Determine discount ratio for proportional distribution
                let ratio = 1;
                // If there's a discount, calculate the ratio to apply to each item's unit price
                if (cartSubtotal > 0 && discountAmount > 0) {
                    ratio = cartTotal / cartSubtotal;
                }

                // MULTI-PRODUCT SALE VIA RPC
                const payload = {
                    p_user_id: user.id,
                    p_customer_id: selectedCustomerId || null,
                    p_is_on_credit: selectedCustomerId ? isOnCredit : false,
                    p_total_amount: cartTotal,
                    p_items: cart.map(item => ({
                        variation_id: item.variation_id,
                        quantity: item.quantity,
                        unit_price: Number((item.unit_price * ratio).toFixed(2)) // Ratear desconto centavo por centavo
                    }))
                };

                const { error } = await supabase.rpc('process_sale_transaction', payload);
                if (error) {
                    console.error("RPC Error:", error);
                    if (error.message.includes('function process_sale_transaction does not exist')) {
                        toast.error('Por favor, execute o script SQL "multi_sales_rpc.sql" no Supabase primeiro!');
                        return;
                    }

                    if (error.message.includes('INSUFFICIENT_STOCK:')) {
                        try {
                            // Extract the JSON string from the error message
                            const errorJsonStr = error.message.split('INSUFFICIENT_STOCK:')[1];
                            const insufficientItems = JSON.parse(errorJsonStr);

                            // Format a beautiful error message
                            insufficientItems.forEach(item => {
                                toast.error(
                                    `Estoque insuficiente para: ${item.name}. ` +
                                    `Pedido: ${item.requested}, Disponível: ${item.available}`,
                                    { duration: 6000 }
                                );
                            });

                            return; // Stop the flow, allow the user to fix the cart
                        } catch (e) {
                            console.error("Failed to parse stock error JSON", e);
                            throw new Error("Estoque insuficiente em um ou mais itens. Ajuste as quantidades.");
                        }
                    }

                    if (error.message.includes('check_stock_positive')) {
                        toast.error('Estoque não pode ficar negativo. Revise as quantidades.');
                        return;
                    }

                    throw error;
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

                        {/* Resumo da Venda / Checkout Footer */}
                        <div className="mt-auto flex flex-col gap-5 pt-4 border-t border-gray-100">
                            {/* Discount Section */}
                            {type === 'EXIT' && cart.length > 0 && (
                                <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 animate-in fade-in">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Desconto</span>
                                        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => { setDiscountType('NONE'); setDiscountValue(''); }}
                                                className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", discountType === 'NONE' ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600")}
                                            >
                                                Nenhum
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType('PERCENTAGE')}
                                                className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", discountType === 'PERCENTAGE' ? "bg-pink-50 text-pink-600" : "text-gray-400 hover:text-gray-600")}
                                            >
                                                % (Porc.)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType('FIXED')}
                                                className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", discountType === 'FIXED' ? "bg-pink-50 text-pink-600" : "text-gray-400 hover:text-gray-600")}
                                            >
                                                R$ (Fixo)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Discount Input - Always visible but disabled if NONE */}
                                    <div className="relative">
                                        {discountType === 'FIXED' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>}
                                        <input
                                            type="number"
                                            min="0"
                                            step={discountType === 'PERCENTAGE' ? "1" : "0.01"}
                                            value={discountType === 'NONE' ? '' : discountValue}
                                            onChange={e => setDiscountValue(e.target.value)}
                                            placeholder={discountType === 'NONE' ? "Sem desconto" : discountType === 'PERCENTAGE' ? "Ex: 10" : "Ex: 15.00"}
                                            disabled={discountType === 'NONE'}
                                            className={cn(
                                                "w-full bg-white border rounded-xl focus:ring-4 focus:ring-pink-50 focus:border-pink-300 font-bold text-gray-800 transition-all text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm",
                                                discountType === 'NONE' ? "bg-gray-100/50 text-gray-400 cursor-not-allowed border-gray-200 py-3 px-4 shadow-none" : discountType === 'FIXED' ? "border-gray-200 py-3 pr-3 pl-12" : "border-gray-200 py-3 pl-3 pr-12"
                                            )}
                                        />
                                        {discountType === 'PERCENTAGE' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>}
                                    </div>
                                </div>
                            )}

                            {/* Summary Details */}
                            <div className="bg-white flex flex-col gap-3 px-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'})</span>
                                    <span className="text-gray-700 font-semibold">R$ {cartSubtotal.toFixed(2)}</span>
                                </div>

                                {type === 'EXIT' && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Desconto</span>
                                        <span className={cn("font-semibold", discountAmount > 0 ? "text-emerald-500" : "text-gray-400")}>
                                            {discountAmount > 0 ? `- R$ ${discountAmount.toFixed(2)}` : 'R$ 0.00'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 border-dashed"></div>

                            {/* Final Total */}
                            <div className="flex items-end justify-between px-1">
                                <div className="flex flex-col">
                                    <span className="text-gray-800 font-bold">{type === 'EXIT' ? 'Total da Venda' : 'Total da Entrada'}</span>
                                    <span className="text-xs text-gray-400 font-medium mt-0.5">Valores em Reais (BRL)</span>
                                </div>
                                <span className={cn("text-4xl font-black tracking-tighter", type === 'ENTRY' ? "text-emerald-600" : "text-pink-500")}>
                                    R$ {cartTotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || cart.length === 0}
                                className={cn(
                                    "w-full text-white font-bold text-[17px] py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2",
                                    submitting || cart.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400" : type === 'ENTRY'
                                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5"
                                        : "bg-pink-500 hover:bg-pink-600 shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-0.5"
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
