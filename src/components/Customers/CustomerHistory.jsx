import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../ui/card';

export default function CustomerHistory({ movements = [], payments = [] }) {
    const history = [
        ...movements.map(m => ({ ...m, type: 'PURCHASE', dateObj: new Date(m.date) })),
        ...payments.map(p => ({ ...p, type: 'PAYMENT', dateObj: new Date(p.date) }))
    ].sort((a, b) => b.dateObj - a.dateObj);

    if (history.length === 0) {
        return <div className="text-center text-muted-foreground py-8">Nenhuma movimentação registrada.</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            {history.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="p-4 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                            {item.type === 'PURCHASE'
                                ? (item.variations?.products?.name || 'Compra')
                                : 'Pagamento Recebido'}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                            {format(item.dateObj, "dd 'de' MMM, HH:mm", { locale: ptBR })}
                        </p>
                        {item.type === 'PURCHASE' && item.is_on_credit && (
                            <span className="text-[10px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-md font-medium mt-1 inline-block">
                                Fiado
                            </span>
                        )}
                    </div>

                    <div className={`font-bold text-sm whitespace-nowrap flex-shrink-0 ${item.type === 'PAYMENT' ? 'text-success' : 'text-destructive'}`}>
                        {item.type === 'PAYMENT' ? '+' : '-'} R$ {(item.amount || (item.unit_price * item.quantity)).toFixed(2)}
                    </div>
                </Card>
            ))}
        </div>
    );
}