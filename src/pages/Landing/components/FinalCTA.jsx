import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="py-20 lg:py-28 relative overflow-hidden bg-gray-900 border-t-8 border-[#ec4899]">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-pink-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[60%] h-[60%] bg-purple-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-pink-300 text-sm font-bold mb-8 backdrop-blur-sm border border-white/10"
                >
                    <Sparkles size={18} />
                    Chegou a sua hora de crescer
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight"
                >
                    Pronta para organizar seu estoque e <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">vender mais?</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-2xl text-gray-400 font-medium mb-10 sm:mb-12 max-w-2xl mx-auto"
                >
                    Assine o PRO e comece hoje. Descubra o alívio de ter tudo sob controle no final do dia.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-6"
                >
                    <a
                        href="#precos"
                        className="group flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#ec4899] to-pink-500 hover:from-[#db2777] hover:to-pink-600 text-white text-lg sm:text-xl md:text-2xl font-black px-6 py-5 sm:px-12 sm:py-6 rounded-2xl shadow-[0_0_40px_-5px_rgba(236,72,153,0.5)] border border-pink-400 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                    >
                        <span>ASSINAR PRO AGORA</span>
                        <ChevronRight size={24} className="sm:w-7 sm:h-7 hidden sm:block transform group-hover:translate-x-1 transition-transform" />
                    </a>

                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                        <ShieldCheck size={16} className="text-pink-400" />
                        Sem fidelidade • Cancele quando quiser
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
