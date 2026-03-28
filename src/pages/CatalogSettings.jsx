import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Copy, Store, Eye, EyeOff, Smartphone, ExternalLink, Loader2, ArrowLeft, Settings2, ImagePlus, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { uploadProductImage } from '../lib/productImages';

export default function CatalogSettings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        slug: '', whatsapp: '', is_active: true, show_prices: true,
        store_name: '', store_logo_url: '', hero_title: '', hero_subtitle: ''
    });
    const [categories, setCategories] = useState([]);
    const [hasExistingSettings, setHasExistingSettings] = useState(false);
    const [userPlan, setUserPlan] = useState('FREE');
    const [activeProducts, setActiveProducts] = useState([]);

    const visibleProductsCount = useMemo(() => {
        const visibleCatIds = categories.filter(c => c.is_visible).map(c => c.id);
        return activeProducts.filter(p => visibleCatIds.includes(p.category_id)).length;
    }, [categories, activeProducts]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: catSettings } = await supabase.from('catalog_settings').select('*').eq('user_id', user.id).single();
            if (catSettings) {
                setSettings({
                    slug: catSettings.slug || '', whatsapp: catSettings.whatsapp || '',
                    is_active: catSettings.is_active, show_prices: catSettings.show_prices,
                    store_name: catSettings.store_name || user.user_metadata?.first_name || '',
                    store_logo_url: catSettings.store_logo_url || '',
                    hero_title: catSettings.hero_title || '', hero_subtitle: catSettings.hero_subtitle || ''
                });
                setHasExistingSettings(true);
            }
            const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
            if (profile) setUserPlan(profile.plan?.toUpperCase() || 'FREE');
            const { data: products } = await supabase.from('products').select('id, category_id').eq('user_id', user.id).eq('is_active', true);
            if (products) setActiveProducts(products);
            const { data: userCategories } = await supabase.from('categories').select('id, name, color').eq('user_id', user.id).order('name');
            const { data: catVisibilities } = await supabase.from('catalog_categories').select('category_id, is_visible, sort_order').eq('user_id', user.id);
            if (userCategories) {
                setCategories(userCategories.map(cat => {
                    const vis = catVisibilities?.find(v => v.category_id === cat.id);
                    return { ...cat, is_visible: vis ? vis.is_visible : true, sort_order: vis ? vis.sort_order : 0 };
                }).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)));
            }
        } catch (error) {
            toast.error('Erro ao carregar dados do catálogo.');
        } finally { setLoading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const cleanSlug = settings.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
            if (!cleanSlug) { toast.error('O link do catálogo não pode estar vazio.'); setSaving(false); return; }
            const { error: settingsError } = await supabase.from('catalog_settings').upsert({
                user_id: user.id, slug: cleanSlug, whatsapp: settings.whatsapp.trim(),
                is_active: settings.is_active, show_prices: settings.show_prices,
                store_name: settings.store_name.trim(), store_logo_url: settings.store_logo_url,
                hero_title: settings.hero_title.trim(), hero_subtitle: settings.hero_subtitle.trim(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            if (settingsError) {
                if (settingsError.code === '23505') { toast.error('Este link já está em uso por outra loja.'); setSaving(false); return; }
                throw settingsError;
            }
            for (const cat of categories) {
                await supabase.from('catalog_categories').upsert({
                    user_id: user.id, category_id: cat.id, is_visible: cat.is_visible, sort_order: cat.sort_order
                }, { onConflict: 'user_id, category_id' });
            }
            toast.success('Configurações salvas!');
            setHasExistingSettings(true);
            setSettings(prev => ({ ...prev, slug: cleanSlug }));
            await loadData();
        } catch (error) {
            toast.error('Erro ao salvar as configurações.');
        } finally { setSaving(false); }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 2MB.'); return; }
        try {
            setSaving(true);
            toast.loading('Fazendo upload da foto...', { id: 'upload' });
            const { data: { user } } = await supabase.auth.getUser();
            const path = await uploadProductImage(file, user.id);
            const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
            setSettings(prev => ({ ...prev, store_logo_url: urlData.publicUrl }));
            toast.success('Foto carregada com sucesso!', { id: 'upload' });
        } catch { toast.error('Erro ao fazer upload da foto.', { id: 'upload' }); }
        finally { setSaving(false); e.target.value = ''; }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/c/${settings.slug}`);
        toast.success('Link copiado para a área de transferência!');
    };

    const toggleCategoryVisibility = (id) =>
        setCategories(categories.map(c => c.id === id ? { ...c, is_visible: !c.is_visible } : c));

    // Exibe só os dígitos sem o prefixo 55
    const whatsappDisplay = settings.whatsapp.startsWith('55')
        ? settings.whatsapp.slice(2)
        : settings.whatsapp;

    const handleWhatsappChange = (e) => {
        // Remove tudo que não for dígito
        const digits = e.target.value.replace(/\D/g, '');
        // Salva sempre com 55 na frente
        setSettings({ ...settings, whatsapp: digits ? '55' + digits : '' });
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-primary bg-background"><Loader2 className="animate-spin" size={32} /></div>;

    const catalogUrl = `${window.location.origin}/c/${settings.slug}`;

    /* ── shared classes ── */
    const inputCls = "w-full p-3 bg-input-bg border border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:bg-card focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none font-medium text-sm";
    const labelCls = "text-sm font-bold text-muted-foreground";
    const hintCls = "text-xs text-muted-foreground/60 font-medium ml-1";
    const sectionCls = "bg-card p-6 rounded-3xl shadow-soft border border-border";

    return (
        <div className="pb-48 lg:pb-32 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-foreground">Catálogo Público</h1>
            </div>

            {/* ── Smart Banner ── */}
            <div className="w-full bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700 p-[2px] rounded-3xl mb-8 shadow-pink">
                <div className="bg-card/95 backdrop-blur-xl p-6 sm:p-8 rounded-[23px] flex flex-col items-center justify-center text-center gap-5 relative overflow-hidden w-full">
                    {/* decorative blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                    <div className="flex flex-col items-center relative z-10 w-full">
                        <div className="w-14 h-14 bg-accent text-primary rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-primary/15">
                            <Store size={26} />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-2">Sua Loja Online</h2>
                        <p className="text-[15px] text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                            Crie um link exclusivo e venda seus produtos de forma profissional pelas Redes sociais.
                        </p>
                    </div>

                    {hasExistingSettings && settings.is_active && settings.slug && (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full relative z-10 mt-1">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card text-foreground font-bold px-8 py-3.5 border border-border rounded-xl hover:bg-muted hover:border-border-strong transition-all shadow-soft active:scale-95"
                            >
                                <Copy size={18} /> Copiar Link
                            </button>
                            <a
                                href={catalogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-pink active:scale-95 hover:-translate-y-0.5"
                            >
                                <ExternalLink size={18} /> Abrir Catálogo
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Plan Status Banner ── */}
            {userPlan === 'PRO' ? (
                <div className="w-full mb-8 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-soft border border-border bg-card">
                    {/* glow */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <span className="text-primary font-bold tracking-widest text-sm uppercase">Plano Pro • Ativo</span>
                            <div className="px-2.5 py-1 bg-primary/15 text-primary text-xs font-black rounded-full border border-primary/20">ILIMITADO</div>
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2">Seu catálogo opera sem limites!</h3>
                        <p className="text-muted-foreground font-medium">Exiba todos os seus produtos com aparência 100% profissional e sem marcas do sistema.</p>
                    </div>
                    <div className="relative z-10 w-full md:w-auto">
                        <div className="bg-muted rounded-2xl p-5 border border-border text-center min-w-[180px]">
                            <span className="block text-4xl font-black text-foreground mb-1">{visibleProductsCount}</span>
                            <span className="block text-sm font-bold text-muted-foreground">Produtos Visíveis</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full mb-8 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-soft border border-border bg-card">
                    <div className="relative z-10 flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <span className="text-primary font-bold tracking-widest text-sm uppercase">Plano Free</span>
                            <div className="px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-black rounded-full border border-destructive/20 flex items-center gap-1">Limite: 20 Produtos</div>
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2">Desbloqueie seu catálogo completo</h3>
                        <p className="text-muted-foreground font-medium mb-5">No plano grátis, apenas os primeiros 20 produtos ficam visíveis online e o catálogo exibe marca d'água.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                            <button type="button" onClick={() => navigate('/upgrade')} className="w-full sm:w-auto bg-foreground text-background font-bold px-6 py-3 rounded-xl transition-all shadow-soft hover:opacity-90">
                                Liberar catálogo Pro
                            </button>
                            <button type="button" onClick={() => navigate('/upgrade')} className="text-sm font-bold text-muted-foreground hover:text-foreground px-4 py-2 transition-all">
                                Ver benefícios
                            </button>
                        </div>
                    </div>
                    <div className="relative z-10 w-full md:w-auto flex flex-col items-center gap-3 text-center">
                        {visibleProductsCount > 20 ? (
                            <div className="bg-destructive/10 rounded-2xl p-5 border border-destructive/20 text-center w-full sm:min-w-[180px]">
                                <div className="text-destructive font-bold mb-1">
                                    <span className="text-4xl font-black">20</span>
                                    <span className="text-lg text-destructive/60"> / {visibleProductsCount}</span>
                                </div>
                                <span className="block text-sm font-bold text-destructive/80">Exibidos online</span>
                                <span className="block text-xs text-destructive mt-2 font-medium bg-destructive/10 py-1.5 px-2 rounded-lg">{visibleProductsCount - 20} ocultos (Limite Free)</span>
                            </div>
                        ) : (
                            <div className="bg-muted rounded-2xl p-5 border border-border text-center w-full sm:min-w-[180px]">
                                <div className="font-bold mb-1">
                                    <span className="text-4xl font-black text-foreground">{visibleProductsCount}</span>
                                    <span className="text-lg text-muted-foreground"> / 20</span>
                                </div>
                                <span className="block text-sm font-bold text-muted-foreground">Exibidos online</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8 w-full">

                {/* ── Configurações Gerais ── */}
                <div className={sectionCls}>
                    <h3 className="text-lg font-bold text-foreground mb-6">Configurações Gerais</h3>
                    <div className="space-y-5">

                        {/* Nome da loja */}
                        <div className="space-y-2">
                            <label className={labelCls}>Nome da Loja</label>
                            <input
                                type="text" className={inputCls}
                                placeholder="Minha Loja Oficial"
                                value={settings.store_name}
                                onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                                required
                            />
                            <p className={hintCls}>O nome que aparecerá no topo do catálogo público.</p>
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className={labelCls}>Link do seu catálogo</label>
                            <div className="flex items-center bg-input-bg border border-input rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
                                <span className="pl-4 pr-3 py-3 text-muted-foreground text-sm bg-muted border-r border-border hidden sm:block whitespace-nowrap">
                                    {window.location.host}/c/
                                </span>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-transparent border-none focus:ring-0 text-foreground font-medium outline-none text-sm"
                                    placeholder="nomedasualoja"
                                    value={settings.slug}
                                    onChange={e => setSettings({ ...settings, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <p className={hintCls}>Use apenas letras, números e hifens.</p>
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-2">
                            <label className={labelCls}>WhatsApp para Pedidos</label>
                            <div className="flex items-center bg-input-bg border border-input rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
                                <div className="flex items-center gap-2 pl-3 pr-3 py-3 bg-muted border-r border-border flex-shrink-0">
                                    <Smartphone size={16} className="text-muted-foreground" />
                                    <span className="text-sm font-bold text-muted-foreground">+55</span>
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full p-3 bg-transparent border-none focus:ring-0 text-foreground font-medium outline-none text-sm placeholder:text-muted-foreground"
                                    placeholder="11 99999-9999"
                                    value={whatsappDisplay}
                                    onChange={handleWhatsappChange}
                                    maxLength={11}
                                    required
                                />
                            </div>
                            <p className={hintCls}>Digite o DDD + número. O +55 é adicionado automaticamente.</p>
                        </div>

                        {/* Logo */}
                        <div className="space-y-3">
                            <label className={labelCls}>Logo ou Foto do Perfil</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                {settings.store_logo_url ? (
                                    <div className="relative group w-24 h-24 rounded-2xl border border-border overflow-hidden shadow-soft flex-shrink-0">
                                        <img src={settings.store_logo_url} alt="Logo da Loja" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setSettings({ ...settings, store_logo_url: '' })}
                                                className="p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-all shadow-lg scale-90 group-hover:scale-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground flex-shrink-0">
                                        <ImagePlus size={24} className="mb-1 opacity-50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Foto</span>
                                    </div>
                                )}
                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="relative">
                                        <input
                                            type="file" accept="image/*"
                                            onChange={handleLogoUpload} disabled={saving}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="button"
                                            className="w-full bg-card border border-border text-foreground font-bold px-4 py-2.5 rounded-xl hover:bg-muted hover:border-border-strong transition-all shadow-soft disabled:opacity-50"
                                        >
                                            {settings.store_logo_url ? 'Trocar Foto' : 'Escolher Foto'}
                                        </button>
                                    </div>
                                    <p className={hintCls + " mt-2"}>Recomendado: 500x500px. JPG ou PNG. Máx 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex flex-col gap-3 pt-2">
                            {[
                                { key: 'is_active', title: 'Ativar Catálogo', desc: 'Deixe seus clientes acessarem o link.' },
                                { key: 'show_prices', title: 'Mostrar Preços', desc: 'Exiba os preços dos produtos no catálogo.' },
                            ].map(opt => (
                                <label key={opt.key} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border cursor-pointer hover:bg-muted/70 transition-colors">
                                    <div>
                                        <span className="font-bold text-foreground block">{opt.title}</span>
                                        <span className="text-xs text-muted-foreground font-medium">{opt.desc}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-pink-500"
                                        checked={settings[opt.key]}
                                        onChange={e => setSettings({ ...settings, [opt.key]: e.target.checked })}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Aparência ── */}
                <div className={sectionCls}>
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Edit3 size={20} className="text-primary" />
                        Aparência e Boas-Vindas
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className={labelCls}>Título Principal (Hero)</label>
                            <input
                                type="text" className={inputCls}
                                placeholder={`Bem-vindo(a) à ${settings.store_name || 'minha loja'}`}
                                value={settings.hero_title}
                                onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                            />
                            <p className={hintCls}>Deixe em branco para usar o padrão.</p>
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Subtítulo / Descrição</label>
                            <textarea
                                className={inputCls + " resize-none"}
                                placeholder="Explore nossa seleção exclusiva de produtos..."
                                rows={3}
                                value={settings.hero_subtitle}
                                onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                            />
                            <p className={hintCls}>Um texto curto para descrever sua loja ou promoções.</p>
                        </div>
                    </div>
                </div>

                {/* ── Categorias ── */}
                <div className={sectionCls + " flex flex-col gap-6"}>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-foreground">Categorias e Visibilidade</h3>
                            <button
                                type="button"
                                onClick={() => navigate('/categorias')}
                                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary bg-accent hover:bg-primary/15 px-3 py-1.5 rounded-xl transition-colors"
                            >
                                <Settings2 size={16} /> Gerenciar
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                            Escolha quais produtos vão aparecer no seu catálogo público. Categorias ocultas não serão mostradas.
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <div className="text-center py-8 bg-muted/40 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground font-medium mb-3">Você ainda não possui categorias criadas.</p>
                            <button
                                type="button"
                                onClick={() => navigate('/categorias')}
                                className="text-primary-foreground font-bold bg-primary hover:opacity-90 px-6 py-2 rounded-xl transition-colors shadow-pink"
                            >
                                Criar Nova Categoria
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cat.is_visible
                                            ? 'bg-card border-border shadow-soft'
                                            : 'bg-muted/30 border-border opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl shadow-sm border border-black/10" style={{ backgroundColor: cat.color }} />
                                        <span className={`font-bold text-sm ${cat.is_visible ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleCategoryVisibility(cat.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${cat.is_visible
                                                ? 'bg-accent text-primary hover:bg-primary/15'
                                                : 'bg-muted text-muted-foreground hover:bg-border'
                                            }`}
                                    >
                                        {cat.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {cat.is_visible ? 'Visível' : 'Oculto'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer Save ── */}
                <div className="sticky bottom-20 lg:bottom-4 z-40 bg-card/85 backdrop-blur-lg p-4 rounded-3xl shadow-soft border border-border mt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-pink hover:opacity-90 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Salvando...' : 'Salvar Catálogo'}
                    </button>
                </div>
            </form>
        </div>
    );
}