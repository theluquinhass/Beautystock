import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Package, Users, Globe, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showBenefits, setShowBenefits] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-[#fdf2f8] lg:bg-white font-sans text-gray-800 selection:bg-pink-100 selection:text-pink-900">
            {/* Lado Esquerdo - Desktop (Mini Landing) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#fdf2f8] via-white to-[#fdf2f8] p-12 xl:p-20 flex-col justify-center relative overflow-hidden border-r border-pink-50/50">
                {/* Background Blobs (Soft) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ec4899] rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d8b4fe] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
                </div>

                <div className="relative z-10 max-w-lg mx-auto w-full">
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-900 mb-4 leading-[1.15] tracking-tight">
                        Bem-vinda de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec4899] to-[#d8b4fe]">
                            volta!
                        </span>
                    </h1>

                    <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                        Gestão inteligente para revendedoras de cosméticos.
                    </p>

                    <div className="space-y-6 mb-12">
                        <div className="flex items-start gap-4 transition-transform hover:translate-x-1 duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-pink-100 flex items-center justify-center text-[#ec4899] shrink-0">
                                <Package size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Estoque inteligente</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mt-0.5">Controle de entrada, saída e lucros de forma automática.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 transition-transform hover:translate-x-1 duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-pink-100 flex items-center justify-center text-[#ec4899] shrink-0">
                                <Users size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Controle de clientes e fiado</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mt-0.5">Saiba exatamente quem te deve e acompanhe os pagamentos.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Mockup Component */}
                <div className="mt-8 relative z-10 w-full max-w-sm mx-auto">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(236,72,153,0.15)] border border-pink-100/50 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center shadow-inner">
                                    <span className="text-[#ec4899] font-black text-sm">R$</span>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-bold mb-0.5 uppercase tracking-wide">Vendas Hoje</div>
                                    <div className="font-black text-gray-900 text-xl">R$ 485,00</div>
                                </div>
                            </div>
                            <div className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">+12%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">

                {/* Mobile Logo */}
                <div className="flex items-center justify-center lg:hidden mb-10 mt-6 gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                        <span className="text-xl font-black text-white">B</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900">
                        Beauty<span className="text-[#ec4899]">Stock</span>
                    </h2>
                </div>

                <div className="w-full max-w-[420px]">
                    <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-50 lg:border-none lg:shadow-none lg:p-0 w-full lg:bg-transparent">

                        {/* Desktop Logo heading */}
                        <div className="hidden lg:flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                                <span className="text-2xl font-black text-white">B</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                Beauty<span className="text-[#ec4899]">Stock</span>
                            </h2>
                        </div>

                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Entrar na sua conta</h2>
                            <p className="text-gray-500 text-sm font-medium">Bem-vinda de volta! Sentimos sua falta.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 placeholder:font-normal hover:bg-gray-100/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-gray-700">Senha</label>
                                    <button type="button" className="text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline">
                                        Esqueci minha senha
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 placeholder:font-normal hover:bg-gray-100/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Sua senha"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 bg-[#ec4899] hover:bg-[#db3186] text-white rounded-2xl py-4 font-bold shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processando...
                                    </span>
                                ) : 'Entrar'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-semibold text-gray-600">
                            Ainda não tem conta?
                            <Link to="/signup" className="ml-1.5 font-bold text-[#ec4899] hover:text-[#db3186] transition-colors">
                                Comece grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
