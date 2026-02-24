import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ArrowLeftRight, Users, Crown, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { usePlan } from '../hooks/usePlan';
import DesktopSidebar from './Desktop/DesktopSidebar';
import DesktopTopbar from './Desktop/DesktopTopbar';
import BibiButton from './Bibi/BibiButton';

export default function Layout() {
    const location = useLocation();
    const { isPro } = usePlan();
    const navigate = useNavigate();

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Package, label: 'Produtos', path: '/produtos' },
        { icon: Users, label: 'Clientes', path: '/clientes' },
        { icon: ArrowLeftRight, label: 'Movimentos', path: '/movimentacoes' },
        { icon: User, label: 'Conta', path: '/conta' },
    ];

    return (
        <div className="flex bg-gray-50 h-screen overflow-hidden font-sans">

            {/* SaaS Desktop Sidebar (Hidden on Mobile) */}
            <DesktopSidebar />

            {/* Main Application Area (Takes remaining width) */}
            <div className="flex-1 flex flex-col h-screen overflow-x-hidden relative">

                {/* SaaS Desktop Topbar (Hidden on Mobile) */}
                <DesktopTopbar />

                {/* Mobile Header Upgrade Button (Floating Top Right - Hidden on Desktop) */}
                {!isPro && (
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="lg:hidden fixed top-4 right-4 z-50 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse"
                    >
                        <Crown size={12} className="text-yellow-300 fill-yellow-300" />
                        Seja PRO
                    </button>
                )}

                {/* Main Content Area (Mobile vs Desktop constraints) */}
                {/* On mobile: standard p-4 pb-20 for bottom nav. On desktop: max-w-7xl, larger padding, no bottom padding constraint */}
                <main className="p-4 pb-24 lg:p-8 lg:pb-8 w-full max-w-7xl mx-auto flex-1 h-full">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-colors duration-200",
                                    isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Global Bibi Floating Assistant */}
                <BibiButton />

            </div>
        </div>
    );
}
