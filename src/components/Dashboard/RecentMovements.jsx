import { Card } from '../ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt } from 'lucide-react';

export default function RecentMovements({ movements = [] }) {
    return (
        <section className="mt-6 mb-24">
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Movimentações recentes</h2>

            {movements.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center shadow-soft">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <Receipt size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-gray-800 font-bold mb-1">Nenhuma venda ainda</h3>
                    <p className="text-xs text-gray-500 max-w-[200px]">
                        Suas vendas e reposições de estoque aparecerão aqui.
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
