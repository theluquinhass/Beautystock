import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, BellRing, PieChart, ShieldCheck, Smartphone } from 'lucide-react';

export default function Benefits() {
    const benefits = [
        {
            icon: <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
            bgColor: "bg-[#ec4899]",
            title: "Saiba de cabeça o seu estoque",
            desc: "Diga adeus à contagem manual. O sistema atualiza o estoque sozinho a cada nova venda."
        },
        {
            icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
            bgColor: "bg-[#d8b4fe]",
            title: "Fiado sem confusão",
            desc: "Saiba perfeitamente quem comprou, quanto lhe devem e controle tudo no perfil de cada cliente."
        },
        {
            icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />,
            bgColor: "bg-pink-100",
            title: "Catálogo lindo feito pra você",
            desc: "Mostre um visual rico às clientes e garanta vendas fáceis direto pelo carrinho do WhatsApp."
        },
        {
            icon: <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-[#1f2937]" />,
            bgColor: "bg-gray-200",
            title: "Organize cobranças e recados",
            desc: "Envie lembretes de cobrança gentis pelo WhatsApp com um único clique."
        },
        {
            icon: <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />,
            bgColor: "bg-green-100",
            title: "Tome decisões na certeza",
            desc: "Os gráficos avisam se sua loja está crescendo, quais seus maiores lucros e despesas."
        },
        {
            icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
            bgColor: "bg-[#1f2937]",
            title: "Seus dados blindados",
            desc: "Seu celular quebrou ou o caderno molhou? Com tudo na nuvem, você nunca perde seu trabalho."
        }
    ];

    return (
        <section id="beneficios" className="py-16 sm:py-20 md:py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-[2.2rem] sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        Resultados visíveis logo <br className="hidden sm:block"/> nos primeiros dias
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.05rem] sm:text-lg text-gray-600 font-medium px-2"
                    >
                        Criamos o BeautyStock para você largar a burocracia e focar de vez em vender e atender melhor as clientes.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 sm:gap-y-12">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="bg-white group"
                        >
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${benefit.bgColor} flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-black/5`}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-snug">{benefit.title}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed text-[0.95rem] sm:text-base">
                                {benefit.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
