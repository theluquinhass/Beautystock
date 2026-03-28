import React from 'react';
import { motion } from 'framer-motion';
import { ScanBarcode, UserCheck, MessageSquare, LineChart, FileSpreadsheet, Bot } from 'lucide-react';

export default function Features() {
    const features = [
        {
            title: "Catálogo Online Profissional",
            desc: "Catálogo ilimitado e hiper organizado. Exiba produtos, variações e preços em um link próprio super elegante.",
            icon: <ScanBarcode className="w-5 h-5 text-pink-500" />,
            colSpan: "md:col-span-2 lg:col-span-6",
            mockup: (
                <div className="mt-8 flex justify-center -mb-8 overflow-hidden h-[260px] sm:h-[300px] transition-transform duration-700 group-hover:-translate-y-2 relative w-full">

                    {/* Fading bottom edge to make it blend */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fdf2f8] to-transparent z-10 pointer-events-none"></div>

                    {/* Catálogo Viewport - Clean & Minimalist */}
                    <div className="w-[85%] sm:w-[260px] max-w-[280px] bg-[#fdf2f8] rounded-t-[2rem] shadow-[0_-10px_40px_-10px_rgba(236,72,153,0.12)] border border-white/60 flex flex-col pt-6 px-4 sm:px-5 overflow-hidden relative">

                        {/* Header da Loja */}
                        <div className="flex flex-col items-center mb-5 shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-200 to-purple-200 p-[2px] mb-2.5 shadow-sm">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                                    <span className="text-pink-400 font-medium text-lg relative font-serif">B</span>
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-800 text-[13px] leading-tight flex items-center gap-1">
                                Bella Glow
                                <span className="w-3 h-3 bg-pink-400 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </span>
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-medium tracking-wide">PERFUMARIA & BELEZA</p>
                        </div>

                        {/* Categorias Tabs */}
                        <div className="flex gap-2.5 mb-5 overflow-hidden pb-1 -mx-2 px-2 shrink-0 justify-center">
                            <span className="shrink-0 bg-pink-100/60 text-pink-600 text-[9px] font-bold px-3.5 py-1.5 rounded-full tracking-wide">Todos</span>
                            <span className="shrink-0 bg-white text-gray-500 border border-transparent text-[9px] font-medium px-3.5 py-1.5 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:text-pink-500 transition-colors cursor-default">Perfumes</span>
                            <span className="shrink-0 bg-white text-gray-500 border border-transparent text-[9px] font-medium px-3.5 py-1.5 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:text-pink-500 transition-colors cursor-default">Maquiagem</span>
                        </div>

                        {/* Produtos List */}
                        <div className="flex flex-col gap-3 pb-12 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                            {/* Produto 1 */}
                            <div className="bg-white/80 backdrop-blur-md rounded-[1.2rem] shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] border border-white p-2 flex items-center gap-3.5 relative hover:bg-white hover:border-pink-50 transition-all duration-300 group/item">
                                <div className="w-[3.5rem] h-[3.5rem] bg-pink-50/50 rounded-xl overflow-hidden shrink-0 relative">
                                    <div className="absolute inset-0 bg-black/2 z-10"></div>
                                    <img src="/demo/crystal_gloss.png" alt="Gloss Crystal" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h5 className="font-semibold text-gray-700 text-[11px] truncate mb-1">Gloss Crystal</h5>
                                    <p className="font-bold text-pink-500 text-[12px]">R$ 24,90</p>
                                </div>
                            </div>

                            {/* Produto 2 */}
                            <div className="bg-white/80 backdrop-blur-md rounded-[1.2rem] shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] border border-white p-2 flex items-center gap-3.5 relative hover:bg-white hover:border-pink-50 transition-all duration-300 group/item">
                                <div className="w-[3.5rem] h-[3.5rem] bg-purple-50/50 rounded-xl overflow-hidden shrink-0 relative">
                                    <div className="absolute inset-0 bg-black/2 z-10"></div>
                                    <img src="/demo/perfume_nuit.png" alt="Soft Nuit" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h5 className="font-semibold text-gray-700 text-[11px] truncate mb-1">Soft Nuit</h5>
                                    <p className="font-bold text-pink-500 text-[12px]">R$ 89,90</p>
                                </div>
                            </div>

                            {/* Produto 3 */}
                            <div className="bg-white/80 backdrop-blur-md rounded-[1.2rem] shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] border border-white p-2 flex items-center gap-3.5 relative hover:bg-white hover:border-pink-50 transition-all duration-300 group/item">
                                <div className="w-[3.5rem] h-[3.5rem] bg-pink-50/50 rounded-xl overflow-hidden shrink-0 relative">
                                    <div className="absolute inset-0 bg-black/2 z-10"></div>
                                    <img src="/demo/body_splash.png" alt="Velvet Bloom" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h5 className="font-semibold text-gray-700 text-[11px] truncate mb-1">Velvet Bloom</h5>
                                    <p className="font-bold text-pink-500 text-[12px]">R$ 49,90</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "CRM e Controle de Fiado",
            desc: "Controle clientes e abata fiados direto no perfil com extrema organização.",
            icon: <UserCheck className="w-5 h-5 text-purple-500" />,
            colSpan: "md:col-span-1 lg:col-span-3",
        },
        {
            title: "Pedidos no WhatsApp",
            desc: "Sua cliente monta o carrinho e o pedido chega 100% pronto no seu chat.",
            icon: <MessageSquare className="w-5 h-5 text-green-500" />,
            colSpan: "md:col-span-1 lg:col-span-3",
        },
        {
            title: "Dashboard Comercial",
            desc: "Gráficos perfeitos e claros de faturamento, vendas e produtos em tempo real.",
            icon: <LineChart className="w-5 h-5 text-gray-800" />,
            colSpan: "md:col-span-1 lg:col-span-4",
        },
        {
            title: "Importação Automática",
            desc: "Vindo de outro sistema? Importamos seu estoque inteiro via Excel em 1 clique.",
            icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
            colSpan: "md:col-span-1 lg:col-span-4",
        },
        {
            title: "Insights da Bibi (A.I.)",
            desc: "Nossa IA aponta gargalos e oportunidades invisíveis no seu negócio.",
            icon: <Bot className="w-5 h-5 text-pink-500" />,
            colSpan: "md:col-span-2 lg:col-span-4",
        }
    ];

    return (
        <section id="funcionalidades" className="py-10 sm:py-20 md:py-24 bg-[#fdf2f8] relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-[2.2rem] sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        Tudo que você precisa em <br className="hidden md:block" /> um só lugar
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.05rem] sm:text-lg text-gray-600 font-medium px-2"
                    >
                        Ferramentas premium de alto nível mastigadas em uma interface absurdamente simples de usar.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-5">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={`${feature.colSpan} bg-white rounded-[1.25rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_8px_30px_-10px_rgba(236,72,153,0.15)] hover:border-pink-200 transition-all overflow-hidden flex flex-col justify-between group cursor-default`}
                        >
                            <div>
                                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[0.7rem] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-pink-50 group-hover:border-pink-100 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-[1.05rem] sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">{feature.title}</h3>
                                </div>
                                <p className="text-gray-600 font-medium leading-relaxed text-[0.95rem] sm:text-base">
                                    {feature.desc}
                                </p>
                            </div>
                            {feature.mockup && feature.mockup}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
