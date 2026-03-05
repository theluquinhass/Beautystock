import { Card } from '../ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt } from 'lucide-react';

export default function RecentMovements({ movements = [] }) {
    return (
        <section className="flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Movimentações recentes</h2>

            {movements.length === 0 ? (
                <div className="bg-white rounded-[32px] p-6 shadow-soft border border-gray-100 flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
                    <Receipt size={32} strokeWidth={1.5} className="text-gray-300 mb-3" />
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Sem movimentações</h3>
                    <p className="text-xs text-gray-400 max-w-[200px]">
                        Nenhuma atividade registrada recentemente.
                    </p>
                </div>
            ) : (
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
            )}
        </section>
    );
}
