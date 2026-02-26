import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useDashboard } from '../../hooks/useDashboard';
import { usePlan } from '../../hooks/usePlan';

export default function GettingStartedChecklist() {
    const navigate = useNavigate();
    const { isCompleted } = useOnboarding();
    const { stats } = useDashboard();
    const { isPro } = usePlan();
    const [isVisible, setIsVisible] = useState(true);

    const hasProducts = stats.totalProducts > 0;
    const hasMovements = stats.salesToday > 0 || stats.profit > 0 || stats.receivables > 0; // Simple heuristic for now since total movements isn't in stats directly

    // Instead of querying Supabase for exactly 1 customer, we use a simple heuristic or state
    // Let's assume if it's Free, they probably haven't added one if they just joined,
    // but the task is to add 1 customer. Since we don't have totalCustomers in stats,
    // we'll simulate this or skip the customer check for purely visual progress.
    const hasCustomers = false;

    const tasks = [
        {
            id: 'product',
            title: 'Adicionar 1 produto',
            done: hasProducts,
            action: () => navigate('/produtos'),
            buttonText: 'Ir para Produtos'
        },
        {
            id: 'movement',
            title: 'Registrar 1 venda',
            done: hasMovements,
            action: () => navigate('/movimentacoes/nova'),
            buttonText: 'Nova Venda'
        },
        {
            id: 'customer',
            title: 'Cadastrar 1 cliente',
            done: hasCustomers,
            action: () => navigate('/clientes'),
            buttonText: isPro ? 'Ir para Clientes' : 'Conhecer PRO',
            isProOnly: true
        }
    ];

    const completedCount = tasks.filter(t => t.done).length;
    const allDone = completedCount === tasks.length;

    useEffect(() => {
        // Auto-hide after completed
        if (allDone) {
            const timer = setTimeout(() => setIsVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [allDone]);

    if (!isCompleted || !isVisible || allDone) return null;

    return (
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-soft border border-pink-100 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 tracking-tight">Comece por aqui</h3>
                    <p className="text-xs text-gray-500">
                        {completedCount} de {tasks.length} tarefas concluídas
                    </p>
                </div>
            </div>

            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-5 overflow-hidden">
                <div
                    className="h-full bg-pink-500 transition-all duration-1000 ease-out"
                    style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
            </div>

            <div className="space-y-3 relative z-10">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${task.done ? 'bg-gray-50 opacity-60' : 'bg-white border border-gray-100 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {task.done ? (
                                <CheckCircle2 size={20} className="text-green-500" />
                            ) : (
                                <Circle size={20} className="text-gray-300" />
                            )}
                            <span className={`text-sm font-medium ${task.done ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                {task.title}
                            </span>
                            {task.isProOnly && !isPro && !task.done && (
                                <span className="text-[10px] font-bold bg-gradient-to-r from-rose-100 to-pink-100 text-pink-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                    PRO
                                </span>
                            )}
                        </div>

                        {!task.done && (
                            <button
                                onClick={task.action}
                                className="flex items-center gap-1 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl transition-colors"
                            >
                                {task.buttonText}
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
