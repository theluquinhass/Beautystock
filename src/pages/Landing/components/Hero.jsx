import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Package, Smartphone, TrendingUp } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Soft Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ec4899] rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d8b4fe] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Column: Copy */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/80 text-pink-700 text-sm font-bold mb-6 shadow-sm mx-auto lg:mx-0 border border-pink-200"
                        >
                            <CheckCircle2 size={16} className="text-[#ec4899]" strokeWidth={2.5} />
                            Cancele quando quiser • Sem taxas escondidas
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#111827] mb-4 sm:mb-6 leading-[1.2] tracking-tight"
                        >
                            Organize seu estoque e <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec4899] to-[#d8b4fe]">venda mais</span> com um catálogo profissional.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base md:text-xl text-gray-600 mb-8 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0"
                        >
                            Cadastre seus produtos, compartilhe o link e receba pedidos no WhatsApp — com estoque atualizado e fiado controlado.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col gap-4 mb-10 w-full max-w-md mx-auto lg:mx-0"
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                    <Package size={16} className="text-[#ec4899]" />
                                </div>
                                <span className="font-semibold text-gray-800">Estoque inteligente <span className="font-normal text-gray-500">(evita vender sem ter)</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                    <Smartphone size={16} className="text-[#ec4899]" />
                                </div>
                                <span className="font-semibold text-gray-800">Pedidos organizados no WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                    <TrendingUp size={16} className="text-[#ec4899]" />
                                </div>
                                <span className="font-semibold text-gray-800">Controle de clientes, fiado e lucro</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center lg:justify-start"
                        >
                            <a
                                href="#precos"
                                className="flex items-center justify-center gap-2 bg-[#ec4899] hover:bg-[#db2777] text-white text-base sm:text-lg font-bold w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Assinar PRO agora
                                <ChevronRight size={20} />
                            </a>
                            <a
                                href="#como-funciona"
                                className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-base sm:text-lg font-bold w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-200"
                            >
                                Ver demo
                            </a>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mt-6 text-sm text-gray-500 font-medium"
                        >
                            Sem comissões • Suporte rápido • Funciona no celular e PC
                        </motion.p>
                    </div>

                    {/* Right Column: Visual Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        {/* Base Mockup - Catalog Frame */}
                        {/* Base Mockup - Catalog Frame */}
                        <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-2 border-gray-50 overflow-hidden transform md:rotate-2 md:hover:rotate-0 transition-transform duration-500">
                            {/* Browser Header */}
                            <div className="bg-white border-b border-gray-50/80 p-3 sm:p-4 flex items-center relative">
                                <div className="flex gap-1.5 absolute left-4 sm:left-5">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <div className="mx-auto w-full max-w-[220px] bg-white rounded-lg text-[9px] sm:text-[11px] text-gray-400 font-medium px-4 py-1.5 shadow-sm border border-gray-100/50 flex items-center justify-center">
                                    beautystock.app/c/meu-catalogo
                                </div>
                            </div>

                            {/* Fake Content: Catalog Grid */}
                            <div className="p-5 sm:p-6 bg-white min-h-[400px]">
                                {/* Banner & Avatar */}
                                <div className="relative mb-10 w-full max-w-[280px] sm:max-w-none">
                                    <div className="w-full h-24 sm:h-28 bg-gradient-to-r from-pink-100/60 to-purple-100/60 rounded-xl"></div>
                                    <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#ec4899] font-black text-xl shadow-sm">
                                        M
                                    </div>
                                </div>

                                {/* Title Skeletons */}
                                <div className="mb-8 space-y-2.5">
                                    <div className="h-4 w-28 bg-gray-200/80 rounded-full"></div>
                                    <div className="h-3 w-40 bg-gray-100/80 rounded-full"></div>
                                </div>

                                {/* Product Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white p-2.5 rounded-2xl border border-gray-100/80 flex flex-col gap-3">
                                            <div className="w-full aspect-[4/5] bg-gray-50 rounded-[14px]"></div>
                                            <div className="px-1 pb-1 flex flex-col gap-2">
                                                <div className="h-2.5 w-full bg-gray-200/80 rounded-full"></div>
                                                <div className="h-2.5 w-1/2 bg-pink-100/80 rounded-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Float 1: WhatsApp Notification Layer */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
                            className="absolute right-0 sm:-right-12 top-1/4 sm:top-1/3 bg-white p-3 sm:p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-50 z-20 w-[90%] sm:w-72 max-w-[260px] sm:max-w-none transform translate-x-2 sm:translate-x-0"
                        >
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <Smartphone size={20} className="text-green-500" />
                                </div>
                                <div className="pt-0.5">
                                    <div className="font-bold text-gray-900 text-sm">Novo pedido no WhatsApp!</div>
                                    <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">"Oi, vi no catálogo, quero aquele perfume..."</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Float 2: Dashboard Metrics Layer */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, type: 'spring', stiffness: 100 }}
                            className="absolute left-0 sm:-left-12 bottom-6 sm:bottom-12 bg-white p-4 sm:p-6 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-50 z-20 w-[85%] sm:w-64 max-w-[220px] sm:max-w-none transform -translate-x-2 sm:translate-x-0"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Lucro do mês</span>
                                    <span className="text-[10px] sm:text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+15%</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight leading-none">R$ 1.250</span>
                                    <span className="text-sm font-bold text-gray-400">,00</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-gradient-to-r from-[#ec4899] to-[#d8b4fe] w-[65%] rounded-full"></div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
