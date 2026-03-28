import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export default function Pricing() {
    return (
        <section id="precos" className="py-14 sm:py-20 md:py-24 bg-[#fdf2f8] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#ec4899] rounded-full mix-blend-multiply filter blur-[100px] sm:blur-[150px] opacity-[0.05] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-[2.2rem] sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        Um investimento que se paga na <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">primeira venda salva.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.05rem] sm:text-lg md:text-xl text-gray-600 font-medium leading-relaxed px-2"
                    >
                        Sem taxas escondidas. Sem comissão por venda. Apenas uma assinatura simples para profissionalizar toda a sua operação.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-5 sm:gap-8 max-w-5xl mx-auto items-stretch">

                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full lg:w-[45%] bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-sm border border-gray-100 flex flex-col justify-between"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[13px] sm:text-sm font-bold mb-4 sm:mb-6">
                                Básico
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Plano Inicial</h3>
                            <p className="text-gray-500 font-medium mb-6 sm:mb-8 text-[0.95rem] sm:text-base">Para testar se o sistema faz sentido para você.</p>

                            <div className="flex items-baseline gap-2 mb-6 sm:mb-8">
                                <span className="text-4xl sm:text-5xl font-black text-gray-900">Grátis</span>
                                <span className="text-gray-500 font-medium text-sm sm:text-base">/para sempre</span>
                            </div>

                            <ul className="space-y-3 sm:space-y-4 mb-8">
                                <li className="flex gap-3 text-gray-600 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-gray-400 mt-0.5 shrink-0" /> Até 50 produtos fixos</li>
                                <li className="flex gap-3 text-gray-600 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-gray-400 mt-0.5 shrink-0" /> Até 10 clientes cadastrados</li>
                                <li className="flex gap-3 text-gray-600 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-gray-400 mt-0.5 shrink-0" /> Catálogo com marca d'água</li>
                                <li className="flex gap-3 text-gray-400 font-medium text-[0.95rem] sm:text-base leading-snug items-start opacity-70"><X size={18} className="text-gray-300 mt-0.5 shrink-0" /> Sem CRM de cobrança no WhatsApp</li>
                                <li className="flex gap-3 text-gray-400 font-medium text-[0.95rem] sm:text-base leading-snug items-start opacity-70"><X size={18} className="text-gray-300 mt-0.5 shrink-0" /> Sem Importação via Excel</li>
                                <li className="flex gap-3 text-gray-400 font-medium text-[0.95rem] sm:text-base leading-snug items-start opacity-70"><X size={18} className="text-gray-300 mt-0.5 shrink-0" /> Sem relatórios avançados</li>
                            </ul>
                        </div>

                        <button className="w-full py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold border border-gray-200 transition-colors text-[1.05rem] sm:text-base mt-auto">
                            Começar grátis
                        </button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full lg:w-[55%] bg-gradient-to-b from-[#111827] to-[#1f2937] rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-[0_15px_40px_-5px_rgba(236,72,153,0.3)] border-2 border-pink-500/20 lg:border-gray-800 relative transform lg:-translate-y-4 flex flex-col justify-between"
                    >
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#ec4899] rounded-full mix-blend-screen filter blur-[60px] sm:blur-[80px] opacity-20 pointer-events-none"></div>

                        <div>
                            <div className="absolute top-0 right-6 sm:right-8 transform -translate-y-1/2">
                                <div className="bg-gradient-to-r from-[#ec4899] to-[#d8b4fe] text-white text-[12px] sm:text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg border border-pink-400/50 flex items-center gap-1.5">
                                    <Sparkles size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Mais escolhido
                                </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Plano PRO</h3>
                            <p className="text-pink-200 font-medium mb-6 sm:mb-8 text-[0.95rem] sm:text-base">Tudo liberado para profissionalizar seu negócio.</p>

                            <div className="flex items-end gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-white">
                                <span className="text-lg sm:text-xl text-gray-400 font-medium pb-1.5">R$</span>
                                <span className="text-5xl sm:text-6xl font-black leading-none tracking-tight">29</span>
                                <span className="text-2xl sm:text-3xl font-black leading-none">,90</span>
                                <span className="text-sm sm:text-base text-gray-400 font-medium pb-1">/mês</span>
                            </div>
                            <div className="text-green-300 text-[13px] sm:text-sm font-bold mb-6 sm:mb-8 bg-green-500/10 inline-block px-3 py-1.5 rounded-lg border border-green-500/30">
                                ⭐ Menos de R$ 1 por dia
                            </div>

                            <ul className="space-y-3 sm:space-y-4 mb-8">
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> <strong className="text-white">Produtos Ilimitados</strong></li>
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> <strong className="text-white">Clientes Ilimitados</strong></li>
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> Catálogo online sem marcas d'água</li>
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> CRM e envio direto de cobrança</li>
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> Importação rápida por Planilha</li>
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> Dashboards Avançados e Realistas</li>
                                <li className="flex gap-3 text-gray-200 font-medium text-[0.95rem] sm:text-base leading-snug items-start"><Check size={18} className="text-[#ec4899] mt-0.5 shrink-0" /> Suporte Prioritário por WhatsApp</li>
                            </ul>
                        </div>

                        <button className="w-full py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#d8b4fe] hover:from-[#db2777] hover:to-[#c084fc] text-white font-bold shadow-[0_8px_20px_-6px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-0.5 text-[1.05rem] sm:text-base mt-auto">
                            Assinar PRO agora
                        </button>
                    </motion.div>
                </div>

                <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px] sm:text-sm border-b border-dashed border-gray-300 pb-1.5 leading-snug justify-center">
                        <ShieldAlert size={16} className="shrink-0" /> 
                        <span>Você assina, testa e se não gostar nos primeiros 7 dias, devolvemos 100% do valor.</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
