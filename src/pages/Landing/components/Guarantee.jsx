import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Handshake, CreditCard, LockKeyhole } from 'lucide-react';

export default function Guarantee() {
    const guarantees = [
        {
            icon: RefreshCcw,
            title: "Comece de graça",
            desc: "Use as funções básicas sem pagar nada e faça o upgrade só quando precisar."
        },
        {
            icon: Handshake,
            title: "Cancele em 1 clique",
            desc: "Sem pegadinhas ou botões escondidos. A qualquer momento."
        },
        {
            icon: LockKeyhole,
            title: "Sem contrato",
            desc: "Você não fica presa a nós se não estiver tendo lucro."
        },
        {
            icon: CreditCard,
            title: "Pagamento seguro",
            desc: "Transações seguras geridas por plataformas oficiais."
        }
    ];

    return (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {guarantees.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                                <item.icon size={20} className="text-[#ec4899]" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-[15px]">{item.title}</h4>
                                <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
