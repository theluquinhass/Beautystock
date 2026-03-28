import { Crown, Check, X } from 'lucide-react';
import { usePlan } from '../hooks/usePlan';
import { useNavigate } from 'react-router-dom';

export default function Upgrade() {
    const { isPro } = usePlan();
    const navigate = useNavigate();

    const handleSubscribe = () => {
        if (!isPro) navigate('/checkout/pro');
    };

    const proFeatures = [
        'Produtos Ilimitados',
        'Clientes Ilimitados',
        'Catálogo Ilimitado',
        "Catálogo Sem Marca d'água",
        'Controle de Fiado',
        'Relatórios de Lucro',
    ];

    const freeFeatures = [
        { label: 'Até 50 produtos', included: true },
        { label: 'Até 5 clientes (CRM)', included: true },
        { label: 'Catálogo com 20 Produtos', included: true },
        { label: 'Vendas no Fiado', included: false },
        { label: 'Relatórios Avançados', included: false },
    ];

    return (
        <div className="min-h-screen bg-background pb-24">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-8 rounded-b-[2.5rem] shadow-pink text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="relative z-10">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
                        <Crown size={32} className="text-yellow-300 drop-shadow-md" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Seja BeautyStock PRO</h1>
                    <p className="text-pink-100 text-lg">Desbloqueie todo o potencial do seu negócio.</p>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-20 space-y-6">

                {/* ── Card FREE ── */}
                <div className="bg-card rounded-3xl p-6 shadow-soft border border-border opacity-90 scale-95 origin-top">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-foreground">Plano Free</h3>
                        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-border">
                            Atual
                        </span>
                    </div>
                    <p className="text-muted-foreground mb-6 text-sm">Para quem está começando a organizar as vendas.</p>

                    <ul className="space-y-3">
                        {freeFeatures.map(({ label, included }) => (
                            <li key={label} className={`flex items-center text-sm ${included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                {included
                                    ? <Check size={18} className="text-success mr-2 flex-shrink-0" />
                                    : <X size={18} className="text-muted-foreground/30 mr-2 flex-shrink-0" />
                                }
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Card PRO ── */}
                <div className="bg-card rounded-3xl p-8 shadow-soft border-2 border-primary relative hover:scale-[1.02] transition-transform duration-300">
                    {/* Badge recomendado */}
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[22px] shadow-pink">
                        RECOMENDADO
                    </div>

                    {/* Nome + preço */}
                    <div className="mb-2">
                        <h3 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                            Plano PRO <Crown size={20} className="text-yellow-500 fill-yellow-500" />
                        </h3>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-primary">R$ 29,90</span>
                        <span className="text-muted-foreground text-sm font-medium">/mês</span>
                    </div>

                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        Tenha controle total e venda muito mais com ferramentas profissionais.
                    </p>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                        {proFeatures.map(feature => (
                            <li key={feature} className="flex items-center text-foreground font-medium">
                                <div className="bg-success/15 p-1 rounded-full mr-3 flex-shrink-0">
                                    <Check size={14} className="text-success" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <button
                        onClick={handleSubscribe}
                        disabled={isPro}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 rounded-xl shadow-pink hover:opacity-90 hover:brightness-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPro ? (
                            <>Você já é PRO <Check size={24} /></>
                        ) : (
                            <>
                                Assinar Agora
                                <Crown size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-muted-foreground/60 text-xs mt-4">Cancele quando quiser.</p>
                </div>

            </div>
        </div>
    );
}