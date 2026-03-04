import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            q: "Precisa instalar algum app no celular?",
            a: "Não! O BeautyStock funciona direto no navegador do seu celular (ou computador). Mas você também pode adicionar o atalho na tela inicial e ele funciona exatamente como um app, rápido e sem ocupar memória."
        },
        {
            q: "O catálogo tem link para eu enviar no Instagram e WhatsApp?",
            a: "Sim. Você terá um link exclusivo (ex: beautystock.app/c/seu-nome). Você pode colocar na bio do Instagram e enviar para suas clientes conversarem direto no WhatsApp já com os pedidos."
        },
        {
            q: "O pedido chega como no WhatsApp?",
            a: "O pedido chega formatado em texto para você. Mostra o nome da cliente, os itens escolhidos, a quantidade, o total da compra e descontos. Tudo somado automaticamente."
        },
        {
            q: "O sistema impede vender sem estoque?",
            a: "Sim! Se você tiver 2 perfumes no estoque, a cliente não conseguirá pedir 3 no seu catálogo. Assim você nunca mais passa vergonha de vender algo que não tem."
        },
        {
            q: "Posso controlar quem compra fiado?",
            a: "No plano PRO, você tem controle total. Você cadastra suas clientes, lança a venda como 'A Receber' e o BeautyStock te avisa quando está perto de vencer e o valor total que a cliente te deve."

        },
        {
            q: "Posso cancelar quando quiser?",
            a: "Com certeza. Não temos fidelidade. Você assina o PRO, usa enquanto fizer sentido para o seu negócio e, se quiser cancelar, resolve em 1 clique nas configurações."
        },
        {
            q: "Tem suporte em caso de dúvidas?",
            a: "Sim. O plano PRO dá acesso ao suporte prioritário para te ajudar em tudo o que for preciso com sua conta."
        }
    ];

    return (
        <section id="faq" className="py-20 lg:py-28 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Perguntas Frequentes
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-500 font-medium"
                    >
                        Tire suas dúvidas antes de começar.
                    </motion.p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:border-pink-50 transition-colors"
                        >
                            <button
                                className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
                                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                                aria-expanded={index === openIndex}
                            >
                                <span className="text-base sm:text-lg font-bold pr-4">{faq.q}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${index === openIndex ? 'bg-pink-100 text-[#ec4899]' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                    {index === openIndex ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {index === openIndex && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-gray-600 leading-relaxed font-medium text-sm sm:text-base">
                                            {faq.a}
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
