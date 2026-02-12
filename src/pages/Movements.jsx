import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Calendar, User } from 'lucide-react';
import FAB from '../components/Dashboard/FAB';

export default function Movements() {
    const navigate = useNavigate();
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from('movements')
                .select(`
                    id, type, quantity, date, is_on_credit, unit_price,
                    variations ( name, products ( name, price ) ),
                    customers ( name )
                `)
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(50);

            if (data) setMovements(data);
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 animate-pulse">Carregando extrato...</div>;

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Extrato de Movimentações</h1>

            <div className="flex flex-col gap-3">
                {movements.map(m => {
                    const isEntry = m.type === 'ENTRY';
                    const productName = m.variations?.products?.name || 'Produto';
                    const variationName = m.variations?.name || '';
                    const clientName = m.customers?.name;
                    // Fallback price if unit_price is null (for old records)
                    const totalValue = (m.unit_price || m.variations?.products?.price || 0) * m.quantity;

                    return (
                        <div key={m.id} className="card p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEntry ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {isEntry ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                        {productName} <span className="text-gray-400 font-normal">• {variationName}</span>
                                    </h3>
                                    <div className="flex flex-col mt-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} />
                                                {format(new Date(m.date), 'dd/MM/yyyy')}
                                            </span>
                                            {clientName && (
                                                <span className="flex items-center gap-1 text-pink-500 font-medium">
                                                    <User size={10} />
                                                    {clientName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`font-bold ${isEntry ? 'text-green-600' : 'text-gray-900'}`}>
                                    {isEntry ? '+' : '-'} R$ {totalValue.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {m.quantity} un
                                </div>
                                {m.is_on_credit && (
                                    <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase mt-1">
                                        Fiado
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {movements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Nenhuma movimentação registrada.
                    </div>
                )}
            </div>

            <FAB onClick={() => navigate('/movimentacoes/novo')} />
        </div>
    );
}
