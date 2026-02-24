import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import BibiPanel from './BibiPanel';

export default function BibiButton() {
    const { isPro } = usePlan();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Hide on Account page
    if (location.pathname === '/conta') return null;

    const handleClick = () => {
        if (!isPro) {
            toast('Bibi Inteligente é exclusiva do plano PRO 💖', {
                icon: '✨',
                style: {
                    borderRadius: '16px',
                    background: '#333',
                    color: '#fff',
                },
            });
            return;
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={cn(
                    "fixed z-50 flex items-center justify-center gap-2 rounded-full p-4 shadow-xl transition-all active:scale-95",
                    "bottom-40 right-4 lg:bottom-6 lg:right-6",
                    isPro
                        ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/30 animate-pulse-soft"
                        : "bg-gray-400 hover:bg-gray-500 text-white shadow-gray-400/30",
                    isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100" // Hide button when panel is open
                )}
            >
                <Sparkles size={24} strokeWidth={isPro ? 2.5 : 2} />
                <span className="hidden md:block font-bold pr-2">Bibi</span>
            </button>

            {/* Render the Panel */}
            <BibiPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

            <style jsx>{`
                @keyframes pulse-soft {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
                    }
                }
                .animate-pulse-soft {
                    animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </>
    );
}
