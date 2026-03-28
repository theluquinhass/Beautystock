import { LogOut, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import NotificationBell from '../Notifications/NotificationBell';

export default function Header({ userName, subtitle }) {
    const { signOut } = useAuth();
    const { isPro } = usePlan();

    return (
        <header className="relative z-50 mb-6 pt-2 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                        Olá, {userName} <span className="inline-block animate-wave">👋</span>
                    </h1>
                    {isPro ? (
                        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-yellow-200 dark:border-yellow-800 uppercase tracking-tighter">
                            <Crown size={8} className="fill-yellow-600" /> PRO
                        </span>
                    ) : (
                        <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold border border-border uppercase tracking-tighter">
                            Free
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                        {subtitle || "Aqui está o resumo do seu negócio hoje"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <button
                    onClick={signOut}
                    className="text-muted-foreground hover:text-primary transition-colors p-2"
                    title="Sair"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
