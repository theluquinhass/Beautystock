import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
    return (
        <section id="precos" className="py-20 lg:py-28 bg-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 flex justify-center w-full">
                <div className="w-[120%] h-96 bg-gradient-to-b from-[#fdf2f8] to-white rounded-b-[100%] opacity-70"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Escolha o plano certo para vender mais
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-500 font-medium"
                    >
                        Libere seu potencial máximo. Ou comece de graça para testar.
                    </motion.p>
                </div>

                <div className="flex flex-col-reverse lg:flex-row justify-center items-center lg:items-stretch gap-8 lg:gap-12">

                    {/* Card FREE */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-[400px] bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col lg:mt-8"
                    >
                        <div className="mb-8">
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Para testar</span>
                            <h3 className="text-3xl font-bold mt-4 mb-2 text-gray-900">Grátis</h3>
                            <p className="text-gray-500 font-medium text-sm">O básico para você começar hoje.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-gray-600 font-medium text-sm">
                                <Check size={20} className="text-gray-400 shrink-0" /> Até 50 produtos no estoque
                            </li>
                            <li className="flex items-start gap-3 text-gray-600 font-medium text-sm">
                                <Check size={20} className="text-gray-400 shrink-0" /> Até 5 clientes registrados
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm line-through">
                                <XIcon /> Sem relatórios completos de lucro
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm line-through">
                                <XIcon /> Sem controle avançado de fiado
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm line-through">
                                <XIcon /> Sem Inteligência Artificial
                            </li>
                        </ul>

                        <Link
                            to="/signup"
                            className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold py-3.5 px-4 rounded-xl transition-all text-center block"
                        >
                            Começar grátis
                        </Link>
                    </motion.div>

                    {/* Card PRO */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="w-full lg:w-[450px] bg-gray-900 rounded-3xl p-1 border-4 border-[#ec4899]/30 shadow-2xl relative transform lg:-translate-y-4"
                    >
                        <div className="absolute top-0 left-1/2 min-w-max -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ec4899] to-[#d8b4fe] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <span role="img" aria-label="star">⭐</span> Mais escolhido
                        </div>

                        <div className="bg-white rounded-[20px] p-8 h-full flex flex-col border border-pink-50 relative overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 skew-x-12 animate-[shine_3s_infinite] pointer-events-none z-10"></div>

                            <div className="mb-8 relative z-20">
                                <h3 className="text-3xl font-black mt-4 mb-2 text-gray-900 flex items-end gap-2">
                                    <span className="text-5xl tracking-tight">R$ 29</span><span className="text-xl text-gray-500 font-bold mb-1">,90</span><span className="text-gray-400 font-medium text-sm mb-1.5">/mês</span>
                                </h3>
                                <p className="text-gray-500 font-medium text-sm">Acesso total e ilimitado.</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1 relative z-20">
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> Produtos e Estoque ilimitados
                                </li>
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> Clientes e Fiado ilimitados
                                </li>
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> Relatórios de lucro e metas completos
                                </li>
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> Catálogo profissional online
                                </li>
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> Pedidos WhatsApp super organizados
                                </li>
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> IA Bibi 100% desbloqueada
                                </li>
                                <li className="flex items-start gap-3 text-gray-800 font-bold text-[15px]">
                                    <Check size={20} className="text-[#ec4899] shrink-0 stroke-[3]" /> Suporte prioritário Hórario Comercial
                                </li>
                            </ul>

                            <div className="relative z-20">
                                <Link
                                    to="/signup"
                                    className="w-full bg-gradient-to-r from-[#ec4899] to-pink-500 hover:from-[#db2777] hover:to-pink-600 text-white font-black text-lg py-4 px-4 rounded-xl shadow-lg border border-pink-400 text-center block transform hover:-translate-y-0.5 transition-all"
                                >
                                    ASSINAR PRO AGORA
                                </Link>
                                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs font-bold text-gray-500">
                                    <ShieldCheck size={14} className="text-green-500" /> Sem fidelidade • Cancele quando quiser
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Value vs Cost micro block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center max-w-md mx-auto"
                >
                    <div className="flex items-start gap-3 bg-pink-50 p-4 rounded-2xl border border-pink-100 text-left">
                        <Info size={24} className="text-[#ec4899] shrink-0 mt-0.5" />
                        <p className="text-gray-700 font-semibold text-sm leading-relaxed">
                            Pense bem: com o catálogo e estoque arrumados, <strong className="text-gray-900">1 única venda a mais no mês</strong> já paga a ferramenta completa e ainda sobra muito lucro.
                        </p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

function XIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-300">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
