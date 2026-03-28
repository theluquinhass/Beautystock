import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Benefícios', href: '#beneficios' },
        { name: 'Funcionalidades', href: '#funcionalidades' },
        { name: 'Comparativo', href: '#comparativo' },
        { name: 'Preços', href: '#precos' },
        { name: 'Depoimentos', href: '#depoimentos' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100 py-3 sm:py-4' : 'bg-transparent py-4 sm:py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center relative z-50">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-[0.7rem] flex items-center justify-center shadow-md">
                            <span className="text-xl font-black text-white">B</span>
                        </div>
                        <span className="text-[1.35rem] sm:text-2xl font-black tracking-tight text-gray-900">
                            Beauty<span className="text-[#ec4899]">Stock</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6 lg:gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-semibold text-gray-600 hover:text-[#ec4899] transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-[#ec4899] transition-colors">
                            Entrar
                        </Link>
                        <a
                            href="#precos"
                            className="bg-[#ec4899] hover:bg-[#db2777] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Assinar PRO agora
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors bg-white/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100 pt-20 pb-8 px-5 flex flex-col gap-6"
                    >
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-[1.1rem] font-bold text-gray-800 py-3.5 border-b border-gray-100/50 active:text-[#ec4899] transition-colors pl-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                        <div className="flex flex-col gap-3 pt-2">
                            <Link
                                to="/login"
                                className="text-center bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold py-4 rounded-[1.25rem] border border-gray-200/60 shadow-sm transition-colors text-[1.05rem]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Entrar na conta
                            </Link>
                            <a
                                href="#precos"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-center bg-[#ec4899] hover:bg-[#db2777] text-white font-bold py-4 rounded-[1.25rem] shadow-[0_8px_25px_-8px_rgba(236,72,153,0.6)] text-[1.05rem] transition-all"
                            >
                                Assinar PRO agora
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
