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

    // Data states
    const [settings, setSettings] = useState({
        slug: '',
        whatsapp: '',
        is_active: true,
        show_prices: true,
        store_name: '',
        store_logo_url: '',
        hero_title: '',
        hero_subtitle: ''
    });

    const [categories, setCategories] = useState([]);
    const [hasExistingSettings, setHasExistingSettings] = useState(false);
    const [userPlan, setUserPlan] = useState('FREE');
    const [activeProducts, setActiveProducts] = useState([]);

    const visibleProductsCount = useMemo(() => {
        const visibleCatIds = categories.filter(c => c.is_visible).map(c => c.id);
        return activeProducts.filter(p => visibleCatIds.includes(p.category_id)).length;
    }, [categories, activeProducts]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch settings
            const { data: catSettings } = await supabase
                .from('catalog_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (catSettings) {
                setSettings({
                    slug: catSettings.slug || '',
                    whatsapp: catSettings.whatsapp || '',
                    is_active: catSettings.is_active,
                    show_prices: catSettings.show_prices,
                    store_name: catSettings.store_name || user.user_metadata?.first_name || '',
                    store_logo_url: catSettings.store_logo_url || '',
                    hero_title: catSettings.hero_title || '',
                    hero_subtitle: catSettings.hero_subtitle || ''
                });
                setHasExistingSettings(true);
            }

            // Fetch profile plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', user.id)
                .single();
                
            if (profile) {
                setUserPlan(profile.plan?.toUpperCase() || 'FREE');
            }

            // Fetch products to count visibility
            const { data: products } = await supabase
                .from('products')
                .select('id, category_id')
                .eq('user_id', user.id)
                .eq('is_active', true);
                
            if (products) {
                setActiveProducts(products);
            }

            // Fetch categories and their catalog visibility
            const { data: userCategories } = await supabase
                .from('categories')
                .select('id, name, color')
                .eq('user_id', user.id)
                .order('name');

            const { data: catVisibilities } = await supabase
                .from('catalog_categories')
                .select('category_id, is_visible, sort_order')
                .eq('user_id', user.id);

            if (userCategories) {
                const merged = userCategories.map(cat => {
                    const vis = catVisibilities?.find(v => v.category_id === cat.id);
                    return {
                        ...cat,
                        is_visible: vis ? vis.is_visible : true,
                        sort_order: vis ? vis.sort_order : 0
                    };
                }).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

                setCategories(merged);
            }
        } catch (error) {
            console.error('Error loading catalog data:', error);
            toast.error('Erro ao carregar dados do catálogo.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Validate slug
            const cleanSlug = settings.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

            if (!cleanSlug) {
                toast.error('O link do catálogo não pode estar vazio.');
                setSaving(false);
                return;
            }

            // Upsert settings
            const settingsPayload = {
                user_id: user.id,
                slug: cleanSlug,
                whatsapp: settings.whatsapp.trim(),
                is_active: settings.is_active,
                show_prices: settings.show_prices,
                store_name: settings.store_name.trim(),
                store_logo_url: settings.store_logo_url,
                hero_title: settings.hero_title.trim(),
                hero_subtitle: settings.hero_subtitle.trim(),
                updated_at: new Date().toISOString()
            };

            const { error: settingsError } = await supabase
                .from('catalog_settings')
                .upsert(settingsPayload, { onConflict: 'user_id' });

            if (settingsError) {
                if (settingsError.code === '23505') { // unique violation
                    toast.error('Este link já está em uso por outra loja.');
                    setSaving(false);
                    return;
                }
                throw settingsError;
            }

            // Upsert categories
            for (const cat of categories) {
                await supabase
                    .from('catalog_categories')
                    .upsert({
                        user_id: user.id,
                        category_id: cat.id,
                        is_visible: cat.is_visible,
                        sort_order: cat.sort_order
                    }, { onConflict: 'user_id, category_id' });
            }

            toast.success('Configurações salvas!');
            setHasExistingSettings(true);
            setSettings(prev => ({ ...prev, slug: cleanSlug }));
            
            // Reload data to ensure everything is in sync with DB defaults/triggers
            await loadData();
        } catch (error) {
            console.error('Error saving catalog:', error);
            toast.error('Erro ao salvar as configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('A imagem deve ter no máximo 2MB.');
            return;
        }

        try {
            setSaving(true);
            toast.loading('Fazendo upload da foto...', { id: 'upload' });
            const { data: { user } } = await supabase.auth.getUser();

            // Reusing product image uploader since it's just a storage wrapper
            const path = await uploadProductImage(file, user.id);

            // Resolve the public URL
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(path);

            setSettings(prev => ({ ...prev, store_logo_url: urlData.publicUrl }));
            toast.success('Foto carregada com sucesso!', { id: 'upload' });
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Erro ao fazer upload da foto.', { id: 'upload' });
        } finally {
            setSaving(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/c/${settings.slug}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência!');
    };

    const toggleCategoryVisibility = (id) => {
        setCategories(categories.map(c => c.id === id ? { ...c, is_visible: !c.is_visible } : c));
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500"><Loader2 className="animate-spin" size={32} /></div>;

    const catalogUrl = `${window.location.origin}/c/${settings.slug}`;

    return (
        <div className="pb-48 lg:pb-32 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
            <div className="flex items-center gap-3 mb-6 w-full">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Catálogo Público</h1>
            </div>

            {/* Smart Banner */}
            <div className="w-full bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700 p-[2px] rounded-3xl mb-8 shadow-lg">
                <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 xl:p-10 rounded-[23px] flex flex-col items-center justify-center text-center gap-5 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                    <div className="flex flex-col items-center justify-center relative z-10 w-full text-center">
                        <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-pink-100/50">
                            <Store size={26} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">
                            Sua Loja Online
                        </h2>
                        <p className="text-[15px] sm:text-base text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                            Crie um link exclusivo e venda seus produtos de forma profissional pelas Redes sociais.
                        </p>
                    </div>
                    {hasExistingSettings && settings.is_active && settings.slug && (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full relative z-10 mt-3">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 font-bold px-8 py-3.5 border border-gray-200/80 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                            >
                                <Copy size={18} /> Copiar Link
                            </button>
                            <a
                                href={catalogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-pink-700 transition-all shadow-[0_4px_14px_rgba(219,39,119,0.3)] hover:shadow-[0_6px_20px_rgba(219,39,119,0.4)] active:scale-95 hover:-translate-y-0.5"
                            >
                                <ExternalLink size={18} /> Abrir Catálogo
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Status Banner */}
            <div className={`w-full mb-8 rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-soft border ${userPlan === 'PRO' ? 'bg-gradient-to-r from-gray-900 to-black border-gray-800' : 'bg-white border-pink-100'}`}>
                {userPlan === 'PRO' ? (
                    <>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="relative z-10 text-center md:text-left flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="text-pink-400 font-bold tracking-widest text-sm uppercase">Plano Pro • Ativo</span>
                                <div className="px-2.5 py-1 bg-pink-500/20 text-pink-300 text-xs font-black rounded-full border border-pink-500/30">ILIMITADO</div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Seu catálogo opera sem limites!</h3>
                            <p className="text-gray-400 font-medium">Exiba todos os seus produtos com uma aparência 100% profissional e sem marcas do sistema.</p>
                        </div>
                        <div className="relative z-10 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[180px]">
                                <span className="block text-4xl font-black text-white mb-1">{visibleProductsCount}</span>
                                <span className="block text-sm font-bold text-gray-400">Produtos Visíveis</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative z-10 flex-1 text-center md:text-left">
                           <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="text-pink-600 font-bold tracking-widest text-sm uppercase">Plano Free</span>
                                <div className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-black rounded-full border border-red-100 flex items-center gap-1">Limite: 20 Produtos</div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Desbloqueie seu catálogo completo</h3>
                            <p className="text-gray-500 font-medium mb-5">No plano grátis, apenas os primeiros 20 produtos ficam visíveis online e o catálogo exibe marca d'água.</p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                                <button type="button" onClick={() => navigate('/upgrade')} className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm">
                                    Liberar catálogo Pro
                                </button>
                                <button type="button" onClick={() => navigate('/upgrade')} className="text-sm font-bold text-gray-500 hover:text-gray-900 px-4 py-2 transition-all">
                                    Ver benefícios
                                </button>
                            </div>
                        </div>
                        <div className="relative z-10 w-full md:w-auto flex flex-col items-center gap-3 text-center">
                           {visibleProductsCount > 20 ? (
                               <div className="bg-red-50 rounded-2xl p-5 border border-red-100 text-center w-full sm:min-w-[180px]">
                                   <div className="text-red-500 font-bold mb-1"><span className="text-4xl font-black">20</span><span className="text-lg text-red-400"> / {visibleProductsCount}</span></div>
                                   <span className="block text-sm font-bold text-red-600/80">Exibidos online</span>
                                   <span className="block text-xs text-red-500 mt-2 font-medium bg-red-100 py-1.5 px-2 rounded-lg">{visibleProductsCount - 20} ocultos (Limite Free)</span>
                               </div>
                           ) : (
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center w-full sm:min-w-[180px]">
                                   <div className="text-gray-900 font-bold mb-1"><span className="text-4xl font-black">{visibleProductsCount}</span><span className="text-lg text-gray-400"> / 20</span></div>
                                   <span className="block text-sm font-bold text-gray-500">Exibidos online</span>
                               </div>
                           )}
                        </div>
                    </>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-8 w-full">
                {/* Configurações Gerais */}
                <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Configurações Gerais
                    </h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nome da Loja</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-gray-900 font-medium outline-none"
                                placeholder="Minha Loja Oficial"
                                value={settings.store_name}
                                onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-400 font-medium ml-1">O nome que aparecerá no topo do catálogo público.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Link do seu catálogo</label>
                            <div className="flex items-center gap-0 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-200 focus-within:border-pink-300 transition-all">
                                <span className="pl-4 pr-1 py-3 text-gray-500 text-sm bg-gray-100 border-r border-gray-200 hidden sm:block">
                                    {window.location.host}/c/
                                </span>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-transparent border-none focus:ring-0 text-gray-900 font-medium outline-none"
                                    placeholder="nomedasualoja"
                                    value={settings.slug}
                                    onChange={e => setSettings({ ...settings, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-medium ml-1">Use apenas letras, números e hifens.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">WhatsApp para Pedidos</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-gray-900 font-medium outline-none"
                                    placeholder="5511999999999"
                                    value={settings.whatsapp}
                                    onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-medium ml-1">Coloque o código do país (55) e DDD.</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700">Logo ou Foto do Perfil</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                {settings.store_logo_url ? (
                                    <div className="relative group w-24 h-24 rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                                        <img
                                            src={settings.store_logo_url}
                                            alt="Logo da Loja"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setSettings({ ...settings, store_logo_url: '' })}
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg transform scale-90 group-hover:scale-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 flex-shrink-0 shadow-inner">
                                        <ImagePlus size={24} className="mb-1 opacity-50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Foto</span>
                                    </div>
                                )}
                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={saving}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="button"
                                            className="w-full bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-pink-300 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {settings.store_logo_url ? 'Trocar Foto' : 'Escolher Foto'}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 font-medium">Recomendado: 500x500px. JPG ou PNG. Máx 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-2">
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                                <div>
                                    <span className="font-bold text-gray-800 block">Ativar Catálogo</span>
                                    <span className="text-xs text-gray-500 font-medium">Deixe seus clientes acessarem o link.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-pink-500"
                                    checked={settings.is_active}
                                    onChange={e => setSettings({ ...settings, is_active: e.target.checked })}
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                                <div>
                                    <span className="font-bold text-gray-800 block">Mostrar Preços</span>
                                    <span className="text-xs text-gray-500 font-medium">Exiba os preços dos produtos no catálogo.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-pink-500"
                                    checked={settings.show_prices}
                                    onChange={e => setSettings({ ...settings, show_prices: e.target.checked })}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Personalização do Catálogo */}
                <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Edit3 size={20} className="text-pink-500" />
                        Aparência e Boas-Vindas
                    </h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Título Principal (Hero)</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-gray-900 font-medium outline-none"
                                placeholder={`Bem-vindo(a) à ${settings.store_name || 'minha loja'}`}
                                value={settings.hero_title}
                                onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 font-medium ml-1">Deixe em branco para usar o padrão: "Bem-vindo(a) à [Sua Loja]".</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Subtítulo / Descrição</label>
                            <textarea
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-gray-900 font-medium outline-none resize-none"
                                placeholder="Explore nossa seleção exclusiva de produtos..."
                                rows="3"
                                value={settings.hero_subtitle}
                                onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 font-medium ml-1">Um texto curto para descrever sua loja ou promoções.</p>
                        </div>
                    </div>
                </div>

                {/* Categorias no Catálogo */}
                <div className="bg-white p-6 justify-between rounded-3xl shadow-soft border border-gray-100 flex flex-col gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                Categorias e Visibilidade
                            </h3>
                            <button
                                type="button"
                                onClick={() => navigate('/categorias')}
                                className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl transition-colors"
                            >
                                <Settings2 size={16} /> Gerenciar
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            Escolha quais produtos vão aparecer no seu catálogo público.
                            Categorias ocultas (e seus produtos) não serão mostradas.
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium mb-3">Você ainda não possui categorias criadas.</p>
                            <button
                                type="button"
                                onClick={() => navigate('/categorias')}
                                className="text-white font-bold bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-xl transition-colors shadow-sm"
                            >
                                Criar Nova Categoria
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((cat, idx) => (
                                <div key={cat.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cat.is_visible ? 'bg-white border-pink-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-xl shadow-sm border border-black/5"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className={`font-bold ${cat.is_visible ? 'text-gray-800' : 'text-gray-500'}`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleCategoryVisibility(cat.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${cat.is_visible
                                            ? 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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

                {/* Footer Fix Save Button */}
                <div className="sticky bottom-20 lg:bottom-4 z-40 bg-white/80 backdrop-blur-lg p-4 rounded-3xl shadow-lg border border-gray-100 mt-6 animate-enter">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {saving ? 'Salvando...' : 'Salvar Catálogo'}
                    </button>
                </div>
            </form>
        </div>
    );
}
