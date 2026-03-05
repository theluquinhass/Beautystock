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
        <header className="hidden lg:flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-40 h-20 px-8 border-b border-gray-100/50 mb-6">
            <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">{title}</h2>
                <p className="text-xs text-gray-500 font-medium">Acompanhe seus dados em tempo real</p>
            </div>

            <div className="flex items-center gap-4">
                {showNewProductBtn && (
                    <Link
                        to="/produtos/novo"
                        data-onboarding="add-product"
                        className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold py-2.5 px-4 rounded-xl shadow-sm border border-purple-100/50 transition-all hover:-translate-y-0.5"
                    >
                        <PackagePlus size={18} strokeWidth={2.5} />
                        <span className="text-sm">Novo Produto</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
