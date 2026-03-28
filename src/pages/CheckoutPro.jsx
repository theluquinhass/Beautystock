import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, QrCode, ArrowLeft, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';
import { startProCheckout, startProTransparentPix } from '../lib/asaas';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';

export default function CheckoutPro() {
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        let interval;
        if (pixData?.paymentId && !isPro && !paymentSuccess) {
            interval = setInterval(async () => {
                const { data: profile } = await supabase.from('profiles').select('plan').single();
                if (profile?.plan === 'pro') {
                    setPaymentSuccess(true);
                    setTimeout(() => { window.location.href = '/dashboard'; }, 4000);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [pixData, isPro, paymentSuccess]);

    if (isPro) {
        setTimeout(() => navigate('/dashboard'), 2000);
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle2 size={64} className="text-success mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Você já é PRO!</h1>
                <p className="text-muted-foreground">Redirecionando para o seu dashboard...</p>
            </div>
        );
    }

    const handleContinue = async () => {
        setLoading(true);
        try {
            if (selectedMethod === 'card') {
                const checkoutUrl = await startProCheckout();
                window.location.href = checkoutUrl;
            } else {
                const pixResult = await startProTransparentPix();
                setPixData(pixResult);
                setLoading(false);
            }
        } catch (error) {
            alert(`Erro ao iniciar pagamento: ${error.message || 'Tente novamente.'}`);
            setLoading(false);
        }
    };

    const handleCopyPix = () => {
        if (pixData?.qrCode) {
            navigator.clipboard.writeText(pixData.qrCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    /* ── radio button ── */
    const RadioDot = ({ active }) => (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${active ? 'border-primary bg-primary' : 'border-border'
            }`}>
            {active && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
    );

    /* ── option icon box ── */
    const IconBox = ({ active, children }) => (
        <div className={`mt-0.5 p-2 rounded-xl border flex-shrink-0 transition-all ${active
                ? 'bg-accent border-primary/25 text-primary'
                : 'bg-muted border-border text-muted-foreground'
            }`}>
            {children}
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-80px)] bg-background pt-10 sm:pt-12 px-4 sm:px-6 pb-40 lg:pb-32 flex justify-center w-full">
            <div className="max-w-[720px] w-full relative flex flex-col">

                {/* Voltar */}
                <div className="w-full flex justify-start mb-6">
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-1" /> Voltar
                    </button>
                </div>

                {/* Hero */}
                <div className="text-center w-full mb-8 mt-6">
                    {!paymentSuccess && (
                        <div className="bg-accent w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/15 shadow-soft">
                            <Crown size={32} className="text-primary drop-shadow-sm" />
                        </div>
                    )}

                    {!paymentSuccess && !pixData && (
                        <>
                            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight mb-3">
                                Escolha como quer assinar
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                                Você vai desbloquear produtos e clientes ilimitados, fiado e relatórios profissionais.
                            </p>
                        </>
                    )}

                    {!paymentSuccess && pixData && (
                        <>
                            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight mb-3">
                                Finalize seu Pagamento
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                                Escaneie o QR Code ou copie o código PIX para liberar seu acesso VIP.
                            </p>
                        </>
                    )}
                </div>

                {/* ── Sucesso PIX ── */}
                {paymentSuccess ? (
                    <div className="w-full bg-card rounded-3xl p-8 sm:p-10 shadow-soft border border-success/20 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-success/15 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={48} className="text-success" />
                        </div>
                        <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
                            Pagamento Aprovado! 🎉
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-sm">
                            Muito obrigado! Seu plano BeautyStock PRO foi ativado com sucesso.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted px-4 py-2 rounded-full border border-border">
                            <Loader2 size={16} className="animate-spin" />
                            Preparando seu novo painel...
                        </div>
                    </div>

                ) : !pixData ? (
                    /* ── Opções de pagamento ── */
                    <div className="w-full space-y-4">

                        {/* Cartão */}
                        <div
                            onClick={() => setSelectedMethod('card')}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-card ${selectedMethod === 'card'
                                    ? 'border-primary shadow-pink -translate-y-1'
                                    : 'border-border shadow-soft hover:border-primary/30'
                                }`}
                        >
                            <div className="absolute top-0 right-0 translate-x-2 -translate-y-3">
                                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                                    Mais Prático
                                </span>
                            </div>
                            <div className="flex items-start gap-4">
                                <IconBox active={selectedMethod === 'card'}>
                                    <CreditCard size={20} />
                                </IconBox>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold ${selectedMethod === 'card' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            Assinatura Mensal
                                        </h3>
                                        <RadioDot active={selectedMethod === 'card'} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Renova automaticamente todo mês no Cartão de Crédito.</p>
                                </div>
                            </div>
                        </div>

                        {/* PIX */}
                        <div
                            onClick={() => setSelectedMethod('pix')}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-card ${selectedMethod === 'pix'
                                    ? 'border-primary shadow-pink -translate-y-1'
                                    : 'border-border shadow-soft hover:border-primary/30'
                                }`}
                        >
                            <div className="absolute top-0 right-0 translate-x-2 -translate-y-3">
                                <span className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-border">
                                    Sem Recorrência
                                </span>
                            </div>
                            <div className="flex items-start gap-4">
                                <IconBox active={selectedMethod === 'pix'}>
                                    <QrCode size={20} />
                                </IconBox>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold ${selectedMethod === 'pix' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            1 Mês Avulso
                                        </h3>
                                        <RadioDot active={selectedMethod === 'pix'} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Pague apenas uma vez via PIX com acesso de 30 dias.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                ) : (
                    /* ── QR Code PIX ── */
                    <div className="w-full bg-card rounded-3xl p-6 sm:p-8 shadow-soft border border-border text-center flex flex-col items-center">
                        <div className="bg-accent text-primary text-sm font-bold px-4 py-2 rounded-full mb-6 flex items-center gap-2 border border-primary/20">
                            <Loader2 size={16} className="animate-spin" />
                            Aguardando Pagamento...
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-2 border-border mb-6 w-56 h-56 flex items-center justify-center shadow-soft">
                            <img
                                src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`}
                                alt="PIX QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <p className="text-muted-foreground mb-4 font-medium">Ou pague com Pix Copia e Cola:</p>

                        <button
                            onClick={handleCopyPix}
                            className={`w-full max-w-md py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border-2 ${copied
                                    ? 'bg-success/15 text-success border-success/25'
                                    : 'bg-accent text-primary border-primary/20 hover:bg-primary/15 hover:border-primary/30'
                                }`}
                        >
                            {copied
                                ? <><Check size={20} /> Código Copiado!</>
                                : <><Copy size={20} /> Copiar Código PIX</>
                            }
                        </button>
                    </div>
                )}
            </div>

            {/* ── Footer sticky CTA ── */}
            {!pixData && !paymentSuccess && (
                <div
                    className="fixed bottom-0 pb-24 lg:pb-6 pt-4 z-40 flex justify-center bg-background/90 backdrop-blur-md border-t border-border"
                    style={{ width: '100%', maxWidth: '720px' }}
                >
                    <div className="w-full px-4 sm:px-0">
                        <button
                            onClick={handleContinue}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-2xl shadow-pink hover:opacity-90 hover:brightness-105 active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 size={24} className="animate-spin" /> Processando...</>
                            ) : selectedMethod === 'card' ? (
                                <>Continuar com Cartão <CreditCard size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            ) : (
                                <>Continuar com PIX <QrCode size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                        <p className="text-center mt-3 text-muted-foreground/70 text-xs font-medium">
                            Pagamento 100% seguro via Asaas
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}