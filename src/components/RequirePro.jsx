import { Navigate } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';

export default function RequirePro({ children }) {
    const { isPro, loading } = usePlan();

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Verificando plano...</div>; // Or a nice spinner
    }

    if (!isPro) {
        return <Navigate to="/upgrade" replace />;
    }

    return children;
}
