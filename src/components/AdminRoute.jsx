import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
    const { isAdmin, loading } = useAdmin();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-pink-500 bg-gray-50">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
