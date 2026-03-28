import { useLocation, Link } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';

export default function DesktopTopbar() {
    const location = useLocation();

    // Map paths to page titles
    const pageTitles = {
        '/dashboard': 'Dashboard de Gestão',
        '/produtos': 'Meus Produtos',
        '/clientes': 'Carteira de Clientes',
        '/movimentacoes': 'Histórico de Vendas',
        '/conta': 'Configurações da Conta',
    };

    // Find the title, default to a generic one or check for sub-routes
    let title = pageTitles[location.pathname];
    if (!title) {
        if (location.pathname.includes('/produtos/')) title = 'Gerenciar Produto';
        else if (location.pathname.includes('/movimentacoes/')) title = 'Nova Movimentação';
        else if (location.pathname.includes('/clientes/')) title = 'Detalhes do Cliente';
        else title = 'BeautyStock';
    }

    // Only show "Novo Produto" button if we are not on a creation page
    const showNewProductBtn = !location.pathname.includes('/novo') && !location.pathname.includes('/nova');

    return (
        <header className="hidden lg:flex items-center justify-between bg-card/60 backdrop-blur-md sticky top-0 z-40 h-20 px-8 border-b border-border/50 mb-6">
            <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">{title}</h2>
                <p className="text-xs text-muted-foreground font-medium">Acompanhe seus dados em tempo real</p>
            </div>

            <div className="flex items-center gap-4">
                {showNewProductBtn && (
                    <Link
                        to="/produtos/novo"
                        data-onboarding="add-product"
                        className="flex items-center gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground dark:text-secondary font-bold py-2.5 px-4 rounded-xl shadow-sm border border-secondary/30 transition-all hover:-translate-y-0.5"
                    >
                        <PackagePlus size={18} strokeWidth={2.5} />
                        <span className="text-sm">Novo Produto</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
