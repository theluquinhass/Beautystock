import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, Quote } from 'lucide-react';

export default function Testimonials() {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const testimonials = [
        {
            name: "Juliana Santos",
            role: "Revendedora de Perfumaria",
            city: "São Paulo, SP",
            image: "/testimonials/testim-1.jpg",
            highlight: "Não passo mais vergonha vendendo produto sem estoque.",
            text: "Eu controlava no caderno e vivia me perdendo. Hoje o sistema me salva das falhas no estoque e minhas clientes acham o máximo comprar online.",
            rating: 5,
            gradient: "from-pink-400 to-rose-400"
        },
        {
            name: "Mariana Costa",
            role: "Consultora de Beleza",
            city: "Belo Horizonte, MG",
            image: "/testimonials/testim-2.png",
            highlight: "Hoje eu vejo certinho o lucro real de cada mês.",
            text: "O controle do fiado me salvou. Antes esquecia de cobrar e ficava no prejuízo. Agora vejo quem deve e cobro com um clique no WhatsApp. O que recuperei já pagou o sistema!",
            rating: 5,
            gradient: "from-purple-400 to-fuchsia-400",
            featured: true
        },
        {
            name: "Renata Duarte",
            role: "Especialista em Make",
            city: "Curitiba, PR",
            image: "/testimonials/testim-3.png",
            highlight: "Meus pedidos no WhatsApp ficaram extremamente profissionais.",
            text: "Antes eu perdia horas mandando foto via chat. Agora envio o link da vitrine, a cliente escolhe tudo e o pedido chega pronto. Ganhei tempo e credibilidade.",
            rating: 5,
            gradient: "from-pink-500 to-purple-500"
        }
    ];

    return (
        <section id="depoimentos" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-white to-[#fdf2f8] relative overflow-hidden">
            {/* Elementos de fundo para profundidade */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[5%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-pink-100/50 rounded-full blur-[80px] sm:blur-[120px]"></div>
                <div className="absolute bottom-[10%] -left-[10%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-purple-100/40 rounded-full blur-[80px] sm:blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-pink-50 text-pink-600 font-bold mb-6 border border-pink-100/60 shadow-sm"
                    >
                        <BadgeCheck size={16} />
                        <span className="text-[13px] sm:text-sm tracking-wide uppercase">Sucesso Comprovado</span>
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 mb-6 tracking-tight leading-[1.1] sm:leading-[1.15]"
                    >
                        Depois que a loja organiza, <br className="hidden sm:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                            a confiança muda.
                        </span>
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[1.05rem] sm:text-lg md:text-xl text-gray-600 font-medium px-2 max-w-2xl mx-auto leading-relaxed"
                    >
                        Histórias reais de mulheres que trocaram o estresse do caderno pelo profissionalismo que o próprio negócio merece.
                    </motion.p>
                </div>

                {/* Dica de Swipe para Mobile */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="xl:hidden flex items-center justify-center gap-1.5 mb-6 text-gray-400 font-bold text-[12px] uppercase tracking-wide"
                >
                    <span className="text-pink-400 animate-pulse">←</span> Arraste para o lado <span className="text-pink-400 animate-pulse">→</span>
                </motion.div>

                {/* Mobile Carousel & Desktop Grid */}
                <div 
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`flex xl:grid overflow-x-auto xl:overflow-visible snap-x snap-mandatory xl:snap-none pb-8 xl:pb-0 -mx-5 px-5 lg:mx-0 lg:px-0 grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 hide-scrollbar items-stretch ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-pointer'}`}
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className={`w-[84vw] shrink-0 sm:w-auto sm:min-w-[60vw] md:min-w-[45vw] xl:min-w-0 snap-center relative group flex flex-col pt-8 xl:pt-0 ${
                                testimonial.featured ? 'xl:-translate-y-4' : ''
                            }`}
                        >
                            <div className={`flex-1 flex flex-col bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 sm:px-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.08)] border transition-all duration-500 relative z-10 ${
                                testimonial.featured ? 'border-pink-200' : 'border-gray-100 hover:border-pink-100'
                            }`}>
                                
                                {/* Decorator Quote */}
                                <div className={`absolute -top-5 right-8 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${testimonial.gradient} transform rotate-3 group-hover:-rotate-3 transition-transform duration-300`}>
                                    <Quote size={20} fill="currentColor" />
                                </div>

                                {/* Avaliação e Selo */}
                                <div className="flex items-center justify-between gap-2 mb-6">
                                    <div className="flex gap-1 text-yellow-400">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} fill="currentColor" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <BadgeCheck size={14} className="text-green-500" />
                                        Cliente Real
                                    </div>
                                </div>

                                {/* Frase de Impacto */}
                                <h3 className="text-[1.05rem] sm:text-[1.35rem] font-bold text-gray-900 mb-3 sm:mb-4 leading-snug tracking-tight">
                                    "{testimonial.highlight}"
                                </h3>

                                {/* Texto Completo */}
                                <p className="text-gray-600 leading-relaxed mb-8 flex-1 text-[0.95rem] sm:text-[1.05rem]">
                                    {testimonial.text}
                                </p>

                                {/* Perfil (Autor) */}
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-100/80 mt-auto">
                                    {testimonial.image ? (
                                        <img src={testimonial.image} alt={testimonial.name} className={`w-14 h-14 shrink-0 rounded-full object-cover shadow-md transform group-hover:scale-110 transition-transform duration-300 ring-2 ring-white`} />
                                    ) : (
                                        <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-black text-white text-xl shadow-md bg-gradient-to-br ${testimonial.gradient} transform group-hover:scale-110 transition-transform duration-300 ring-2 ring-white`}>
                                            {testimonial.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-[1.1rem] leading-tight mb-1">{testimonial.name}</h4>
                                        <p className="text-[12px] sm:text-[13px] font-bold text-[#ec4899] leading-tight">{testimonial.role}</p>
                                        <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium leading-tight mt-0.5">{testimonial.city}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Global style for hiding scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </section>
    );
}
