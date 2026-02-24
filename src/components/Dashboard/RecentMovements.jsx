import { Card } from '../ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RecentMovements({ movements = [] }) {
    if (!movements.length) return null;

    return (
        <section className="mt-6 mb-24">
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Movimentações recentes</h2>

            <div className="flex flex-col gap-3">
                {movements.map((movement) => (
                    <Card key={movement.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-primary font-bold">
                                {movement.clientName ? movement.clientName[0] : 'C'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 text-sm">
                                    {movement.clientName || 'Cliente'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {movement.productName}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`font-semibold text-sm ${movement.type === 'ENTRY' ? 'text-red-500' : 'text-green-600'}`}>
                                {movement.type === 'ENTRY' ? '-' : '+'}R$ {movement.total.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                                {format(new Date(movement.date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
