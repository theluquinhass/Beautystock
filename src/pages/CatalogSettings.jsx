import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Copy, Store, Eye, EyeOff, Smartphone, ExternalLink, Loader2, ArrowLeft, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CatalogSettings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data states
    const [settings, setSettings] = useState({
        slug: '',
        whatsapp: '',
        is_active: true,
        show_prices: true
    });

    const [categories, setCategories] = useState([]);
    const [hasExistingSettings, setHasExistingSettings] = useState(false);

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
                    show_prices: catSettings.show_prices
                });
                setHasExistingSettings(true);
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
                updated_at: new Date()
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
        } catch (error) {
            console.error('Error saving catalog:', error);
            toast.error('Erro ao salvar as configurações.');
        } finally {
            setSaving(false);
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
        <div className="pb-24">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Catálogo Público</h1>
            </div>

            {/* Smart Banner */}
            <div className="bg-gradient-to-r from-pink-50 to-white p-5 rounded-3xl border border-pink-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-soft">
                <div>
                    <h2 className="text-base font-bold text-pink-600 flex items-center gap-2 mb-1">
                        <Store size={20} /> Sua Loja Online
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                        Crie um link exclusivo e venda seus produtos direto pelo WhatsApp.
                    </p>
                </div>
                {hasExistingSettings && settings.is_active && settings.slug && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 font-bold px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Copy size={16} /> Copiar
                        </button>
                        <a
                            href={catalogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-pink-100 text-pink-700 font-bold px-4 py-2 rounded-xl hover:bg-pink-200 transition-colors shadow-sm"
                        >
                            <ExternalLink size={16} /> Abrir
                        </a>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
                {/* Configurações Gerais */}
                <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Configurações Gerais
                    </h3>

                    <div className="space-y-5">
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
                <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-lg p-4 rounded-3xl shadow-lg border border-gray-100 mt-6 animate-enter">
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
