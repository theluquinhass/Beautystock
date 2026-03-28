import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Lock, MessageSquare, ArrowRight, ShieldCheck, Sparkles, TrendingUp, ShoppingBag, Star } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-24 pb-10 md:pt-36 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#fdf2f8]/50 to-white">
            {/* Highly Refined Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] md:w-[60%] h-[60%] bg-gradient-to-br from-[#ec4899] to-pink-300 rounded-full mix-blend-multiply filter blur-[100px] md:blur-[150px] opacity-[0.15] md:opacity-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[60%] h-[60%] bg-gradient-to-tl from-[#d8b4fe] to-purple-300 rounded-full mix-blend-multiply filter blur-[100px] md:blur-[150px] opacity-[0.2]"></div>

                {/* Subtle grid pattern for depth */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-12">

                    {/* Left Column: Copy */}
                    <div className="w-full lg:w-[50%] flex flex-col items-center text-center lg:items-start lg:text-left mt-2 md:mt-0">

                        {/* Premium Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 text-[11px] md:text-sm font-bold mb-4 md:mb-8 shadow-sm border border-pink-100/60 mx-auto lg:mx-0 group hover:border-pink-200 transition-colors"
                        >
                            <Sparkles size={14} className="text-[#ec4899] md:w-4 md:h-4" strokeWidth={2.5} />
                            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Teste sem risco <span className="hidden md:inline">• Cancele quando quiser</span>
                            </span>
                        </motion.div>

                        {/* High-Impact Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                            className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1f2937] mb-3 md:mb-6 leading-[1.1] md:leading-[1.1] tracking-tight px-2 lg:px-0"
                        >
                            {/* Mobile Headline */}
                            <span className="block lg:hidden">
                                A sua revenda <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec4899] to-[#d8b4fe]">profissional.</span>
                            </span>
                            {/* Desktop Headline */}
                            <span className="hidden lg:block">
                                Profissionalize sua revenda e <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec4899] to-[#d8b4fe]">venda mais</span> todo dia.
                            </span>
                        </motion.h1>

                        {/* Refined Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="text-[1rem] sm:text-lg md:text-xl text-gray-500 lg:text-gray-600 mb-6 md:mb-8 leading-relaxed font-medium max-w-[300px] sm:max-w-xl md:max-w-2xl mx-auto lg:mx-0"
                        >
                            {/* Mobile Subtitle */}
                            <span className="block lg:hidden">
                                Seu catálogo online com pedidos <br /> diretos no WhatsApp.
                            </span>
                            {/* Desktop Subtitle */}
                            <span className="hidden lg:inline">
                                Cadastre seus produtos, compartilhe o link exclusivo e receba pedidos organizados no WhatsApp.
                            </span>
                        </motion.p>

                        {/* Desktop Premium Feature Pills (Hidden on Mobile as per requested Hierarchy) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            className="hidden lg:flex flex-col gap-2.5 md:gap-3 mb-8 md:mb-10 w-full max-w-sm sm:max-w-lg mx-auto lg:mx-0"
                        >
                            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100/80 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all">
                                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100/50">
                                    <CheckCircle2 size={16} className="text-[#ec4899]" />
                                </div>
                                <span className="font-bold text-gray-800 text-[14px] sm:text-[15px] text-left leading-tight">Estoque 100% controlado</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100/80 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100/50">
                                    <CheckCircle2 size={16} className="text-[#a855f7]" />
                                </div>
                                <span className="font-bold text-gray-800 text-[14px] sm:text-[15px] text-left leading-tight">Pedidos fáceis no WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100/80 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all">
                                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100/50">
                                    <CheckCircle2 size={16} className="text-[#22c55e]" />
                                </div>
                                <span className="font-bold text-gray-800 text-[14px] sm:text-[15px] text-left leading-tight">Clientes e fiado organizados</span>
                            </div>
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                            className="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full px-4 lg:px-0 justify-center lg:justify-start z-20"
                        >
                            {/* Main CTA */}
                            <a
                                href="#precos"
                                className="group relative flex items-center justify-center gap-2 bg-[#ec4899] hover:bg-[#db2777] text-white text-[17px] md:text-lg font-bold w-full sm:w-auto px-6 md:px-8 py-4 md:py-4 rounded-full md:rounded-full rounded-[20px] shadow-[0_8px_25px_-8px_rgba(236,72,153,0.6)] hover:shadow-[0_12px_30px_-8px_rgba(236,72,153,0.8)] active:scale-95 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Assinar PRO agora
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </a>
                            {/* Secondary CTA - Discreet on mobile */}
                            <a
                                href="#funcionalidades"
                                className="flex items-center justify-center gap-2 lg:bg-white/80 lg:backdrop-blur-sm text-gray-500 lg:text-gray-800 lg:border-2 lg:border-gray-200 lg:hover:border-gray-300 lg:hover:bg-gray-50 text-[14px] md:text-lg font-bold w-full sm:w-auto px-6 md:px-8 py-2 md:py-4 rounded-full shadow-none lg:shadow-sm lg:hover:shadow-md transition-all duration-300"
                            >
                                Ver demonstração
                            </a>
                        </motion.div>

                        {/* Trust text - Desktop Only */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="hidden md:flex mt-8 flex-row flex-wrap justify-center lg:justify-start items-center gap-4 text-sm text-gray-500 font-semibold"
                        >
                            <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                <ShieldCheck size={14} className="text-gray-400" /> Sem comissões
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                <ShieldCheck size={14} className="text-gray-400" /> Suporte rápido
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                <ShieldCheck size={14} className="text-gray-400" /> Web & Mobile
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Premium Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 50 }}
                        className="w-full lg:w-[50%] relative mt-2 md:mt-0"
                    >
                        {/* Mockup Backglow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-[#ec4899] to-[#d8b4fe] blur-[60px] md:blur-[100px] opacity-[0.25] md:opacity-[0.2] rounded-full pointer-events-none"></div>

                        {/* Base Mockup - Catalog Frame */}
                        <motion.div 
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-[#ffffff] rounded-3xl md:rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(236,72,153,0.15)] border border-gray-100/80 overflow-hidden transform md:rotate-1 md:hover:rotate-0 transition-transform duration-700 ease-out hover:shadow-[0_40px_80px_-20px_rgba(236,72,153,0.25)] mx-auto max-w-[320px] sm:max-w-[400px] md:max-w-[500px]"
                        >

                            {/* Browser Header */}
                            <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 p-2.5 sm:p-4 items-center relative z-10 flex">
                                <div className="flex gap-1.5 sm:gap-2 absolute left-3 sm:left-5">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] shadow-sm border border-red-500/20"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] shadow-sm border border-yellow-500/20"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] shadow-sm border border-green-500/20"></div>
                                </div>
                                <div className="mx-auto w-[65%] sm:w-full max-w-[200px] sm:max-w-[240px] bg-white rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] text-gray-500 font-medium px-3 py-1.5 sm:py-2 shadow-sm border border-gray-200/60 flex items-center justify-center gap-1.5 sm:gap-2">
                                    <Lock size={10} className="text-green-500" /> <span className="truncate">beautystock.app/c/sua-loja</span>
                                </div>
                            </div>

                            {/* Catalog UI */}
                            <div className="bg-[#fcfcfc] min-h-[350px] sm:min-h-[420px] md:min-h-[500px] relative pointer-events-none">
                                {/* Banner & Header */}
                                <div className="relative mb-8 sm:mb-12">
                                    <div className="w-full h-20 sm:h-28 md:h-32 bg-gradient-to-r from-pink-200 to-purple-200 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm mix-blend-overlay"></div>
                                    </div>
                                    <div className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-6 w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] flex items-center justify-center text-white font-black text-xl sm:text-2xl">A</div>
                                    </div>
                                    <div className="absolute -bottom-4 left-20 sm:left-28 sm:-bottom-5">
                                        <h3 className="font-bold text-gray-800 text-sm sm:text-lg leading-tight">Amanda Revendedora</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            5.0 • Cosméticos & Perfumaria
                                        </p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="px-4 sm:px-6 pb-6 pt-2 sm:pt-4">
                                    {/* Categories */}
                                    <div className="flex gap-2 sm:gap-2.5 mb-4 sm:mb-6 overflow-hidden">
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-sm">Todos</div>
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-600 rounded-full text-[10px] sm:text-[11px] font-bold items-center border border-gray-100 whitespace-nowrap">Perfumes</div>
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-600 rounded-full text-[10px] sm:text-[11px] font-bold items-center border border-gray-100 whitespace-nowrap">Maquiagem</div>
                                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-600 rounded-full text-[10px] sm:text-[11px] font-bold items-center border border-gray-100 whitespace-nowrap">Skincare</div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        {/* Product 1 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-[#ec4899] to-pink-500 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-sm">Mais vendido</div>
                                            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/body_splash.png" alt="Body Splash Velvet Bloom" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Body Splash Velvet Bloom</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 49,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product 2 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/crystal_gloss.png" alt="Gloss Crystal Rose" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Gloss Crystal Rose</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 24,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product 3 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-sm">Em alta</div>
                                            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/facial_serum.png" alt="Sérum Facial Lumina" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Sérum Facial Lumina</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 39,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product 4 */}
                                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-[1.25rem] border border-gray-100 shadow-sm flex flex-col gap-2 relative transition-all">
                                            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden relative border border-gray-50">
                                                <img src="/demo/perfume_nuit.png" alt="Perfume Soft Nuit" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col px-0.5 sm:px-1">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">Perfume Soft Nuit</h4>
                                                <div className="mt-1 sm:mt-1.5">
                                                    <span className="text-[12px] sm:text-[14px] font-black text-[#ec4899]">R$ 89,90</span>
                                                </div>
                                                <div className="mt-2 w-full bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-green-100">
                                                    <MessageSquare size={10} /> Pedir no WhatsApp
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Float 1: WhatsApp Modern Notification */}
                        <motion.div
                            initial={{ x: 30, opacity: 0, scale: 0.9 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
                            className="absolute -right-2 sm:-right-8 top-[12%] sm:top-[20%] bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-[1.25rem] sm:rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-green-50 z-20 w-[55%] sm:w-[280px] max-w-[280px] transform origin-right scale-[0.85] sm:scale-100"
                        >
                            <div className="flex gap-2.5 sm:gap-3 items-start mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#25D366] rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(37,211,102,0.4)]">
                                    <MessageSquare size={18} className="text-white fill-current sm:w-[20px] sm:h-[20px]" />
                                </div>
                                <div className="pt-0.5">
                                    <div className="font-extrabold text-gray-900 text-[12px] sm:text-[14px] leading-tight mb-0.5">Pedido recebido via WhatsApp</div>
                                    <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">BeautyStock Notificações</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl sm:rounded-xl p-2.5 sm:p-3 border border-gray-100 flex flex-col gap-1.5 sm:gap-2">
                                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                    <span className="text-gray-500">Cliente:</span>
                                    <span className="font-bold text-gray-800">Anna</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                                    <span className="text-gray-500">Itens:</span>
                                    <span className="font-bold text-gray-800">3 produtos</span>
                                </div>
                                <div className="h-px w-full bg-gray-200/60 my-0.5"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">Total:</span>
                                    <span className="text-[12px] sm:text-[14px] font-black text-[#25D366]">R$ 289,90</span>
                                </div>
                                <div className="mt-1 w-full bg-green-100/50 text-green-700 text-[9px] sm:text-[10px] font-bold py-1 rounded border border-green-200 text-center">
                                    Status: Confirmado
                                </div>
                            </div>
                        </motion.div>

                        {/* Float 2: High-end Dashboard Card */}
                        <motion.div
                            initial={{ x: -30, opacity: 0, scale: 0.9 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 1, type: 'spring', stiffness: 100, damping: 15 }}
                            className="absolute -left-2 sm:-left-12 bottom-[8%] sm:bottom-[10%] bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-[1.25rem] sm:rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-pink-50 z-20 w-[50%] sm:w-[260px] max-w-[260px] transform origin-left scale-[0.85] sm:scale-100"
                        >
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                        <TrendingUp size={14} className="text-[#ec4899] sm:w-[16px] sm:h-[16px]" />
                                    </div>
                                    <span className="text-[10px] sm:text-[12px] font-bold text-gray-600 uppercase tracking-widest">Lucro no mês</span>
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-[12px] sm:text-[15px] font-bold text-gray-400">R$</span>
                                    <span className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none">4.250</span>
                                </div>

                                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between mt-1 sm:mt-2">
                                    <span className="text-[9px] sm:text-[11px] font-bold text-green-600">+15% este mês</span>
                                    <TrendingUp size={12} className="text-green-500" />
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

                {/* Mobile Benefits (Cards Row below Mockup) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex lg:hidden flex-wrap justify-center gap-2 mt-8 px-2"
                >
                    <div className="flex items-center gap-2 bg-white/80 border border-pink-100 px-3 py-2 rounded-xl shadow-sm">
                        <CheckCircle2 size={14} className="text-[#ec4899] shrink-0" />
                        <span className="text-[12px] font-bold text-gray-700">Estoque controlado</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 border border-purple-100 px-3 py-2 rounded-xl shadow-sm">
                        <CheckCircle2 size={14} className="text-[#a855f7] shrink-0" />
                        <span className="text-[12px] font-bold text-gray-700">Pedidos no WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 border border-green-100 px-3 py-2 rounded-xl shadow-sm">
                        <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                        <span className="text-[12px] font-bold text-gray-700">Clientes organizados</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
