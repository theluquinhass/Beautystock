import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-lg flex items-center justify-center">
                            <span className="text-lg font-black text-white">B</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900">
                            Beauty<span className="text-[#ec4899]">Stock</span>
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                        <Link to="/termos" className="text-sm font-semibold text-gray-500 hover:text-[#ec4899] transition-colors">Termos de Uso</Link>
                        <Link to="/privacidade" className="text-sm font-semibold text-gray-500 hover:text-[#ec4899] transition-colors">Políticas de Privacidade</Link>
                        <a href="https://wa.me/5584996590488" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-500 hover:text-[#ec4899] transition-colors">Suporte</a>
                        <a href="https://www.instagram.com/beautystockapp/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-500 hover:text-[#ec4899] transition-colors">Instagram</a>
                    </div>

                    <div>
                        <Link
                            to="/login"
                            className="text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-2.5 rounded-xl transition-all"
                        >
                            Acessar conta
                        </Link>
                    </div>

                </div>

                <div className="text-center pt-8 border-t border-gray-50">
                    <p className="text-sm text-gray-400 font-medium">
                        &copy; {currentYear} BeautyStock. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Feito para revolucionar as vendas das revendedoras.
                    </p>
                </div>

            </div>
        </footer>
    );
}
