import { Plus } from 'lucide-react';

export default function FAB({ onClick, label = "Nova Venda" }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 bg-primary text-white rounded-full p-4 shadow-lg shadow-pink-300 dark:shadow-pink-900/40 transition-transform active:scale-95 hover:bg-pink-600 dark:hover:bg-pink-400 z-40 flex items-center gap-2"
        >
            <Plus size={24} strokeWidth={2.5} />
            <span className="font-semibold pr-2">{label}</span>
        </button>
    );
}
