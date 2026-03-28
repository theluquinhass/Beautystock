import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2, Save, Minus, Plus, AlertCircle, ShoppingCart, Trash2, Search, PackageOpen, X, User, Banknote, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { movementService } from '../../services/movement.service';

export default function MovementForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [type, setType] = useState('EXIT');
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [discountType, setDiscountType] = useState('NONE');
    const [discountValue, setDiscountValue] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(null); // null | 'AVISTA' | 'FIADO'
    const [supplierName, setSupplierName] = useState('');
    const [notes, setNotes] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerSearchRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(e.target)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCustomerName = customers.find(c => c.id === selectedCustomerId)?.name || '';

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');
            const [productsRes, customersRes] = await Promise.all([
                supabase.from('products').select('id, name, price, cost, variations(id, name, stock_quantity)').eq('user_id', user.id).order('name'),
                supabase.from('customers').select('id, name').eq('user_id', user.id).order('name')
            ]);
            if (productsRes.error) throw productsRes.error;
            if (customersRes.error) throw customersRes.error;
            setProducts(productsRes.data || []);
            setCustomers(customersRes.data || []);
        } catch (error) {
            toast.error('Erro ao carregar produtos e clientes.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const term = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(term) || (p.sku && String(p.sku).toLowerCase() === term.trim());
    });

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            e.preventDefault();
            const term = searchQuery.toLowerCase().trim();
            let foundProduct = null, foundVariation = null;
            for (const p of products) {
                if ((p.sku && String(p.sku).toLowerCase() === term) || p.name.toLowerCase() === term) {
                    foundProduct = p; foundVariation = p.variations?.[0]; break;
                }
                const vMatch = p.variations?.find(v => (v.sku && String(v.sku).toLowerCase() === term) || v.name.toLowerCase() === term);
                if (vMatch) { foundProduct = p; foundVariation = vMatch; break; }
            }
            if (foundProduct && foundVariation) addToCart(foundProduct, foundVariation);
            else toast.error('SKU não encontrado');
        }
    };

    const addToCart = (product, variation) => {
        setCart(prev => {
            const existing = prev.find(item => item.variation_id === variation.id);
            if (existing) return prev.map(item => item.variation_id === variation.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, {
                product_id: product.id, variation_id: variation.id,
                name: `${product.name} - ${variation.name}`,
                unit_price: type === 'ENTRY' ? (product.cost || 0) : (product.price || 0),
                cost: product.cost || 0, quantity: 1, current_stock: variation.stock_quantity
            }];
        });
        setSearchQuery('');
        toast.success(`${product.name} adicionado!`);
    };

    const updateQuantity = (variationId, delta) => setCart(prev => prev.map(item => item.variation_id === variationId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    const updatePrice = (variationId, newPrice) => setCart(prev => prev.map(item => item.variation_id === variationId ? { ...item, unit_price: Number(newPrice) || 0 } : item));
    const removeFromCart = (variationId) => setCart(prev => prev.filter(item => item.variation_id !== variationId));
    const clearCart = () => { setCart([]); setSupplierName(''); setNotes(''); setSelectedCustomerId(''); setPaymentMethod(null); setDiscountType('NONE'); setDiscountValue(''); setCustomerSearch(''); };

    const cartItemsCount = cart.reduce((a, b) => a + b.quantity, 0);
    const cartSubtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    let discountAmount = 0;
    const numDiscountValue = Number(discountValue) || 0;
    if (type === 'EXIT' && numDiscountValue > 0) {
        if (discountType === 'PERCENTAGE') discountAmount = cartSubtotal * (numDiscountValue / 100);
        else if (discountType === 'FIXED') discountAmount = numDiscountValue;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);
    const cartTotal = cartSubtotal - discountAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) { toast.error('Adicione pelo menos um produto.'); return; }
        if (type === 'EXIT' && !paymentMethod) { toast.error('Selecione se a venda é À Vista ou Fiado.'); return; }
        if (type === 'EXIT' && paymentMethod === 'FIADO' && !selectedCustomerId) { toast.error('Selecione um cliente para vender fiado.'); return; }
        if (cart.some(item => item.unit_price < 0)) { toast.error('O valor/custo dos itens não pode ser negativo.'); return; }
        try {
            setSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (type === 'EXIT') {
                let ratio = cartSubtotal > 0 && discountAmount > 0 ? cartTotal / cartSubtotal : 1;
                const payload = {
                    p_user_id: user.id, p_customer_id: selectedCustomerId || null,
                    p_is_on_credit: paymentMethod === 'FIADO' && !!selectedCustomerId, p_total_amount: cartTotal,
                    p_items: cart.map(item => ({ variation_id: item.variation_id, quantity: item.quantity, unit_price: Number((item.unit_price * ratio).toFixed(2)) }))
                };
                const { error } = await supabase.rpc('process_sale_transaction', payload);
                if (error) {
                    if (error.message.includes('function process_sale_transaction does not exist')) { toast.error('Execute o script SQL "multi_sales_rpc.sql" no Supabase primeiro!'); return; }
                    const errStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
                    const errMsg = error.message || '', errDetails = error.details || '';
                    if ([errStr, errMsg, errDetails].some(s => s.includes('INSUFFICIENT_STOCK'))) {
                        try {
                            const targetStr = errMsg.includes('INSUFFICIENT_STOCK') ? errMsg : errDetails;
                            const s = targetStr.indexOf('['), e2 = targetStr.lastIndexOf(']');
                            if (s !== -1 && e2 !== -1) {
                                JSON.parse(targetStr.substring(s, e2 + 1)).forEach(item => toast.error(`Estoque insuficiente: ${item.name}. Pedido: ${item.requested}, Disponível: ${item.available}`, { duration: 6000 }));
                                return;
                            }
                        } catch { }
                        toast.error('Estoque insuficiente em um ou mais itens.'); return;
                    }
                    if (errStr.includes('check_stock_positive')) { toast.error('Estoque não pode ficar negativo.'); return; }
                    throw error;
                }
                toast.success('Venda concluída com sucesso!'); navigate(-1);
            } else {
                const payload = {
                    p_user_id: user.id, p_supplier_name: supplierName || null, p_notes: notes || null,
                    p_total_cost: cartTotal, p_items_count: cartItemsCount,
                    p_items: cart.map(item => ({ product_id: item.product_id, variation_id: item.variation_id, quantity: item.quantity, unit_price: item.unit_price }))
                };
                const { error } = await supabase.rpc('process_entry_transaction', payload);
                if (error) {
                    if (error.message.includes('function process_entry_transaction does not exist')) { toast.error('Execute o script "multi_entries_rpc.sql" no Supabase primeiro!'); return; }
                    throw error;
                }
                toast.success('Entrada de estoque confirmada!'); navigate(-1);
            }
        } catch (error) {
            toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        } finally { setSubmitting(false); }
    };

    /* ── shared classes ── */
    const inputCls = "w-full p-3.5 bg-input-bg border border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:bg-card focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none font-medium text-sm";
    const sectionCls = "bg-card p-5 rounded-3xl shadow-soft border border-border";

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-primary bg-background">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">

            {/* ── Header ── */}
            <div className="bg-card/80 backdrop-blur-md px-4 py-4 shadow-soft sticky top-0 z-30 flex items-center gap-3 border-b border-border">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors hidden lg:block"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 px-4 lg:px-0">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {type === 'EXIT' ? 'PDV Rápido' : 'Receber Estoque'}
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground">
                        {type === 'EXIT' ? 'Caixa Aberto' : 'Atualização de Inventário'}
                    </p>
                </div>
            </div>

            <main className="p-4 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">

                {/* ── LEFT COLUMN ── */}
                <div className="lg:col-span-7 flex flex-col gap-6">

                    {/* Toggle Saída / Entrada */}
                    <div className="flex bg-muted/60 border border-border p-1 rounded-2xl w-full">
                        <button
                            type="button"
                            onClick={() => { 
                                if (type !== 'EXIT') {
                                    clearCart(); 
                                    setType('EXIT'); 
                                } 
                            }}
                            className={cn(
                                "flex-1 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center leading-tight px-1",
                                type === 'EXIT' ? "bg-card text-primary shadow-soft border border-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShoppingCart size={18} className="shrink-0" /> SAÍDA (VENDA)
                        </button>
                        <button
                            type="button"
                            onClick={() => { 
                                if (type !== 'ENTRY') {
                                    clearCart(); 
                                    setType('ENTRY'); 
                                } 
                            }}
                            className={cn(
                                "flex-1 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center leading-tight px-1",
                                type === 'ENTRY' ? "bg-card text-success shadow-soft border border-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <PackageOpen size={18} className="shrink-0" /> ENTRADA DE ESTOQUE
                        </button>
                    </div>

                    {/* Identificação do Cliente */}
                    {type === 'EXIT' && (
                        <div className={cn(sectionCls, "animate-in fade-in slide-in-from-top-4")}>
                            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2"><User size={14} strokeWidth={2.5} /> 1. Identificação do Cliente</span>
                                <button
                                    type="button"
                                    onClick={() => navigate('/clientes/novo')}
                                    className="text-[10px] font-black text-primary hover:text-primary/70 transition-all flex items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/20 hover:scale-105 active:scale-95"
                                >
                                    <Plus size={10} strokeWidth={4} /> NOVO CLIENTE
                                </button>
                            </h3>

                            {/* Searchable customer combobox */}
                            <div className="relative" ref={customerSearchRef}>
                                <Search
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                                />
                                <input
                                    type="text"
                                    placeholder={selectedCustomerName || 'Venda Avulsa (Cliente Padrão)'}
                                    value={customerSearch}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    onChange={e => {
                                        setCustomerSearch(e.target.value);
                                        setShowCustomerDropdown(true);
                                    }}
                                    className={cn(inputCls, 'pl-9 pr-9', selectedCustomerName && !customerSearch ? 'text-foreground font-bold' : 'text-muted-foreground')}
                                />
                                {selectedCustomerId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCustomerId('');
                                            setCustomerSearch('');
                                            setPaymentMethod(null);
                                            setShowCustomerDropdown(false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X size={15} />
                                    </button>
                                )}

                                {showCustomerDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-2xl shadow-soft overflow-hidden max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                        {/* Venda avulsa option */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCustomerId('');
                                                setCustomerSearch('');
                                                setPaymentMethod(null);
                                                setShowCustomerDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors italic border-b border-border"
                                        >
                                            Venda Avulsa (Cliente Padrão)
                                        </button>

                                        {filteredCustomers.length === 0 ? (
                                            <div className="px-4 py-6 text-sm text-muted-foreground text-center flex flex-col items-center gap-3">
                                                <div className="text-xs">Nenhum cliente encontrado</div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/clientes/novo')}
                                                    className="w-fit text-[11px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={12} strokeWidth={4} /> CADASTRAR NOVO
                                                </button>
                                            </div>
                                        ) : filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCustomerId(c.id);
                                                    setCustomerSearch('');
                                                    setPaymentMethod(null);
                                                    setShowCustomerDropdown(false);
                                                }}
                                                className={cn(
                                                    'w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-muted',
                                                    selectedCustomerId === c.id ? 'bg-accent text-primary font-bold' : 'text-foreground'
                                                )}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Toggle */}
                            <div className="mt-6 pt-6 border-t border-border/50">
                                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Forma de Recebimento <span className="text-destructive">*</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('AVISTA')}
                                        className={cn(
                                            "py-3.5 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2",
                                            paymentMethod === 'AVISTA'
                                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-border-hover"
                                        )}
                                    >
                                        <Banknote size={18} /> À VISTA
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!selectedCustomerId}
                                        onClick={() => setPaymentMethod('FIADO')}
                                        className={cn(
                                            "py-3.5 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2",
                                            !selectedCustomerId ? "opacity-30 cursor-not-allowed bg-muted/20 border-dashed" : "",
                                            paymentMethod === 'FIADO'
                                                ? "bg-pink-500/10 border-pink-500 text-pink-500 shadow-sm"
                                                : selectedCustomerId ? "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-border-hover" : "text-muted-foreground/40 border-border/50"
                                        )}
                                    >
                                        <Calendar size={18} /> FIADO
                                    </button>
                                </div>
                                {!selectedCustomerId && (
                                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                                        * Selecione um cliente para habilitar a opção <strong>Fiado</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Busca de Produtos */}
                    <div className={sectionCls}>
                        <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                                {type === 'EXIT' ? <ShoppingCart size={14} strokeWidth={2.5} /> : <PackageOpen size={14} strokeWidth={2.5} />}
                                {type === 'EXIT' ? '2. Adicionar Produtos' : '1. Adicionar Estoque'}
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/produtos/novo')}
                                className="text-[10px] font-black text-primary hover:text-primary/70 transition-all flex items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/20 hover:scale-105 active:scale-95"
                            >
                                <Plus size={10} strokeWidth={4} /> NOVO PRODUTO
                            </button>
                        </h3>

                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou SKU..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchEnter}
                                className={cn(inputCls, "pl-12")}
                            />
                        </div>

                        <div className="mb-6 max-h-[400px] overflow-y-auto space-y-2 pr-2 no-scrollbar">
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30">
                                        <PackageOpen size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-muted-foreground">Produto não encontrado</p>
                                        <p className="text-[11px] text-muted-foreground/60">Deseja cadastrar agora?</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/produtos/novo')}
                                        className="text-[11px] font-black text-primary bg-primary/10 px-6 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={12} strokeWidth={4} /> CADASTRAR PRODUTO
                                    </button>
                                </div>
                            ) : (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="bg-muted/40 rounded-xl border border-border overflow-hidden">
                                        <div className="px-4 py-2 bg-muted border-b border-border font-bold text-sm text-foreground">
                                            {product.name}
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {product.variations?.map(variation => (
                                                <div key={variation.id} className="flex items-center justify-between p-2 hover:bg-card rounded-lg transition-colors group">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground text-sm">{variation.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Estoque: <strong className={variation.stock_quantity > 0 ? 'text-success' : 'text-destructive'}>{variation.stock_quantity}</strong>
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => addToCart(product, variation)}
                                                        className={cn(
                                                            "bg-card border border-border text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-soft group-hover:shadow-pink group-hover:-translate-y-0.5",
                                                            type === 'ENTRY' ? "hover:text-success hover:border-success/30" : "hover:text-primary hover:border-primary/30"
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

                {/* ── RIGHT COLUMN: Carrinho ── */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className={cn(sectionCls, "flex-1 flex flex-col h-full min-h-[500px]")}>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                {type === 'EXIT' ? <ShoppingCart size={16} /> : <PackageOpen size={16} />}
                                {type === 'EXIT' ? `3. Carrinho (${cartItemsCount})` : `2. Resumo (${cartItemsCount})`}
                            </h3>
                            {cart.length > 0 && (
                                <button type="button" onClick={clearCart} className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors">
                                    Limpar
                                </button>
                            )}
                        </div>

                        {/* Itens do carrinho */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-3 mt-10">
                                    {type === 'EXIT' ? <ShoppingCart size={48} strokeWidth={1} /> : <PackageOpen size={48} strokeWidth={1} />}
                                    <p className="text-sm font-medium">{type === 'EXIT' ? 'Carrinho vazio' : 'Nenhum item selecionado'}</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.variation_id} className="relative bg-muted/40 border border-border p-3 rounded-2xl animate-in fade-in zoom-in-95 mt-2">
                                    {/* Btn remover */}
                                    <button
                                        onClick={() => removeFromCart(item.variation_id)}
                                        className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="pr-10 mb-3 min-h-[2rem]">
                                        <h4 className="font-bold text-foreground text-sm leading-tight">{item.name}</h4>
                                        {type === 'EXIT' && item.quantity > item.current_stock && (
                                            <span className="text-[10px] text-destructive font-bold flex items-center gap-1 mt-1">
                                                <AlertCircle size={10} /> Estoque insuficiente ({item.current_stock})
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        {/* Qty controls */}
                                        <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden shadow-soft shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.variation_id, -1)}
                                                className={cn("w-9 h-9 flex items-center justify-center text-muted-foreground transition-colors", type === 'ENTRY' ? "hover:text-success hover:bg-success/10" : "hover:text-primary hover:bg-accent")}
                                            >
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.variation_id, 1)}
                                                className={cn("w-9 h-9 flex items-center justify-center text-muted-foreground transition-colors", type === 'ENTRY' ? "hover:text-success hover:bg-success/10" : "hover:text-primary hover:bg-accent")}
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>

                                        {/* Price input */}
                                        <div className="flex flex-col items-end gap-1 flex-1">
                                            <div className="flex items-center gap-1.5 bg-card border border-border pl-3 pr-2 py-1.5 rounded-xl shadow-soft w-full max-w-[150px] focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase shrink-0">{type === 'ENTRY' ? 'Custo' : 'Venda'}</span>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={e => updatePrice(item.variation_id, e.target.value)}
                                                    className="w-full min-w-0 text-right font-bold text-[15px] sm:text-base text-foreground p-0 border-none focus:ring-0 bg-transparent outline-none"
                                                />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-semibold mr-1">
                                                Sub: R$ {(item.unit_price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Campos extras entrada */}
                        {type === 'ENTRY' && cart.length > 0 && (
                            <div className="space-y-3 mb-6 pt-4 border-t border-border">
                                <input
                                    type="text"
                                    placeholder="Fornecedor (Opcional)"
                                    value={supplierName}
                                    onChange={e => setSupplierName(e.target.value)}
                                    className={inputCls}
                                />
                                <textarea
                                    placeholder="Observações da compra..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={2}
                                    className={cn(inputCls, "resize-none")}
                                />
                            </div>
                        )}

                        {/* Checkout Footer */}
                        <div className="mt-auto flex flex-col gap-5 pt-4 border-t border-border">

                            {/* Desconto */}
                            {type === 'EXIT' && cart.length > 0 && (
                                <div className="bg-muted/40 border border-border rounded-2xl p-4 animate-in fade-in">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Desconto</span>
                                        <div className="flex bg-card border border-border p-1 rounded-xl shadow-soft">
                                            {[
                                                { key: 'NONE', label: 'Nenhum' },
                                                { key: 'PERCENTAGE', label: '% (Porc.)' },
                                                { key: 'FIXED', label: 'R$ (Fixo)' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.key}
                                                    type="button"
                                                    onClick={() => { setDiscountType(opt.key); if (opt.key === 'NONE') setDiscountValue(''); }}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                                                        discountType === opt.key
                                                            ? opt.key === 'NONE' ? "bg-muted text-foreground" : "bg-accent text-primary"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        {discountType === 'FIXED' && (
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                                        )}
                                        <input
                                            type="number"
                                            min="0"
                                            step={discountType === 'PERCENTAGE' ? "1" : "0.01"}
                                            value={discountType === 'NONE' ? '' : discountValue}
                                            onChange={e => setDiscountValue(e.target.value)}
                                            placeholder={discountType === 'NONE' ? "Sem desconto" : discountType === 'PERCENTAGE' ? "Ex: 10" : "Ex: 15.00"}
                                            disabled={discountType === 'NONE'}
                                            className={cn(
                                                "w-full bg-card border border-border rounded-xl font-bold text-foreground transition-all text-sm outline-none shadow-soft [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                                discountType === 'NONE'
                                                    ? "opacity-40 cursor-not-allowed py-3 px-4"
                                                    : discountType === 'FIXED'
                                                        ? "py-3 pr-4 pl-10 focus:ring-2 focus:ring-ring focus:border-ring"
                                                        : "py-3 pl-4 pr-10 focus:ring-2 focus:ring-ring focus:border-ring"
                                            )}
                                        />
                                        {discountType === 'PERCENTAGE' && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">%</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Subtotal / Desconto */}
                            <div className="flex flex-col gap-3 px-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Subtotal ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'})</span>
                                    <span className="text-foreground font-semibold">R$ {cartSubtotal.toFixed(2)}</span>
                                </div>
                                {type === 'EXIT' && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Desconto</span>
                                        <span className={cn("font-semibold", discountAmount > 0 ? "text-success" : "text-muted-foreground/50")}>
                                            {discountAmount > 0 ? `- R$ ${discountAmount.toFixed(2)}` : 'R$ 0.00'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed border-border" />

                            {/* Total */}
                            <div className="flex items-end justify-between px-1 gap-2">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-foreground font-bold truncate">{type === 'EXIT' ? 'Total da Venda' : 'Total da Entrada'}</span>
                                    <span className="text-xs text-muted-foreground font-medium mt-0.5 truncate">Valores em Reais (BRL)</span>
                                </div>
                                <span className={cn("text-3xl sm:text-4xl font-black tracking-tighter whitespace-nowrap shrink-0", type === 'ENTRY' ? "text-success" : "text-primary")}>
                                    R$ {cartTotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || cart.length === 0 || (type === 'EXIT' && !paymentMethod)}
                                className={cn(
                                    "w-full font-bold text-[17px] py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2",
                                    (submitting || cart.length === 0 || (type === 'EXIT' && !paymentMethod))
                                        ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground"
                                        : type === 'ENTRY'
                                            ? "bg-success text-success-foreground shadow-[0_4px_14px_0_rgba(34,197,94,0.35)] hover:opacity-90 hover:-translate-y-0.5"
                                            : "bg-primary text-primary-foreground shadow-pink hover:opacity-90 hover:-translate-y-0.5"
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