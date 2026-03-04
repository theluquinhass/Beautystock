import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Receipt, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Usuários', path: '/admin/usuarios' },
        { icon: CreditCard, label: 'Assinaturas', path: '/admin/assinaturas' },
        { icon: Receipt, label: 'Pagamentos', path: '/admin/pagamentos' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                        B
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">Admin</h1>
                        <p className="text-xs text-gray-500">BeautyStock</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-gray-900 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao App
                    </Link>
                </div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto bg-gray-50/50 relative">
                <Outlet />
            </main>
        </div>
    );
}
