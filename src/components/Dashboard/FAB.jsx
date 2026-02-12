import { Plus } from 'lucide-react';

export default function FAB({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 bg-primary text-white rounded-full p-4 shadow-lg shadow-pink-300 transition-transform active:scale-95 hover:bg-pink-600 z-40 flex items-center gap-2"
        >
            <Plus size={24} strokeWidth={2.5} />
            <span className="font-semibold pr-2">Nova Venda</span>
        </button>
    );
}
