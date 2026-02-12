import { Crown, Check, X, Loader2 } from 'lucide-react';
import { usePlan } from '../hooks/usePlan';
import { startProCheckout } from '../lib/mercadopago';
import { useState } from 'react';

export default function Upgrade() {
    const { isPro } = usePlan();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const checkoutUrl = await startProCheckout();
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error(error);
            alert('Erro ao iniciar pagamento. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 pb-24">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-8 rounded-b-[2.5rem] shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
                        <Crown size={32} className="text-yellow-300 drop-shadow-md" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Seja BeautyStock PRO</h1>
                    <p className="text-pink-100 text-lg">Desbloqueie todo o potencial do seu negócio.</p>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-20 space-y-6">

                {/* FREE CARD */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 opacity-90 scale-95 origin-top">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Plano Free</h3>
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Atual</span>
                    </div>
                    <p className="text-gray-500 mb-6 text-sm">Para quem está começando a organizar as vendas.</p>

                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-gray-600 text-sm">
                            <Check size={18} className="text-green-500 mr-2 flex-shrink-0" />
                            <span>Até 5 produtos</span>
                        </li>
                        <li className="flex items-center text-gray-400 text-sm">
                            <X size={18} className="text-gray-300 mr-2 flex-shrink-0" />
                            <span>Gestão de Clientes (CRM)</span>
                        </li>
                        <li className="flex items-center text-gray-400 text-sm">
                            <X size={18} className="text-gray-300 mr-2 flex-shrink-0" />
                            <span>Vendas no Fiado</span>
                        </li>
                        <li className="flex items-center text-gray-400 text-sm">
                            <X size={18} className="text-gray-300 mr-2 flex-shrink-0" />
                            <span>Relatórios Avançados</span>
                        </li>
                    </ul>
                </div>

                {/* PRO CARD */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-pink-500 relative transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm">
                        RECOMENDADO
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                            Plano PRO <Crown size={20} className="text-yellow-500 fill-yellow-500" />
                        </h3>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-pink-600">R$ 29,90</span>
                        <span className="text-gray-400 text-sm font-medium">/mês</span>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        Tenha controle total e venda muito mais com ferramentas profissionais.
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center text-gray-700 font-medium">
                            <div className="bg-green-100 p-1 rounded-full mr-3"><Check size={14} className="text-green-600" /></div>
                            <span>Produtos Ilimitados</span>
                        </li>
                        <li className="flex items-center text-gray-700 font-medium">
                            <div className="bg-green-100 p-1 rounded-full mr-3"><Check size={14} className="text-green-600" /></div>
                            <span>Clientes Ilimitados</span>
                        </li>
                        <li className="flex items-center text-gray-700 font-medium">
                            <div className="bg-green-100 p-1 rounded-full mr-3"><Check size={14} className="text-green-600" /></div>
                            <span>Controle de Fiado</span>
                        </li>
                        <li className="flex items-center text-gray-700 font-medium">
                            <div className="bg-green-100 p-1 rounded-full mr-3"><Check size={14} className="text-green-600" /></div>
                            <span>Relatórios de Lucro</span>
                        </li>
                    </ul>

                    <button
                        onClick={handleSubscribe}
                        disabled={loading || isPro}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:brightness-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                Redirecionando...
                            </>
                        ) : isPro ? (
                            <>
                                Plano Atual
                                <Check size={24} />
                            </>
                        ) : (
                            <>
                                Assinar Agora
                                <Crown size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-gray-400 text-xs mt-4">Cancele quando quiser.</p>
                </div>

            </div>
        </div>
    );
}
