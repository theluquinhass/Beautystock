import { useState, useEffect } from 'react';
import { Crown, CreditCard, Clock, Receipt, AlertCircle, Shield, XCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';

import { useNavigate } from 'react-router-dom';

export function PaymentTab({ isPro, user, formData }) {
    const navigate = useNavigate();
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRenewing, setIsRenewing] = useState(false);

    // Mock data for UI presentation as per requirements
    const subscriptionStatus = isPro ? 'active' : 'inactive'; // active, cancelled, past_due
    const planValue = 'R$ 29,90/mês';
    const renewalDate = formData?.expires_at ? new Date(formData.expires_at) : new Date();
    renewalDate.setDate(renewalDate.getDate() + 30); // Mock next renewal
    
    const mockCard = {
        brand: 'Mastercard',
        last4: '4321',
        expiry: '12/28'
    };

    // Real payment history from Mercado Pago
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        if (isPro && user?.id) {
            fetchPaymentHistory();
        }
    }, [isPro, user]);

    const fetchPaymentHistory = async () => {
        try {
            setHistoryLoading(true);
            const { data, error } = await supabase.functions.invoke('list-payments', {
                body: { userId: user.id }
            });

            if (error) {
                console.error('Error fetching payment history:', error);
                return;
            }

            if (data?.payments) {
                setPaymentHistory(data.payments);
            }
        } catch (err) {
            console.error('Failed to load payment history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRenew = async () => {
        try {
            setIsRenewing(true);
            const toastId = toast.loading('Gerando pagamento...');
            const { data, error } = await supabase.functions.invoke('create-pro-renewal-preference', {
                body: { userId: user.id, email: user.email }
            });

            if (error) throw error;

            toast.dismiss(toastId);
            if (data?.init_point) {
                window.location.href = data.init_point;
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao gerar renovação');
        } finally {
            setIsRenewing(false);
        }
    };

    const handleCancel = async () => {
        try {
            setIsCancelling(true);
            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Assinatura cancelada com sucesso. Você terá acesso até o fim do período já pago.');
            setIsCancelModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao cancelar assinatura');
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'past_due': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'active': return 'Ativa';
            case 'cancelled': return 'Cancelada';
            case 'past_due': return 'Vencida / Pendente';
            default: return 'Inativa';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Alert */}
            {isPro && subscriptionStatus === 'active' && formData?.expires_at && (
                (() => {
                    const expiresDate = new Date(formData.expires_at);
                    const now = new Date();
                    const diffTime = expiresDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 3 && diffDays >= 0) {
                        return (
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 shadow-sm">
                                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-orange-800 text-sm">Sua assinatura vence em breve</h4>
                                    <p className="text-xs text-orange-700 mt-1">
                                        Renove agora para evitar a interrupção dos seus serviços premium. Vence em {diffDays === 0 ? 'algumas horas' : `${diffDays} dia(s)`}.
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()
            )}

            {/* Current Plan Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-gray-900">
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                            <Crown size={24} className={isPro ? "fill-pink-500" : ""} />
                        </div>
                        <h2 className="text-lg font-bold">Resumo do Plano</h2>
                    </div>
                    {isPro && (
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusStyle(subscriptionStatus))}>
                            {getStatusText(subscriptionStatus)}
                        </span>
                    )}
                </div>

                {isPro ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Plano Atual</p>
                            <p className="font-bold text-gray-900">PRO ✨</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Valor</p>
                            <p className="font-bold text-gray-900">{planValue}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Vencimento Atual</p>
                            <p className="font-bold text-gray-900">
                                {formData?.expires_at ? new Date(formData.expires_at).toLocaleDateString('pt-BR') : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Próxima Cobrança</p>
                            <p className="font-bold text-gray-900">{renewalDate.toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Crown size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Você está no plano Grátis</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                            Faça o upgrade para o plano PRO e desbloqueie acesso total ao BeautyStock.
                        </p>
                        <button
                            onClick={() => navigate('/checkout/pro')}
                            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-[0.98] inline-flex items-center gap-2"
                        >
                            <Crown size={20} className="fill-yellow-300 text-yellow-300" />
                            Fazer Upgrade para PRO
                        </button>
                    </div>
                )}
            </div>

            {/* Payment Method & Actions Container */}
            {isPro && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Payment Method */}
                    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 text-gray-900 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Forma de Pagamento</h2>
                        </div>
                        
                        <div className="flex-1">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl isolate relative overflow-hidden mb-4">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0"></div>
                                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-white/10 rounded-full blur-xl z-0"></div>
                                
                                <div className="relative z-10 flex justify-between items-start mb-6">
                                    <div className="font-bold tracking-wider text-xl italic opacity-90">{mockCard.brand}</div>
                                    <CreditCard opacity={0.5} size={28} />
                                </div>
                                <div className="relative z-10 flex items-center gap-4 mb-2 opacity-90 font-mono text-lg tracking-widest">
                                    <span>••••</span><span>••••</span><span>••••</span><span>{mockCard.last4}</span>
                                </div>
                                <div className="relative z-10 flex justify-between items-center text-xs opacity-80 mt-4">
                                    <div className="uppercase tracking-wider">Valid Thru: {mockCard.expiry}</div>
                                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                                        <CheckCircle2 size={12} /> Principal
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors active:scale-[0.98]">
                            Atualizar Cartão
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 text-gray-900 mb-6">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Gerenciar Assinatura</h2>
                        </div>

                        <div className="space-y-3 flex-1">
                            <button 
                                onClick={handleRenew}
                                disabled={isRenewing}
                                className="w-full bg-pink-50 border border-pink-100 text-pink-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-pink-100 transition-colors flex items-center justify-between active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-2">
                                    {isRenewing ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                    Pagar Fatura / Renovar
                                </span>
                            </button>
                            
                            <button className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-between active:scale-[0.98]">
                                <span className="flex items-center gap-2">
                                    <Clock size={18} className="text-gray-500" />
                                    Alterar Plano
                                </span>
                            </button>
                            
                            <button 
                                onClick={() => setIsCancelModalOpen(true)}
                                className="w-full border border-red-100 text-red-600 font-medium py-3.5 px-4 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-between mt-auto"
                            >
                                <span className="flex items-center gap-2">
                                    <XCircle size={18} />
                                    Cancelar Assinatura
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment History */}
            {isPro && (
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 text-gray-900 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Receipt size={20} />
                        </div>
                        <h2 className="text-lg font-bold">Histórico de Cobranças</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50 rounded-t-lg">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Data</th>
                                    <th className="px-4 py-3 font-semibold">Valor</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Método</th>
                                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center">
                                            <Loader2 className="animate-spin mx-auto text-pink-500" size={24} />
                                        </td>
                                    </tr>
                                ) : paymentHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                                            Nenhum pagamento encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    paymentHistory.map((item, i) => (
                                        <tr key={item.id} className={cn("border-b border-gray-50 hover:bg-gray-50/50 transition-colors", i === paymentHistory.length - 1 ? 'border-none' : '')}>
                                            <td className="px-4 py-4 font-medium text-gray-900">
                                                {new Date(item.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-4 py-4 text-gray-900 font-medium">
                                                {typeof item.amount === 'number'
                                                    ? `R$ ${item.amount.toFixed(2).replace('.', ',')}`
                                                    : item.amount
                                                }
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium",
                                                    item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                )}>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        item.status === 'approved' ? 'bg-green-500' :
                                                        item.status === 'pending' ? 'bg-yellow-500' :
                                                        item.status === 'rejected' ? 'bg-red-500' :
                                                        'bg-gray-500'
                                                    )}></div>
                                                    {item.status === 'approved' ? 'Aprovado' :
                                                     item.status === 'pending' ? 'Pendente' :
                                                     item.status === 'rejected' ? 'Recusado' :
                                                     item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">{item.method}</td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="text-gray-400 text-sm">
                                                    {item.method === 'PIX' ? '⚡' : '💳'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        
                        {/* Mobile view fallback (stack cards on very small screens, though overflow-x handles most) */}
                        <div className="sm:hidden space-y-3 mt-4">
                           <p className="text-xs text-center text-gray-400 italic">Deslize para o lado para ver toda a tabela.</p>
                        </div>
                    </div>
                </div>
            )}

            <CancelSubscriptionModal 
                isOpen={isCancelModalOpen} 
                onClose={() => setIsCancelModalOpen(false)} 
                onConfirm={handleCancel}
                loading={isCancelling}
            />
        </div>
    );
}
