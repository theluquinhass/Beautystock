import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MessageCircle, LayoutDashboard } from 'lucide-react';

export default function InteractiveDemo() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        {
            id: 0,
            icon: Store,
            title: "Catálogo",
            description: "Sua vitrine online. Produtos sempre com estoque e preço correto.",
            mockup: (
                <div className="bg-gray-50 p-4 rounded-xl h-full border border-gray-100 flex flex-col pt-6">
                    <div className="w-16 h-16 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-pink-500 text-xl border-4 border-white shadow-sm">MB</div>
                    <div className="h-4 w-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2"></div>
                                <div className="h-2.5 w-full bg-gray-200 rounded-full mb-1.5"></div>
                                <div className="h-3 w-1/2 bg-pink-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 1,
            icon: MessageCircle,
            title: "Pedido no WhatsApp",
            description: "Mensagem pronta com todos os itens, total e desconto.",
            mockup: (
                <div className="bg-[#e5ddd5] p-4 rounded-xl h-full border border-gray-200 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-14 bg-[#075e54] flex items-center px-4 gap-3 z-10">
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                        <div className="h-4 w-24 bg-white/40 rounded-full"></div>
                    </div>
                    <div className="mt-16 flex flex-col gap-3">
                        <div className="bg-white p-3 rounded-xl rounded-tl-none w-[85%] shadow-sm self-start">
                            <div className="h-3 w-3/4 bg-gray-200 rounded-full mb-2"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="bg-[#dcf8c6] p-3 rounded-xl rounded-tr-none w-[90%] shadow-sm self-end">
                            <div className="text-xs text-gray-800 font-medium mb-2">*Novo Pedido - Maria da Silva!* 🛍️</div>
                            <div className="text-xs text-gray-600 mb-1">- 1x Perfume XYZ (R$ 150)</div>
                            <div className="text-xs text-gray-600 mb-2">- 2x Batom Red (R$ 80)</div>
                            <div className="text-xs font-bold text-gray-900">*Total: R$ 230,00*</div>
                            <div className="text-[10px] text-gray-400 mt-2 text-right">09:41 ✓✓</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            icon: LayoutDashboard,
            title: "Painel",
            description: "Acompanhe lucro, estoque e fiado de clientes fáceis de ler.",
            mockup: (
                <div className="bg-gray-50 w-full h-full p-6 border border-gray-100 rounded-xl">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50">
                            <div className="text-xs text-gray-500 font-bold mb-1">🔥 LUCRO MENSAL</div>
                            <div className="text-xl font-black text-gray-900">R$ 1.250,00</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
                            <div className="text-xs text-gray-500 font-bold mb-1">⚠️ FIADO</div>
                            <div className="text-xl font-black text-red-500">R$ 430,00</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-32 flex items-end gap-2 pb-0 overflow-hidden relative">
                        <div className="absolute top-4 left-4 text-xs font-bold text-gray-500">VENDAS DA SEMANA</div>
                        <div className="w-[15%] rounded-t-lg bg-pink-100 h-[30%]"></div>
                        <div className="w-[15%] rounded-t-lg bg-pink-200 h-[50%]"></div>
                        <div className="w-[15%] rounded-t-lg bg-pink-300 h-[80%]"></div>
                        <div className="w-[15%] rounded-t-lg bg-pink-400 h-[40%]"></div>
                        <div className="w-[15%] rounded-t-lg bg-pink-500 h-[95%]"></div>
                        <div className="w-[15%] rounded-t-lg bg-pink-600 h-[75%]"></div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section className="py-20 lg:py-28 bg-[#fdf2f8] border-y border-pink-100/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Tudo conectado em um só lugar
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-600 font-medium"
                    >
                        Nenhuma informação se perde. O BeautyStock integra todas as pontas do seu negócio.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-pink-100/30 border border-white">

                    {/* Tabs Selector */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-3 md:gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`text-left p-4 rounded-2xl transition-all duration-300 border-2 ${activeTab === tab.id
                                    ? 'border-[#ec4899] bg-pink-50 shadow-md transform lg:translate-x-4'
                                    : 'border-transparent hover:bg-gray-50 hover:border-gray-100 opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-[#ec4899] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <tab.icon size={20} />
                                    </div>
                                    <h3 className={`font-bold text-lg ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {tab.title}
                                    </h3>
                                </div>
                                {activeTab === tab.id && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-gray-600 text-sm font-medium mt-2"
                                    >
                                        {tab.description}
                                    </motion.p>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Interactive Mockup Display */}
                    <div className="w-full lg:w-2/3 h-[400px] sm:h-[450px] lg:h-[500px] relative">
                        <div className="w-full h-full bg-white rounded-3xl border-[8px] border-gray-900 shadow-2xl overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full absolute inset-0"
                                >
                                    {tabs[activeTab].mockup}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
