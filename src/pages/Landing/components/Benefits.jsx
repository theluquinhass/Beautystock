import React from 'react';
import { motion } from 'framer-motion';
import { PackageSearch, Users, Globe, Smartphone, TrendingUp, Bot } from 'lucide-react';

export default function Benefits() {
    const benefits = [
        {
            icon: PackageSearch,
            title: "Estoque inteligente",
            desc: "Com alertas de estoque baixo e controle de lucro.",
            color: "text-pink-600 bg-pink-100"
        },
        {
            icon: Users,
            title: "Clientes e fiado",
            desc: "Quem deve, quanto deve e data de vencimento.",
            color: "text-purple-600 bg-purple-100"
        },
        {
            icon: Globe,
            title: "Catálogo profissional",
            desc: "Seu link online para divulgar a toda hora.",
            color: "text-blue-600 bg-blue-100"
        },
        {
            icon: Smartphone,
            title: "Pedidos no WhatsApp",
            desc: "Mensagens claras, formatadas e profissionais.",
            color: "text-green-600 bg-green-100"
        },
        {
            icon: TrendingUp,
            title: "Relatórios de lucro",
            desc: "Faturamento, lucro real e acompanhamento de metas.",
            color: "text-amber-600 bg-amber-100"
        },
        {
            icon: Bot,
            title: "IA Bibi",
            desc: "Sua assistente: insights e lembretes de cobrança.",
            color: "text-rose-600 bg-rose-100"
        }
    ];

    return (
        <section id="beneficios" className="py-20 lg:py-28 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Tudo que você precisa para vender como profissional.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-500 font-medium"
                    >
                        Nossas ferramentas foram feitas sob medida para resolver os problemas do seu dia a dia.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 group cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}>
                                <benefit.icon size={28} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium mb-6">
                                {benefit.desc}
                            </p>
                            <div className="text-[11px] font-bold text-[#ec4899] uppercase tracking-wider bg-pink-50 inline-block px-3 py-1 rounded-full border border-pink-100 group-hover:bg-pink-100 transition-colors">
                                Feito para revendedoras
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
