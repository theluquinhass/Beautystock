import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, QrCode, ArrowLeft, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';
import { startProCheckout, startProTransparentPix } from '../lib/mercadopago';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';

export default function CheckoutPro() {
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const [selectedMethod, setSelectedMethod] = useState('card'); // 'card' or 'pix'
    const [loading, setLoading] = useState(false);

    // Transparent PIX State
    const [pixData, setPixData] = useState(null); // { qrCode, qrCodeBase64, paymentId }
    const [copied, setCopied] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Polling for PIX payment success
    useEffect(() => {
        let interval;
        if (pixData?.paymentId && !isPro && !paymentSuccess) {
            interval = setInterval(async () => {
                const { data: profile } = await supabase.from('profiles').select('plan').single();
                if (profile?.plan === 'pro') {
                    setPaymentSuccess(true);
                    // Redirect after showing success message
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 4000);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [pixData, isPro, paymentSuccess]);

    if (isPro) {
        // Redireciona se já for PRO, mas mostra mensagem suave
        setTimeout(() => navigate('/dashboard'), 2000);
        return (
            <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Você já é PRO!</h1>
                <p className="text-gray-500">Redirecionando para o seu dashboard...</p>
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
            console.error("Detailed Subscription Error Object:", error);
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

    return (
        <div className="min-h-[calc(100vh-80px)] bg-pink-50 pt-10 sm:pt-12 px-4 sm:px-6 pb-40 lg:pb-32 flex justify-center w-full">
            <div className="max-w-[720px] w-full relative flex flex-col">

                {/* Header Section */}
                <div className="w-full flex justify-start mb-6">
                    <button
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center text-pink-500 font-medium hover:text-pink-600 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-1" /> Voltar
                    </button>
                </div>

                <div className="text-center w-full mb-8 mt-6">
                    {!paymentSuccess && (
                        <div className="bg-white/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white shadow-soft">
                            <Crown size={32} className="text-pink-500 drop-shadow-sm" />
                        </div>
                    )}

                    {!paymentSuccess && !pixData && (
                        <>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight leading-tight mb-3">
                                Escolha como quer assinar
                            </h1>
                            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                                Você vai desbloquear produtos e clientes ilimitados, fiado e relatórios profissionais.
                            </p>
                        </>
                    )}
                    
                    {!paymentSuccess && pixData && (
                        <>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight leading-tight mb-3">
                                Finalize seu Pagamento
                            </h1>
                            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                                Escaneie o QR Code abaixo ou copie o código PIX para liberar seu acesso VIP imediatamente.
                            </p>
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                {paymentSuccess ? (
                    <div className="w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-pink-100/50 border border-green-100 text-center flex flex-col items-center animate-fade-in transform transition-all scale-100">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 size={48} className="text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">
                            Pagamento Aprovado! 🎉
                        </h2>
                        <p className="text-gray-600 text-lg mb-8 max-w-sm">
                            Muito obrigado! Seu plano BeautyStock PRO foi ativado com sucesso.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-full">
                            <Loader2 size={16} className="animate-spin" />
                            Preparando seu novo painel...
                        </div>
                    </div>
                ) : !pixData ? (
                    <div className="w-full space-y-4">

                        {/* CARTAO */}
                        <div
                            onClick={() => setSelectedMethod('card')}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white ${selectedMethod === 'card'
                                ? 'border-pink-500 shadow-lg shadow-pink-100/50 ring-4 ring-pink-50/50 -translate-y-1'
                                : 'border-transparent shadow-sm hover:border-pink-200'
                                }`}
                        >
                            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                                    Mais Prático
                                </span>
                            </div>
                            <div className="flex items-start">
                                <div className={`mt-0.5 p-2 rounded-xl border ${selectedMethod === 'card' ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    <CreditCard size={20} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold ${selectedMethod === 'card' ? 'text-gray-800' : 'text-gray-600'}`}>Assinatura Mensal</h3>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-pink-500 bg-pink-500' : 'border-gray-300'}`}>
                                            {selectedMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Renova automaticamente todo mês no Cartão de Crédito.</p>
                                </div>
                            </div>
                        </div>

                        {/* PIX/BOLETO */}
                        <div
                            onClick={() => setSelectedMethod('pix')}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white ${selectedMethod === 'pix'
                                ? 'border-pink-500 shadow-lg shadow-pink-100/50 ring-4 ring-pink-50/50 -translate-y-1'
                                : 'border-transparent shadow-sm hover:border-pink-200'
                                }`}
                        >
                            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                                <span className="bg-gray-200 text-gray-600 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm border border-gray-300">
                                    Sem Recorrência
                                </span>
                            </div>
                            <div className="flex items-start">
                                <div className={`mt-0.5 p-2 rounded-xl border ${selectedMethod === 'pix' ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    <QrCode size={20} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold ${selectedMethod === 'pix' ? 'text-gray-800' : 'text-gray-600'}`}>1 Mês Avulso</h3>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'pix' ? 'border-pink-500 bg-pink-500' : 'border-gray-300'}`}>
                                            {selectedMethod === 'pix' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Pague apenas uma vez via PIX ou Boleto com acesso de 30 dias.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/50 border border-pink-100 text-center flex flex-col items-center animate-fade-in">
                        <div className="bg-pink-50 text-pink-600 text-sm font-bold px-4 py-2 rounded-full mb-6 flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Aguardando Pagamento...
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-2 border-pink-100 mb-6 w-56 h-56 flex items-center justify-center">
                            <img
                                src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`}
                                alt="PIX QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <p className="text-gray-600 mb-4 font-medium">Ou pague com Pix Copia e Cola:</p>

                        <button
                            onClick={handleCopyPix}
                            className={`w-full max-w-md py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border-2 ${copied
                                ? 'bg-green-50 text-green-600 border-green-200'
                                : 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100 hover:border-pink-300'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check size={20} /> Código Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={20} /> Copiar Código PIX
                                </>
                            )}
                        </button>
                    </div>
                )}

            </div>

            {/* Sticky Bottom Action (only show if not in PIX qr code view) */}
            {!pixData && !paymentSuccess && (
                <div className="fixed bottom-0 pb-24 lg:pb-6 pt-4 z-40 flex justify-center backdrop-blur-md bg-pink-50/90 border-t border-pink-100/50"
                    style={{ width: '100%', maxWidth: '720px' }}>
                    <div className="w-full px-4 sm:px-0">
                        <button
                            onClick={handleContinue}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:brightness-105 active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Processando...
                                </>
                            ) : selectedMethod === 'card' ? (
                                <>
                                    Continuar com Cartão <CreditCard size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            ) : (
                                <>
                                    Continuar com PIX <QrCode size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        <div className="text-center mt-3">
                            <span className="text-gray-500/80 text-xs font-medium flex items-center justify-center gap-1">
                                Pagamento 100% seguro via Mercado Pago
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
