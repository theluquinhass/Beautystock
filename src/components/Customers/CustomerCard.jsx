import { useState } from 'react';
import { Card } from '../ui/card';
import { Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChargeModal from './ChargeModal';

export default function CustomerCard({ customer }) {
    const { id, name, phone, debt = 0 } = customer;
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const navigate = useNavigate();

    const hasDebt = debt > 0;

    const handleWhatsApp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!phone) return;
        setIsChargeModalOpen(true);
    };

    return (
        <>
            <div onClick={() => navigate(`/clientes/${id}`)} className="block">
                <Card className="p-4 flex items-center justify-between hover:bg-pink-50/50 transition-colors cursor-pointer mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-primary font-bold text-lg">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">{name}</h3>
                            {phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {phone}</p>}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`font-bold ${hasDebt ? 'text-red-500' : 'text-green-500'}`}>
                            {hasDebt ? `R$ ${debt.toFixed(2)}` : 'Em dia'}
                        </div>
                        {hasDebt && (
                            <button
                                onClick={handleWhatsApp}
                                className="mt-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium hover:bg-green-200"
                            >
                                Cobrar
                            </button>
                        )}
                    </div>
                </Card>
            </div>

            {isChargeModalOpen && (
                <ChargeModal
                    customer={customer}
                    debt={debt}
                    onClose={() => setIsChargeModalOpen(false)}
                />
            )}
        </>
    );
}
