import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../ui/card';

export default function CustomerHistory({ movements = [], payments = [] }) {
    // Merge and sort by date desc
    const history = [
        ...movements.map(m => ({ ...m, type: 'PURCHASE', dateObj: new Date(m.date) })),
        ...payments.map(p => ({ ...p, type: 'PAYMENT', dateObj: new Date(p.date) }))
    ].sort((a, b) => b.dateObj - a.dateObj);

    if (history.length === 0) {
        return <div className="text-center text-gray-500 py-8">Nenhuma movimentação registrada.</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            {history.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800 text-sm">
                            {item.type === 'PURCHASE' ? (item.variations?.products?.name || 'Compra') : 'Pagamento Recebido'}
                        </p>
                        <p className="text-[10px] text-gray-400 capitalize">
                            {format(item.dateObj, "dd 'de' MMM, HH:mm", { locale: ptBR })}
                        </p>
                        {item.type === 'PURCHASE' && item.is_on_credit && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Fiado</span>
                        )}
                    </div>

                    <div className={`font-bold ${item.type === 'PAYMENT' ? 'text-green-600' : 'text-red-500'}`}>
                        {item.type === 'PAYMENT' ? '+' : '-'} R$ {(item.amount || (item.unit_price * item.quantity)).toFixed(2)}
                    </div>
                </Card>
            ))}
        </div>
    );
}
