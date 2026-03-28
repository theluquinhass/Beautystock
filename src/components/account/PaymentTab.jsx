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
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const subscriptionStatus = isPro ? 'active' : 'inactive';
    const planValue = 'R$ 29,90/mês';
    const renewalDate = formData?.expires_at ? new Date(formData.expires_at) : new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);
    const mockCard = { brand: 'Mastercard', last4: '4321', expiry: '12/28' };

    useEffect(() => {
        if (isPro && user?.id) fetchPaymentHistory();
    }, [isPro, user]);

    const fetchPaymentHistory = async () => {
        try {
            setHistoryLoading(true);
            const { data, error } = await supabase.functions.invoke('list-payments', { body: { userId: user.id } });

            console.log('[DEBUG] list-payments response:', { data, error });

            if (error) {
                console.error('[DEBUG] Edge function error:', error);
                // toast.error(`Erro ao carregar pagamentos: ${error.message || 'Desconhecido'}`);
            }

            if (!error && data?.payments) setPaymentHistory(data.payments);
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
            const { data, error } = await supabase.functions.invoke('create-pro-renewal-preference', { body: { userId: user.id, email: user.email } });
            if (error) throw error;
            toast.dismiss(toastId);
            if (data?.init_point) window.location.href = data.init_point;
        } catch { toast.error('Erro ao gerar renovação'); }
        finally { setIsRenewing(false); }
    };

    const handleCancel = async () => {
        try {
            setIsCancelling(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Assinatura cancelada. Você terá acesso até o fim do período pago.');
            setIsCancelModalOpen(false);
        } catch { toast.error('Erro ao cancelar assinatura'); }
        finally { setIsCancelling(false); }
    };

    const statusStyle = {
        active: 'bg-success/15 text-success border-success/25',
        cancelled: 'bg-warning/15 text-warning border-warning/25',
        past_due: 'bg-destructive/15 text-destructive border-destructive/25',
        default: 'bg-muted text-muted-foreground border-border',
    };
    const statusText = { active: 'Ativa', cancelled: 'Cancelada', past_due: 'Vencida / Pendente', default: 'Inativa' };

    const paymentStatusStyle = (s) => ({
        approved: 'bg-success/15 text-success',
        pending: 'bg-warning/15 text-warning',
        rejected: 'bg-destructive/15 text-destructive',
    }[s] || 'bg-muted text-muted-foreground');

    const paymentDotStyle = (s) => ({
        approved: 'bg-success',
        pending: 'bg-warning',
        rejected: 'bg-destructive',
    }[s] || 'bg-muted-foreground');

    /* ── shared card section style ── */
    const sectionCls = "bg-card rounded-2xl p-6 shadow-soft border border-border";
    const iconBoxCls = (color) => `p-2 ${color} rounded-xl`;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Alerta vencimento próximo ── */}
            {isPro && subscriptionStatus === 'active' && formData?.expires_at && (() => {
                const diff = Math.ceil((new Date(formData.expires_at) - new Date()) / 86400000);
                if (diff > 3 || diff < 0) return null;
                return (
                    <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex gap-3 shadow-soft">
                        <AlertCircle className="text-warning shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-warning text-sm">Sua assinatura vence em breve</h4>
                            <p className="text-xs text-warning/80 mt-1">
                                Renove agora para evitar interrupção. Vence em {diff === 0 ? 'algumas horas' : `${diff} dia(s)`}.
                            </p>
                        </div>
                    </div>
                );
            })()}

            {/* ── Resumo do Plano ── */}
            <div className={sectionCls}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={iconBoxCls("bg-accent text-primary")}>
                            <Crown size={24} className={isPro ? "fill-primary" : ""} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Resumo do Plano</h2>
                    </div>
                    {isPro && (
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", statusStyle[subscriptionStatus] || statusStyle.default)}>
                            {statusText[subscriptionStatus] || statusText.default}
                        </span>
                    )}
                </div>

                {isPro ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Plano Atual', value: 'PRO ✨' },
                            { label: 'Valor', value: planValue },
                            { label: 'Vencimento Atual', value: formData?.expires_at ? new Date(formData.expires_at).toLocaleDateString('pt-BR') : '-' },
                            { label: 'Próxima Cobrança', value: renewalDate.toLocaleDateString('pt-BR') },
                        ].map(item => (
                            <div key={item.label} className="bg-muted/50 rounded-xl p-4 border border-border">
                                <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                                <p className="font-bold text-foreground">{item.value}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                            <Crown size={28} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Você está no plano Grátis</h3>
                        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                            Faça o upgrade para o plano PRO e desbloqueie acesso total ao BeautyStock.
                        </p>
                        <button
                            onClick={() => navigate('/checkout/pro')}
                            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-3 px-8 rounded-xl shadow-pink hover:opacity-90 transition-all active:scale-[0.98] inline-flex items-center gap-2"
                        >
                            <Crown size={20} className="fill-yellow-300 text-yellow-300" />
                            Fazer Upgrade para PRO
                        </button>
                    </div>
                )}
            </div>

            {/* ── Forma de Pagamento + Ações ── */}
            {isPro && (
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Cartão */}
                    <div className={cn(sectionCls, "flex flex-col h-full")}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={iconBoxCls("bg-info/15 text-info")}>
                                <CreditCard size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Forma de Pagamento</h2>
                        </div>

                        <div className="flex-1">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-soft isolate relative overflow-hidden mb-4">
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0" />
                                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-white/10 rounded-full blur-xl z-0" />
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

                        <button className="w-full bg-muted border border-border text-foreground font-semibold py-3 rounded-xl hover:bg-accent hover:border-border-strong transition-colors active:scale-[0.98]">
                            Atualizar Cartão
                        </button>
                    </div>

                    {/* Ações da assinatura */}
                    <div className={cn(sectionCls, "flex flex-col h-full")}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={iconBoxCls("bg-secondary/15 text-secondary")}>
                                <Shield size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Gerenciar Assinatura</h2>
                        </div>

                        <div className="space-y-3 flex-1">
                            {/* Renovar */}
                            <button
                                onClick={handleRenew}
                                disabled={isRenewing}
                                className="w-full bg-accent text-primary border border-primary/20 font-semibold py-3.5 px-4 rounded-xl hover:bg-primary/15 hover:border-primary/30 transition-colors flex items-center gap-2 active:scale-[0.98] disabled:opacity-60"
                            >
                                {isRenewing ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                Pagar Fatura / Renovar
                            </button>


                            {/* Cancelar */}
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="w-full bg-destructive/8 border border-destructive/20 text-destructive font-medium py-3.5 px-4 rounded-xl hover:bg-destructive/15 hover:border-destructive/30 transition-colors flex items-center gap-2 mt-auto active:scale-[0.98]"
                            >
                                <XCircle size={18} />
                                Cancelar Assinatura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Histórico ── */}
            {isPro && (
                <div className={cn(sectionCls, "overflow-hidden")}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={iconBoxCls("bg-success/15 text-success")}>
                            <Receipt size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Histórico de Cobranças</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm text-left">
                            <thead className="bg-muted rounded-t-lg border-b border-border">
                                <tr>
                                    {['Data', 'Valor', 'Status', 'Método', 'Detalhes'].map((h, i) => (
                                        <th key={h} className={cn("px-4 py-3 text-xs font-semibold text-muted-foreground uppercase", i === 4 && "text-right")}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center">
                                            <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                                        </td>
                                    </tr>
                                ) : paymentHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                                            Nenhum pagamento encontrado.
                                        </td>
                                    </tr>
                                ) : paymentHistory.map((item, i) => (
                                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-4 font-medium text-foreground">
                                            {new Date(item.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-4 text-foreground font-medium">
                                            {typeof item.amount === 'number' ? `R$ ${item.amount.toFixed(2).replace('.', ',')}` : item.amount}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn("inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium", paymentStatusStyle(item.status))}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", paymentDotStyle(item.status))} />
                                                {{ approved: 'Aprovado', pending: 'Pendente', rejected: 'Recusado' }[item.status] || item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">{item.method}</td>
                                        <td className="px-4 py-4 text-right text-muted-foreground">
                                            {item.method === 'PIX' ? '⚡' : '💳'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
