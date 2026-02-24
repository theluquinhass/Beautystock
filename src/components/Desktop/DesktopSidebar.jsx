import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ArrowLeftRight, Users, User, PlusCircle, Crown, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePlan } from '../../hooks/usePlan';
import { useAuth } from '../../contexts/AuthContext';

export default function DesktopSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const { signOut } = useAuth();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Produtos', path: '/produtos' },
        { icon: Users, label: 'Clientes', path: '/clientes' },
        { icon: ArrowLeftRight, label: 'Movimentações', path: '/movimentacoes' },
        { icon: User, label: 'Minha Conta', path: '/conta' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-100 sticky top-0 flex-shrink-0">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-gray-50">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                        B
                    </div>
                    <span className="text-xl font-black text-gray-800 tracking-tight">Beauty<span className="text-pink-500">Stock</span></span>
                </Link>
            </div>

            {/* Main Action Button */}
            <div className="p-4">
                <Link
                    to="/movimentacoes/nova"
                    className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-2xl shadow-soft transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                    <PlusCircle size={20} />
                    <span>Nova Venda</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 mt-2">Menu Principal</div>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-pink-50 text-pink-600 font-bold"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
                            )}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    isActive ? "text-pink-500" : "text-gray-400 group-hover:text-gray-600 transition-colors"
                                )}
                            />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* UPGRADE / Footer Section */}
            <div className="p-4 border-t border-gray-50">
                {!isPro ? (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-pink-100">
                        <div className="flex items-center gap-2 mb-2 text-pink-600">
                            <Crown size={16} className="fill-pink-200" />
                            <span className="font-bold text-xs uppercase tracking-wide">Plano Free</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-3 leading-tight">
                            Desbloqueie clientes ilimitados e gráficos de lucro.
                        </p>
                        <button
                            onClick={() => navigate('/upgrade')}
                            className="w-full bg-white text-pink-600 font-bold text-xs py-2 rounded-xl shadow-sm border border-pink-100 hover:bg-pink-50 transition-colors"
                        >
                            Fazer Upgrade
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-red-600 font-medium transition-colors group"
                    >
                        <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
                        <span className="text-sm">Sair do sistema</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
