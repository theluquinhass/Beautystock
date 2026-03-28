import React from 'react';
import { motion } from 'framer-motion';

export default function Niche() {
    return (
        <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-20">
                    
                    {/* Visual side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 relative mt-4 lg:mt-0"
                    >
                        {/* Background blobs for a premium feminine look */}
                        <div className="absolute inset-0 -m-4 sm:-m-8 bg-gradient-to-br from-pink-100/80 to-purple-100/80 rounded-full blur-[60px] sm:blur-[80px] z-0"></div>
                        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex flex-col gap-3 sm:gap-4 pt-8 sm:pt-12">
                                <div className="bg-white p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] shadow-sm border border-pink-50 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-xl shrink-0">💄</div>
                                    <div className="font-bold text-gray-900 sm:mt-2.5">Maquiagens</div>
                                </div>
                                <div className="bg-white p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] shadow-sm border border-pink-50 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-xl shrink-0">🧴</div>
                                    <div className="font-bold text-gray-900 sm:mt-2.5">Cosméticos</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <div className="bg-white p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] shadow-sm border border-pink-50 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-xl shrink-0">✨</div>
                                    <div className="font-bold text-gray-900 sm:mt-2.5">Perfumes</div>
                                </div>
                                <div className="bg-white p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] shadow-sm border border-pink-50 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">🍼</div>
                                    <div className="font-bold text-gray-900 sm:mt-2.5 text-sm sm:text-base leading-tight">Linha Bebê</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Copy side */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 text-pink-600 text-[13px] sm:text-sm font-bold mb-5 sm:mb-6 border border-pink-100"
                        >
                            Exclusivo para o seu mercado
                        </motion.div>
                        
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-[2.2rem] sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-[1.15] tracking-tight"
                        >
                            Não somos um sistema genérico de pastelaria.
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-4 text-[1.05rem] sm:text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0"
                        >
                            <p>
                                A maioria dos ERPs do mercado foi feita para padarias ou mercados de esquina. São difíceis, frios e cheios de telas inúteis.
                            </p>
                            <p>
                                O <strong className="text-gray-900">BeautyStock</strong> foi desenhado fio a fio para consultoras e lojistas que vendem beleza. Entendemos suas marcas, suas variações e a forma como você atende no WhatsApp.
                            </p>
                        </motion.div>
                        
                    </div>

                </div>
            </div>
        </section>
    );
}
