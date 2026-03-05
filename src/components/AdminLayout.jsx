import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Receipt, ArrowLeft, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Usuários', path: '/admin/usuarios' },
        { icon: CreditCard, label: 'Assinaturas', path: '/admin/assinaturas' },
        { icon: Receipt, label: 'Pagamentos', path: '/admin/pagamentos' },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                        B
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">Admin</h1>
                    </div>
                </div>
                <button onClick={toggleSidebar} className="p-2 -mr-2 text-gray-600">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-6 border-b border-gray-100 hidden md:flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                        B
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">Admin</h1>
                        <p className="text-xs text-gray-500">BeautyStock</p>
                    </div>
                </div>

                <div className="md:hidden p-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Menu Admin</span>
                    <button onClick={toggleSidebar} className="p-1 text-gray-400 hover:text-gray-900">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
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
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors px-3 py-3 rounded-xl shadow-sm w-full"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao App
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto relative w-full pt-16 md:pt-0">
                <Outlet />
            </main>
        </div>
    );
}
