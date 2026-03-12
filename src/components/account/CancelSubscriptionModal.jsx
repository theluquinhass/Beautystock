import { X, AlertTriangle, Loader2 } from 'lucide-react';

export function CancelSubscriptionModal({ isOpen, onClose, onConfirm, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-end p-4 pb-0">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 pt-0">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto border-4 border-red-100">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Cancelar Assinatura?</h3>
                    
                    <p className="text-center text-gray-600 mb-6 text-sm">
                        Tem certeza que deseja cancelar sua assinatura PRO? 
                        Você perderá o acesso a recursos exclusivos.
                    </p>

                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8">
                        <p className="text-sm text-orange-800 font-medium text-center">
                            Você continuará tendo acesso aos recursos PRO até a <span className="font-bold">data de vencimento</span> do seu ciclo atual.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors active:scale-[0.98]"
                        >
                            Voltar e Manter Assinatura
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="w-full bg-red-50 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                            Confirmar Cancelamento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
