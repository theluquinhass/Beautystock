import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ChevronRight } from 'lucide-react';

export default function PainPoints() {
    const painPoints = [
        { text: "Vende produto que não tem (e passa vergonha com a cliente)." },
        { text: "Esquece quem está devendo e quando vai pagar." },
        { text: "Não sabe seu lucro real no fim do mês." },
        { text: "Perde venda porque a cliente cansou de esperar foto no WhatsApp." },
    ];

    return (
        <section className="py-20 lg:py-28 bg-[#fdf2f8] relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-12 tracking-tight"
                >
                    Sem controle, você <span className="text-[#ec4899]">perde dinheiro</span> sem perceber.
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 flex items-start text-left gap-4 hover:shadow-md transition-shadow"
                        >
                            <div className="mt-1">
                                <XCircle size={24} className="text-red-400" />
                            </div>
                            <p className="text-gray-700 font-semibold leading-relaxed text-base md:text-lg">
                                {point.text}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <a
                        href="#precos"
                        className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Quero resolver isso
                        <ChevronRight size={20} />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
