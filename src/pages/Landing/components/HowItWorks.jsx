import React from 'react';
import { motion } from 'framer-motion';
import { PackagePlus, Share2, MessageCircleHeart, ChevronRight } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: PackagePlus,
            title: "1. Cadastre produtos",
            description: "Adicione foto, preço de custo, preço de venda e quantidade rapidamente.",
            color: "bg-pink-100 text-pink-600",
        },
        {
            icon: Share2,
            title: "2. Compartilhe o catálogo",
            description: "Envie seu link exclusivo para as clientes no WhatsApp ou Instagram.",
            color: "bg-purple-100 text-purple-600",
        },
        {
            icon: MessageCircleHeart,
            title: "3. Receba pedidos no WhatsApp",
            description: "A cliente monta a sacola e o pedido chega pronto para você (com estoque atualizado!).",
            color: "bg-green-100 text-green-600",
        }
    ];

    return (
        <section id="como-funciona" className="py-20 lg:py-28 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Vender online nunca foi tão simples.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-500 font-medium"
                    >
                        Apenas 3 passos separam você de um negócio mais organizado e lucrativo.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 relative mb-16">
                    {/* Connector Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-gray-100 -z-10"></div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="flex flex-col items-center text-center relative z-10 bg-gray-50 md:bg-transparent p-6 sm:p-8 rounded-3xl border border-gray-100 md:border-transparent md:p-0"
                        >
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${step.color} flex items-center justify-center mb-6 shadow-sm border-4 border-white transform hover:scale-105 transition-transform shrink-0`}>
                                <step.icon size={40} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed max-w-sm">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <a
                        href="#precos"
                        className="inline-flex items-center justify-center gap-2 bg-[#ec4899] hover:bg-[#db2777] text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-1 transition-all duration-300"
                    >
                        Assinar PRO agora
                        <ChevronRight size={24} />
                    </a>
                </motion.div>

            </div>
        </section>
    );
}
