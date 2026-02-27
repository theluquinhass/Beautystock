import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowRightLeft, LogOut, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const { signOut } = useAuth();

    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/produtos', icon: Package, label: 'Produtos' },
        { to: '/catalogo', icon: Store, label: 'Catálogo' },
        { to: '/movimentacoes', icon: ArrowRightLeft, label: 'Movimentações' },
    ];

    return (
        <div className="sidebar">
            <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>BeautyStock</h2>
            <nav style={{ flex: 1 }}>
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                    >
                        <link.icon size={20} />
                        {link.label}
                    </Link>
                ))}
            </nav>
            <button onClick={signOut} className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                <LogOut size={20} />
                Sair
            </button>
        </div>
    );
}
