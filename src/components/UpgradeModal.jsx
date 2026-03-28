import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeModal({ isOpen, onClose, limitText, featureName }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <Sparkles size={32} className="text-yellow-300" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Limite Atingido</h2>
                    <p className="text-indigo-100 font-medium opacity-90">
                        {limitText ? `Você atingiu ${limitText}.` : `O limite para ${featureName} foi atingido no plano Free.`}
                    </p>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground text-center mb-6 text-sm font-medium">
                        Desbloqueie o potencial máximo da sua loja com o <span className="text-purple-600 font-bold">BeautyStock PRO</span>.
                    </p>

                    <div className="space-y-3 mb-8">
                        {['Produtos, Fotos e Clientes ilimitados', 'Catálogo completo sem limites visuais', 'Relatórios de lucro de até 90 dias', 'Acesso total à Inteligência Artificial (Bibi)', 'Exportação de relatórios avançada'].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-card-foreground">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-muted rounded-2xl p-4 mb-6 text-center border border-border">
                        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Apenas</span>
                        <div className="text-3xl font-black text-foreground mt-1">
                            R$ 29,90<span className="text-lg font-medium text-muted-foreground">/mês</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/upgrade'); // Full upgrade page/checkout
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                        >
                            Assinar PRO Ilimitado
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-muted-foreground font-medium text-sm hover:text-foreground transition-colors"
                        >
                            Continuar no plano Grátis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
