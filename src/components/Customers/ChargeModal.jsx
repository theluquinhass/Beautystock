import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Crown, Smartphone } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';
import { cn } from '../../lib/utils';

const TONES = [
    {
        id: 'soft',
        icon: '💖',
        label: 'Suave',
        template: 'Oi {{nome}} 💖\n\nEstou passando para lembrar do valor pendente de R$ {{valor}} referente às suas compras.\n\nQuando puder, me avisa por favor 😊'
    },
    {
        id: 'professional',
        icon: '💼',
        label: 'Profissional',
        template: 'Olá {{nome}},\n\nConsta um saldo em aberto de R$ {{valor}} referente às últimas compras.\n\nFico no aguardo da regularização.'
    },
    {
        id: 'direct',
        icon: '⚡',
        label: 'Direta',
        template: 'Oi {{nome}} 😊\n\nSeu saldo pendente é de R$ {{valor}}.\nPode me confirmar quando consegue realizar o pagamento?'
    },
    {
        id: 'urgent',
        icon: '🔥',
        label: 'Urgente',
        template: 'Oi {{nome}} 💖\n\nEstou organizando meus recebimentos e consta um valor de R$ {{valor}} em aberto.\n\nVocê consegue me confirmar o pagamento ainda hoje?'
    },
    {
        id: 'friendly',
        icon: '😊',
        label: 'Amigável',
        template: 'Oi {{nome}} 💕\n\nPassando para lembrar do valor de R$ {{valor}} que ficou pendente.\n\nMe avisa qualquer coisa, tá?'
    }
];

export default function ChargeModal({ customer, debt, onClose }) {
    const navigate = useNavigate();
    const { isPro } = usePlan();
    const [selectedTone, setSelectedTone] = useState(TONES[0].id);

    const generateChargeMessage = ({ nome, valor, tom }) => {
        let template = '';

        if (!isPro) {
            // Free users get a standard simple message
            template = 'Olá {{nome}}, passando para lembrar do valor em aberto de R$ {{valor}} na BeautyStock.\n\nQuando puder, me avisa! 😊';
        } else {
            const toneObj = TONES.find(t => t.id === tom) || TONES[0];
            template = toneObj.template;
        }

        return template
            .replace('{{nome}}', nome)
            .replace('{{valor}}', valor.toFixed(2).replace('.', ','));
    };

    const messagePreview = useMemo(() => {
        return generateChargeMessage({
            nome: customer?.name?.split(' ')[0] || 'Cliente', // First name
            valor: debt || 0,
            tom: selectedTone
        });
    }, [customer?.name, debt, selectedTone, isPro]);

    const getWhatsAppUrl = () => {
        const cleanPhone = customer?.phone?.replace(/\D/g, '') || '';
        return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(messagePreview)}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-4 pb-0 sm:pb-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Smartphone size={20} className="text-pink-500" />
                        <h2 className="text-lg font-bold text-gray-800">Cobrar pelo WhatsApp</h2>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Tone Selector (PRO Only) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-sm font-bold text-gray-700">Escolha o tom da mensagem:</label>
                            {!isPro && (
                                <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Crown size={10} /> PRO
                                </span>
                            )}
                        </div>

                        {isPro ? (
                            <div className="grid grid-cols-2 gap-2">
                                {TONES.map(tone => (
                                    <button
                                        key={tone.id}
                                        onClick={() => setSelectedTone(tone.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                            selectedTone === tone.id
                                                ? "bg-pink-50 border-pink-200 text-pink-700 shadow-sm"
                                                : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                                        )}
                                    >
                                        <span className="text-lg">{tone.icon}</span>
                                        {tone.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-500 mb-2">
                                    Personalização de mensagens disponível apenas no plano PRO.
                                </p>
                                <button
                                    onClick={() => { onClose(); navigate('/upgrade'); }}
                                    className="text-pink-500 text-sm font-bold hover:underline flex items-center justify-center gap-1 w-full relative z-10"
                                >
                                    <Crown size={14} /> Fazer Upgrade
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Pré-visualização:</label>
                        <div className="bg-[#E8ECEF] p-4 rounded-2xl rounded-tr-sm relative shadow-soft">
                            <p className="text-[#111B21] text-[15px] whitespace-pre-wrap leading-relaxed">{messagePreview}</p>
                            <span className="text-[10px] text-gray-400 absolute bottom-1.5 right-3">Agora</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="w-full bg-[#25D366] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        Enviar via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
