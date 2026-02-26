import React, { useState } from 'react';
import { Sparkles, ArrowRight, Store, Target, Tag } from 'lucide-react';
import BibiButton from '../Bibi/BibiButton';

export default function WelcomeSetupModal({ onSubmit, initialName = '' }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: initialName,
        niche: '',
        goal: ''
    });

    const niches = [
        { id: 'perfumes', label: 'Perfumes', icon: '✨' },
        { id: 'maquiagem', label: 'Maquiagem', icon: '💄' },
        { id: 'skincare', label: 'Skincare', icon: '🧴' },
        { id: 'misto', label: 'Misto (Tudo um pouco)', icon: '🛍️' }
    ];

    const goals = [
        { id: 'organizar', label: 'Organizar meu estoque', icon: '📦' },
        { id: 'vendas', label: 'Registrar minhas vendas', icon: '💰' },
        { id: 'fiado', label: 'Controlar o fiado', icon: '🤝' }
    ];

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-soft w-full max-w-md p-6 relative animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                        <Sparkles className="text-pink-500" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Boas-vindas!</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Vamos configurar seu espaço em 60 segundos.
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 justify-center mb-8">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-pink-500' : 'w-2 bg-pink-100'
                                }`}
                        />
                    ))}
                </div>

                {/* Passos */}
                <div className="min-h-[160px]">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Store size={16} className="text-pink-500" />
                                Como você gosta de ser chamada?
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Seu nome ou nome da loja"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Tag size={16} className="text-pink-500" />
                                O que você mais vende?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {niches.map(niche => (
                                    <button
                                        key={niche.id}
                                        onClick={() => setFormData({ ...formData, niche: niche.id })}
                                        className={`p-3 rounded-2xl border text-sm flex flex-col items-center gap-2 transition-all ${formData.niche === niche.id
                                                ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-2xl">{niche.icon}</span>
                                        <span className="font-medium">{niche.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Target size={16} className="text-pink-500" />
                                Qual é sua meta principal hoje?
                            </label>
                            <div className="space-y-2">
                                {goals.map(goal => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setFormData({ ...formData, goal: goal.id })}
                                        className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${formData.goal === goal.id
                                                ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-xl">{goal.icon}</span>
                                        <span className="font-medium text-sm">{goal.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Voltar
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={(step === 1 && !formData.name) || (step === 2 && !formData.niche) || (step === 3 && !formData.goal)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-medium text-sm transition-all duration-300 ${((step === 1 && formData.name) || (step === 2 && formData.niche) || (step === 3 && formData.goal))
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {step === 3 ? 'Começar' : 'Próximo'}
                        {step !== 3 && <ArrowRight size={16} />}
                    </button>
                </div>

            </div>
        </div>
    );
}
