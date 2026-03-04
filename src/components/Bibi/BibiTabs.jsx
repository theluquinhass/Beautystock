import React from 'react';
import { LayoutDashboard, TrendingDown, Trophy, PackageSearch, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function BibiTabs({ activeTab, setActiveTab, isPro, isDesktop = false }) {
    const handleTabChange = (tab) => {
        if (!isPro && tab !== 'resumo' && tab !== 'restock') {
            toast('Bibi completa é exclusiva do plano PRO 💖', {
                icon: '✨',
                style: {
                    borderRadius: '16px',
                    background: '#333',
                    color: '#fff',
                },
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

    if (isDesktop) {
        return (
            <div className="flex gap-2 p-4 pb-0 border-b border-gray-100 mb-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isLocked = tab.pro && !isPro;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border border-transparent relative",
                                isActive
                                    ? "bg-pink-50 text-pink-600 border-pink-100 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {isLocked && <Lock size={12} className="text-gray-400 ml-1" />}

                            {/* Subtle underline for active desktop tab */}
                            {isActive && (
                                <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-pink-500 rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    // Mobile tabs (original style)
    return (
        <div className="flex p-2 gap-1 bg-white border-b border-gray-100 shadow-sm z-20 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLocked = tab.pro && !isPro;

                let activeClass = "bg-gray-900 text-white shadow-sm";
                if (tab.id === 'restock') activeClass = "bg-pink-50 text-pink-600 shadow-sm border border-pink-100";
                if (tab.id === 'top_products') activeClass = "bg-yellow-50 text-yellow-600 shadow-sm border border-yellow-100";
                if (tab.id === 'dead_stock') activeClass = "bg-purple-50 text-purple-600 shadow-sm border border-purple-100";

                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                            "flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider",
                            isActive ? activeClass : "text-gray-500 hover:bg-gray-50 relative"
                        )}
                    >
                        <Icon size={14} /> {tab.label}
                        {isLocked && <Lock size={10} className="absolute top-1 right-1 text-gray-400" />}
                    </button>
                );
            })}
        </div>
    );
}
