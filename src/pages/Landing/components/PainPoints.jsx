import React from 'react';
import { motion } from 'framer-motion';
import { NotebookPen, Wallet, MessageCircleWarning, TrendingDown } from 'lucide-react';

export default function PainPoints() {
    const painPoints = [
        {
            icon: <NotebookPen className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />,
            title: "Tudo anotado no caderno",
            desc: "Você passa horas apagando, passando a limpo, e no final nunca sabe o que tem no estoque real."
        },
        {
            icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />,
            title: "Dinheiro perdido no fiado",
            desc: "Tem vergonha de cobrar e não lembra exatamente quem está devendo ou quando deveriam pagar."
        },
        {
            icon: <MessageCircleWarning className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />,
            title: "Atendimento bagunçado",
            desc: "Manda dezenas de fotos soltas no WhatsApp e perde vendas porque a cliente desiste na confusão."
        },
        {
            icon: <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />,
            title: "Sem visão do lucro real",
            desc: "Vende bastante, mas no fim do mês não sabe para onde o dinheiro foi nem se de fato lucrou."
        }
    ];

    return (
        <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-[13px] sm:text-sm font-bold mb-4 sm:mb-6 border border-pink-100 shadow-sm"
                    >
                        Essa é sua realidade hoje?
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        Você trabalha muito, mas <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">não vê a cor do dinheiro.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[1.05rem] sm:text-lg text-gray-600 leading-relaxed font-medium px-2 sm:px-0"
                    >
                        Tentar organizar uma revenda de beleza na base do improviso gera ansiedade, perda financeira e estagna o seu crescimento.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-[#fdf2f8]/50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-pink-100/50 hover:bg-pink-50/80 transition-colors"
                        >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-pink-100 flex items-center justify-center mb-5 sm:mb-6">
                                {point.icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{point.title}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed text-[0.95rem] sm:text-base">
                                {point.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
