import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X } from 'lucide-react';

export default function BibiTooltip({ title, text, stepIndex, totalSteps, onNext, onPrev, onSkip, isLast }) {
    return (
        <div className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(236,72,153,0.3)] border border-pink-100 p-6 w-80 sm:w-96 animate-in fade-in zoom-in-95 duration-300 relative pointer-events-auto">
            <button
                onClick={onSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Sair do tour"
                aria-label="Fechar tour"
            >
                <X size={20} />
            </button>

            <div className="flex gap-4 items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-md flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={24} className="text-white" />
                </div>
                <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-gray-800 leading-tight mb-1.5 pr-4">{title}</h4>
                    <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">{text}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                    {totalSteps > 0 && (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
                            Passo {stepIndex} / {totalSteps}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {onPrev && (
                        <button
                            onClick={onPrev}
                            className="p-2.5 rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors"
                            aria-label="Passo anterior"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}

                    <button
                        onClick={onNext}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm sm:text-base font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        {isLast ? 'Concluir' : 'Próximo'}
                        {!isLast && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
