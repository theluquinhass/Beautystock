import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Results() {
    return (
        <section id="resultados" className="py-12 lg:py-28 bg-[#fdf2f8] border-b border-pink-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Antes e depois do BeautyStock
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-500 font-medium"
                    >
                        Veja como sua rotina se transforma quando você usa a ferramenta certa.
                    </motion.p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-16">

                    {/* Card Antes */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2 bg-white rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100 opacity-80 filter grayscale-[50%]"
                    >
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gray-100 text-gray-600 text-[11px] sm:text-sm font-bold mb-6 sm:mb-8">
                            <XCircle size={18} /> ANTES
                        </div>

                        <ul className="space-y-4 sm:space-y-6">
                            <li className="flex items-start gap-4 text-gray-500 text-base md:text-lg font-medium">
                                <XCircle className="text-gray-400 shrink-0 mt-0.5" />
                                <span>Anotações soltas no caderno e papéis perdidos.</span>
                            </li>
                            <li className="flex items-start gap-4 text-gray-500 text-base md:text-lg font-medium">
                                <XCircle className="text-gray-400 shrink-0 mt-0.5" />
                                <span>Fiado perdido: clientes que esquecem (ou fingem) que devem.</span>
                            </li>
                            <li className="flex items-start gap-4 text-gray-500 text-base md:text-lg font-medium">
                                <XCircle className="text-gray-400 shrink-0 mt-0.5" />
                                <span>Estoque confuso: vendeu o perfume, mas não tinha mais.</span>
                            </li>
                            <li className="flex items-start gap-4 text-gray-500 text-base md:text-lg font-medium">
                                <XCircle className="text-gray-400 shrink-0 mt-0.5" />
                                <span>Lucro desconhecido: não sabe para onde o dinheiro foi.</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Card Depois */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="w-full md:w-1/2 bg-white rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-pink-100/50 border-2 border-pink-200 transform md:-translate-y-4"
                    >
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-pink-100 text-[#ec4899] text-[11px] sm:text-sm font-bold mb-6 sm:mb-8 shadow-sm">
                            <CheckCircle2 size={18} /> DEPOIS (COM PRO)
                        </div>

                        <ul className="space-y-4 sm:space-y-6">
                            <li className="flex items-start gap-4 text-gray-900 text-base md:text-lg font-semibold">
                                <CheckCircle2 className="text-[#ec4899] shrink-0 mt-0.5" />
                                <span>Controle total na palma da mão, onde estiver.</span>
                            </li>
                            <li className="flex items-start gap-4 text-gray-900 text-base md:text-lg font-semibold">
                                <CheckCircle2 className="text-[#ec4899] shrink-0 mt-0.5" />
                                <span>Clientes organizados e lembretes de cobrança via IA.</span>
                            </li>
                            <li className="flex items-start gap-4 text-gray-900 text-base md:text-lg font-semibold">
                                <CheckCircle2 className="text-[#ec4899] shrink-0 mt-0.5" />
                                <span>Estoque certo, atualizado a cada pedido do WhatsApp.</span>
                            </li>
                            <li className="flex items-start gap-4 text-gray-900 text-base md:text-lg font-semibold">
                                <CheckCircle2 className="text-[#ec4899] shrink-0 mt-0.5" />
                                <span>Lucro visível: metas alcançadas e dinheiro no bolso.</span>
                            </li>
                        </ul>
                    </motion.div>

                </div>

                <div className="text-center px-4 sm:px-0">
                    <a
                        href="#precos"
                        className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#ec4899] hover:bg-[#db2777] text-white text-lg sm:text-xl font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-1 transition-all duration-300"
                    >
                        Quero o Depois
                        <ChevronRight size={24} />
                    </a>
                </div>

            </div>
        </section>
    );
}
