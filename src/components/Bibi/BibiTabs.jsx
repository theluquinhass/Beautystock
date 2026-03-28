import React from 'react';
import { LayoutDashboard, TrendingDown, Trophy, PackageSearch, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function BibiTabs({ activeTab, setActiveTab, isPro, isDesktop = false }) {
    const handleTabChange = (tab) => {
        if (!isPro && tab !== 'resumo' && tab !== 'restock') {
            toast('Bibi completa é exclusiva do plano PRO 💖', {
                icon: '✨',
                style: { borderRadius: '16px', background: '#333', color: '#fff' },
            });
            return;
        }
        setActiveTab(tab);
    };

    const tabs = [
        { id: 'resumo', label: 'Resumo', icon: LayoutDashboard },
        { id: 'restock', label: 'Repor', icon: TrendingDown, pro: false },
        { id: 'top_products', label: 'Campeões', icon: Trophy, pro: true },
        { id: 'dead_stock', label: 'Parados', icon: PackageSearch, pro: true },
    ];

    /* ── Desktop ── */
    if (isDesktop) {
        return (
            <div className="flex gap-2 p-4 pb-0 border-b border-border mb-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isLocked = tab.pro && !isPro;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border relative flex-shrink-0",
                                isActive
                                    ? "bg-accent text-primary border-primary/20 shadow-soft"
                                    : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {isLocked && <Lock size={12} className="text-muted-foreground/50 ml-1" />}

                            {/* Underline ativo */}
                            {isActive && (
                                <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    /* ── Mobile ── */
    const mobileActiveClass = {
        resumo: "bg-foreground text-background shadow-soft",
        restock: "bg-accent text-primary border border-primary/20 shadow-soft",
        top_products: "bg-warning/15 text-warning border border-warning/20 shadow-soft",
        dead_stock: "bg-secondary/20 text-secondary-foreground border border-secondary/25 shadow-soft",
    };

    return (
        <div className="flex p-2 gap-1 bg-card border-b border-border shadow-soft z-20 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLocked = tab.pro && !isPro;

                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                            "flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider relative",
                            isActive
                                ? mobileActiveClass[tab.id]
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon size={14} />
                        {tab.label}
                        {isLocked && (
                            <Lock size={10} className="absolute top-1 right-1 text-muted-foreground/50" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}