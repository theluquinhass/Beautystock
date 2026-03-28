import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const questions = [
        {
            q: "Funciona bem no celular?",
            a: "Sim, 100% adaptado. Você não precisa baixar aplicativo pesado que trava o celular. O sistema funciona direto no navegador do seu smartphone com tela rápida e leve."
        },
        {
            q: "Preciso instalar alguma coisa?",
            a: "Nada. É totalmente online. Basta acessar o site com seu e-mail e senha, seja do celular, tablet ou computador as informações estarão lá sincronizadas."
        },
        {
            q: "Posso usar para vender pelo WhatsApp?",
            a: "É perfeito para isso! Você compartilha o link do seu Catálogo Online, a cliente monta o carrinho e o pedido chega pronto e detalhado no seu WhatsApp, já calculando o total."
        },
        {
            q: "Serve para a minha loja?",
            a: "Nós fomos criados exclusivamente para revendedoras de perfumes, maquiagens, cosméticos, roupas e linha bebê. Se você atende no 'um a um', o BeautyStock é perfeito para você."
        },
        {
            q: "Como o sistema ajuda a diminuir o fiado perdido?",
            a: "Ele te mostra exatamente quem está devendo, qual o valor e a data que deveria pagar. Com um clique, ele gera uma mensagem educada de cobrança pronta para você colar direto na conversa com a cliente."
        },
        {
            q: "Consigo cadastrar produtos com foto?",
            a: "Sim! No plano PRO você pode adicionar fotos dos seus produtos, descrições perfeitas e organizar tudo por marca ou categoria, deixando seu catálogo com cara de perfumaria fina."
        }
    ];

    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-16 sm:py-20 md:py-24 bg-white relative">
            <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
                
                <div className="text-center mb-12 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-[2.2rem] sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        Tire suas dúvidas
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.05rem] sm:text-lg text-gray-600 font-medium px-2"
                    >
                        Ainda insegura? Nós esclarecemos rapidamente.
                    </motion.p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {questions.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-[#fdf2f8]/50 border border-pink-100 rounded-2xl sm:rounded-[1.5rem] md:rounded-3xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleQuestion(index)}
                                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-2xl md:rounded-3xl"
                                aria-expanded={openIndex === index}
                            >
                                <span className="text-[1.05rem] sm:text-lg font-bold text-gray-900 pr-4 sm:pr-8 leading-snug">{item.q}</span>
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                    {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-600 font-medium leading-relaxed text-[0.95rem] sm:text-base">
                                            {item.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
