import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ArrowLeftRight, Users, User, PlusCircle, Crown, LogOut, Store } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePlan } from '../../hooks/usePlan';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';

export default function DesktopSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const { signOut } = useAuth();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Produtos', path: '/produtos' },
        { icon: Store, label: 'Catálogo', path: '/catalogo' },
        { icon: Users, label: 'Clientes', path: '/clientes' },
        { icon: ArrowLeftRight, label: 'Movimentações', path: '/movimentacoes' },
        { icon: User, label: 'Minha Conta', path: '/conta' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border sticky top-0 flex-shrink-0 z-50">
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-border/50">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                        B
                    </div>
                    <span className="text-xl font-black text-foreground tracking-tight">Beauty<span className="text-primary">Stock</span></span>
                </Link>
                <NotificationBell align="left" />
            </div>

            {/* Main Action Button */}
            <div className="p-4">
                <Link
                    to="/movimentacoes/nova"
                    data-onboarding="add-movement"
                    className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-2xl shadow-soft transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                    <PlusCircle size={20} />
                    <span>Nova Venda</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-2 mt-2">Menu Principal</div>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            data-onboarding={
                                item.path === '/produtos' ? 'nav-products' :
                                    item.path === '/clientes' ? 'nav-customers' : undefined
                            }
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                            )}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"
                                )}
                            />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* UPGRADE / Footer Section */}
            <div className="p-4 border-t border-border/50">
                {!isPro ? (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-pink-500/10 dark:to-pink-900/10 rounded-2xl p-4 border border-pink-100 dark:border-pink-500/20 relative overflow-hidden group">
                        {/* Glow Effect */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="flex items-center gap-2 mb-2 text-pink-600 dark:text-pink-400 relative z-10">
                            <Crown size={16} className="fill-pink-200 dark:fill-pink-500" />
                            <span className="font-bold text-xs uppercase tracking-wide">Plano Free</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-3 leading-tight relative z-10">
                            Desbloqueie clientes ilimitados e gráficos de lucro.
                        </p>
                        <button
                            onClick={() => navigate('/upgrade')}
                            className="w-full bg-card dark:bg-pink-500/10 text-primary dark:text-pink-300 font-bold text-xs py-2 rounded-xl shadow-sm border border-primary/20 dark:border-pink-500/30 hover:bg-primary/10 dark:hover:bg-pink-500/20 transition-colors relative z-10"
                        >
                            Fazer Upgrade
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-red-500 font-medium transition-colors group"
                    >
                        <LogOut size={20} className="text-muted-foreground group-hover:text-red-500" />
                        <span className="text-sm">Sair do sistema</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
