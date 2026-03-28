import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

function SparkleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
    )
}

export default function Transformation() {
    return (
        <section className="py-16 sm:py-20 md:py-24 bg-[#fdf2f8] relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-10 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-[2.2rem] sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        Do amadorismo ao <span className="text-[#ec4899]">profissionalismo.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.05rem] sm:text-lg text-gray-600 font-medium max-w-2xl mx-auto px-2"
                    >
                        Veja por que o BeautyStock é a virada de chave que seu negócio precisa hoje.
                    </motion.p>
                </div>

                <div className="flex flex-col md:flex-row gap-5 sm:gap-6 lg:gap-10">
                    {/* Before (Caderno) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 bg-white p-6 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-red-50 text-red-600 rounded-full text-[13px] sm:text-sm font-bold mb-6 sm:mb-8 border border-red-100">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Seu negócio hoje
                        </div>
                        
                        <ul className="space-y-4 sm:space-y-6">
                            {[
                                "Estoque bagunçado em caixas ocultas",
                                "Vendas fiado anotadas em cadernos perdidos",
                                "Cobrança constrangedora feita 1 a 1",
                                "Atendimento demorado com muitas fotos soltas",
                                "Sem controle do lucro ou das despesas",
                                "Imagem de 'vendedora amadora'"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 sm:gap-4 items-start">
                                    <div className="mt-1 shrink-0">
                                        <X className="text-red-400 w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-600 font-medium text-[0.95rem] sm:text-lg leading-snug sm:leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* After (BeautyStock) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex-1 bg-gradient-to-br from-[#1f2937] to-[#111827] p-6 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(236,72,153,0.3)] relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-[#ec4899] rounded-full mix-blend-screen filter blur-[80px] sm:blur-[100px] opacity-30 pointer-events-none"></div>

                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-pink-500/20 text-pink-300 rounded-full text-[13px] sm:text-sm font-bold mb-6 sm:mb-8 border border-pink-500/30">
                            <SparkleIcon />
                            Com BeautyStock
                        </div>

                        <ul className="space-y-4 sm:space-y-6 relative z-10">
                            {[
                                "Controle automático de estoque com alertas",
                                "Histórico completo de clientes com fiado exato",
                                "Cobranças profissionais com 1 clique no WhatsApp",
                                "Catálogo online premium atualizado 24h",
                                "Dashboard completo com lucro e crescimento real",
                                "Posicionamento como 'Loja Profissional'"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 sm:gap-4 items-start">
                                    <div className="mt-0.5 sm:mt-1 shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <Check className="text-green-400 w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-200 font-medium text-[0.95rem] sm:text-lg leading-snug sm:leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
