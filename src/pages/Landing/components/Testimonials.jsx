import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const testimonials = [
        {
            name: "Juliana Santos",
            role: "Revendedora de Perfumaria",
            city: "São Paulo, SP",
            text: "Eu perdi as contas de quantas vezes vendi perfume que não tinha em estoque. Hoje, o catálogo não deixa eu passar vergonha e a Bibi ainda me avisa quando o estoque abaixa.",
            rating: 5
        },
        {
            name: "Mariana Costa",
            role: "Maquiadora e Consultora",
            city: "Belo Horizonte, MG",
            text: "O que me salvou foi o controle de fiado. Eu tinha um caderno e sempre esquecia de cobrar. Agora vejo certinho o lucro real de cada mês. Paga a mensalidade sozinho!",
            rating: 5
        },
        {
            name: "Renata Duarte",
            role: "Vendedora de Cosméticos",
            city: "Curitiba, PR",
            text: "Meus pedidos no WhatsApp ficaram extremamente profissionais. A cliente clica no link, monta o que quer e me manda tudo somado. Zero erro, muito rápido.",
            rating: 5
        }
    ];

    return (
        <section id="depoimentos" className="py-20 lg:py-28 bg-[#fdf2f8] border-b border-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Quem usa, não volta para o caderno.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-500 font-medium"
                    >
                        Histórias reais de mulheres que valorizam o próprio trabalho.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative"
                        >
                            <div className="absolute top-6 right-8 text-pink-100">
                                <Quote size={40} fill="currentColor" />
                            </div>

                            <div className="flex gap-1 mb-6 text-yellow-400">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} size={18} fill="currentColor" />
                                ))}
                            </div>

                            <p className="text-gray-700 leading-relaxed italic mb-8 flex-1">
                                "{testimonial.text}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center font-bold text-pink-600 text-lg">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-xs font-semibold text-pink-500 uppercase tracking-wide mt-0.5">{testimonial.role}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">{testimonial.city}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
