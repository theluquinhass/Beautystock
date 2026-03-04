import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
        { name: 'Como funciona', href: '#como-funciona' },
        { name: 'Resultados', href: '#resultados' },
        { name: 'Benefícios', href: '#beneficios' },
        { name: 'Preços', href: '#precos' },
        { name: 'Depoimentos', href: '#depoimentos' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-lg sm:text-xl font-black text-white">B</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                            Beauty<span className="text-[#ec4899]">Stock</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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
                            className="bg-[#ec4899] hover:bg-[#db2777] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Assinar PRO agora
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col gap-4 mb-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-base font-semibold text-gray-700 border-b border-gray-50 pb-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/login"
                            className="text-center bg-gray-50 text-gray-700 font-bold py-3 rounded-xl border border-gray-200"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Entrar na conta
                        </Link>
                        <a
                            href="#precos"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-center bg-[#ec4899] hover:bg-[#db2777] text-white font-bold py-3 rounded-xl shadow-md"
                        >
                            Assinar PRO agora
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
