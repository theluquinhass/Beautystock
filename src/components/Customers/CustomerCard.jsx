import { useState } from 'react';
import { Card } from '../ui/card';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChargeModal from './ChargeModal';
import { getPublicCustomerPhotoUrl } from '../../lib/customerPhotos';

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
                <Card className="p-4 flex items-center justify-between hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer mb-3">
                    <div className="flex items-center gap-3">
                        {customer.photo_path ? (
                            <img
                                src={getPublicCustomerPhotoUrl(customer.photo_path)}
                                alt={name}
                                className="w-12 h-12 rounded-full object-cover border border-border shadow-soft"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-lg shadow-soft">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-foreground">{name}</h3>
                            {phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone size={10} /> {phone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`font-bold ${hasDebt ? 'text-destructive' : 'text-success'}`}>
                            {hasDebt ? `R$ ${debt.toFixed(2)}` : 'Em dia'}
                        </div>
                        {hasDebt && (
                            <button
                                onClick={handleWhatsApp}
                                className="mt-1 text-[10px] bg-success/15 text-success px-2 py-1 rounded-full font-medium hover:bg-success/25 transition-colors"
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