import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function Comparison() {
    const features = [
        { name: "Controle de estoque automático", caderno: false, app: true },
        { name: "Cadastro de clientes e histórico", caderno: false, app: true },
        { name: "Lucro e prejuízo na ponta do lápis", caderno: "Muito trabalho", app: true },
        { name: "Catálogo de produtos visual", caderno: "Apenas fotos puras", app: "Link online do carrinho" },
        { name: "Cobrança de clientes devendo", caderno: "Muito desconfortável", app: "Mensagem pronta e gentil" },
        { name: "Segurança se perder a anotação", caderno: false, app: true },
        { name: "Acesso total pelo celular em segundos", caderno: false, app: true },
        { name: "Painel inteligente alertando as metas", caderno: false, app: true },
    ];

    return (
        <section id="comparativo" className="py-16 sm:py-20 md:py-24 bg-white relative">
            <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
                
                <div className="text-center mb-10 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-[2.2rem] sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]"
                    >
                        O jeito antigo <span className="text-[#ec4899]">vs.</span> BeautyStock
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.05rem] sm:text-lg text-gray-600 font-medium max-w-2xl mx-auto px-2"
                    >
                        Compare e descubra qual modelo traz mais liberdade, paz de espírito e dinheiro no seu bolso.
                    </motion.p>
                </div>

                {/* Mobile View: Vertical Cards */}
                <div className="md:hidden space-y-4">
                    {features.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-pink-100 transition-all"
                        >
                            <h3 className="font-bold text-gray-900 text-base mb-3 leading-tight">{item.name}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {/* O Caderno */}
                                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Caderno</span>
                                    {typeof item.caderno === 'boolean' ? (
                                        item.caderno ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-300" />
                                        )
                                    ) : (
                                        <span className="text-gray-500 font-bold text-xs">{item.caderno}</span>
                                    )}
                                </div>
                                {/* O Sistema */}
                                <div className="bg-pink-50/80 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1 border border-pink-100/50">
                                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wide">BeautyStock</span>
                                    {typeof item.app === 'boolean' ? (
                                        item.app ? (
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                                                <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <X className="w-5 h-5 text-red-500" strokeWidth={3} />
                                        )
                                    ) : (
                                        <span className="text-pink-600 font-black text-xs leading-tight">{item.app}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
                >
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-6 lg:p-8 text-lg font-bold text-gray-900 w-[40%] bg-white border-b border-gray-100">
                                    No dia a dia
                                </th>
                                <th className="p-6 lg:p-8 text-center text-lg font-bold text-gray-500 bg-gray-50 border-b border-gray-100 border-x border-gray-50 w-[30%]">
                                    Caderno / Planilha
                                </th>
                                <th className="p-6 lg:p-8 text-center text-xl font-black text-white bg-gradient-to-r from-pink-500 to-purple-500 border-b border-pink-600 w-[30%] shadow-md">
                                    BeautyStock
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {features.map((item, index) => (
                                <tr key={index} className="group hover:bg-pink-50/30 transition-colors">
                                    <td className="p-6 lg:p-8 text-gray-800 font-semibold bg-white group-hover:bg-transparent border-r border-gray-50">
                                        {item.name}
                                    </td>
                                    
                                    <td className="p-6 lg:p-8 text-center bg-gray-50 group-hover:bg-transparent border-r border-gray-50">
                                        {typeof item.caderno === 'boolean' ? (
                                            item.caderno ? (
                                                <Check className="w-6 h-6 text-green-500 mx-auto" />
                                            ) : (
                                                <X className="w-6 h-6 text-red-300 mx-auto" />
                                            )
                                        ) : (
                                            <span className="text-gray-500 font-medium text-sm lg:text-base">{item.caderno}</span>
                                        )}
                                    </td>
                                    
                                    <td className="p-6 lg:p-8 text-center bg-pink-50/50 group-hover:bg-pink-100/50">
                                        {typeof item.app === 'boolean' ? (
                                            item.app ? (
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-sm">
                                                    <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <X className="w-6 h-6 text-red-500 mx-auto" strokeWidth={3} />
                                            )
                                        ) : (
                                            <span className="text-pink-600 font-bold text-sm lg:text-base">{item.app}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

            </div>
        </section>
    );
}
