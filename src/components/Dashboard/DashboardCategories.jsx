import { useState, useEffect, memo } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

const DashboardCategories = memo(function DashboardCategories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('categories')
                .select('id, name, color, products(count)')
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setCategories(data?.slice(0, 4) || []);
        } catch (error) {
            console.error('Error fetching categories for dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {/* ícone: bg-subtle no light, translúcido no dark */}
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                        <LayoutGrid size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-lg">Categorias</h3>
                        <p className="text-xs text-muted-foreground font-medium tracking-wide">Organização da Loja</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/categorias')}
                    className="p-2 text-primary hover:bg-accent rounded-xl transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <span className="text-sm font-medium">Carregando...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <LayoutGrid size={32} strokeWidth={1.5} className="text-muted-foreground/40 mb-3" />
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sem categorias</h3>
                    <p className="text-xs text-muted-foreground/60 max-w-[200px] mb-4">
                        Crie categorias para organizar seus produtos.
                    </p>
                    <button
                        onClick={() => navigate('/categorias')}
                        className="text-[11px] font-bold uppercase tracking-wider text-primary bg-accent px-4 py-2 rounded-xl hover:bg-primary/15 transition-colors"
                    >
                        Criar Categoria
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate('/categorias')}
                                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-muted border border-transparent hover:border-border transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                        {cat.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* badge de contagem: bg-card no light, bg-muted no dark */}
                                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg border border-border shadow-sm">
                                        {cat.products[0]?.count || 0}
                                    </span>
                                    <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/categorias')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-accent text-muted-foreground hover:text-primary font-bold rounded-2xl text-sm transition-colors border border-border group"
                    >
                        Ver todas
                        <ArrowRight size={16} className="transition-colors group-hover:text-primary" />
                    </button>
                </div>
            )}
        </div>
    );
});

export default DashboardCategories;