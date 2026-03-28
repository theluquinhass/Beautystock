import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="py-12 sm:py-20 md:py-24 bg-white relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="bg-gradient-to-br from-[#ec4899] to-[#c084fc] rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-16 text-center shadow-[0_15px_40px_-10px_rgba(236,72,153,0.3)] relative overflow-hidden"
                >
                    {/* Background Patterns */}
                    <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-white opacity-10 rounded-full blur-[30px] sm:blur-[40px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-black opacity-[0.05] rounded-full blur-[30px] sm:blur-[40px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.15] tracking-tight">
                            Seu negócio merece mais<br className="hidden md:block"/> que um caderno.
                        </h2>
                        
                        <p className="text-[1.05rem] sm:text-xl md:text-2xl text-white/90 font-medium mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                            Organize seu estoque, abandone a dor de cabeça do fiado e transforme seu WhatsApp em uma máquina de vendas.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                            <a
                                href="#precos"
                                className="group flex items-center justify-center gap-2 bg-white text-[#ec4899] text-[1.05rem] sm:text-xl font-bold w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                Assinar o PRO
                                <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                        
                        <p className="mt-6 sm:mt-8 text-white/70 font-medium text-[13px] sm:text-sm px-4">
                            Menos de R$ 1 por dia. Chance 0 de se arrepender.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
