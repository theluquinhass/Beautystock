import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Package, Users, Globe, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rateLimiter } from '../lib/rateLimiter';
import { validateForm, loginSchema } from '../lib/validation';

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

        // Rate limiting: bloqueia brute force
        if (!rateLimiter.canProceed('login')) {
            const wait = rateLimiter.getWaitTime('login');
            toast.error(`Muitas tentativas. Aguarde ${wait}s e tente novamente.`);
            return;
        }

        // Validação com Zod
        const { success, errors } = validateForm(loginSchema, { email, password });
        if (!success) {
            toast.error(errors[0]);
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            rateLimiter.reset('login');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-background lg:bg-card font-sans text-foreground selection:bg-pink-100 dark:selection:bg-pink-900 selection:text-pink-900 dark:selection:text-pink-100">
            {/* Lado Esquerdo - Desktop (Mini Landing) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-background via-card to-background p-12 xl:p-20 flex-col justify-center relative overflow-hidden border-r border-border/50">
                {/* Background Blobs (Soft) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-10"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20"></div>
                </div>

                <div className="relative z-10 max-w-lg mx-auto w-full">
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-foreground mb-4 leading-[1.15] tracking-tight">
                        Bem-vinda de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            volta!
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-medium">
                        Gestão inteligente para revendedoras de cosméticos.
                    </p>

                    <div className="space-y-6 mb-12">
                        <div className="flex items-start gap-4 transition-transform hover:translate-x-1 duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-card shadow-sm border border-border flex items-center justify-center text-primary shrink-0">
                                <Package size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-lg">Estoque inteligente</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mt-0.5">Controle de entrada, saída e lucros de forma automática.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 transition-transform hover:translate-x-1 duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-card shadow-sm border border-border flex items-center justify-center text-primary shrink-0">
                                <Users size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-lg">Controle de clientes e fiado</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mt-0.5">Saiba exatamente quem te deve e acompanhe os pagamentos.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Mockup Component */}
                <div className="mt-8 relative z-10 w-full max-w-sm mx-auto">
                    <div className="bg-card/90 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(236,72,153,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(244,114,182,0.1)] border border-border transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center shadow-inner">
                                    <span className="text-primary font-black text-sm">R$</span>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground font-bold mb-0.5 uppercase tracking-wide">Vendas Hoje</div>
                                    <div className="font-black text-foreground text-xl">R$ 485,00</div>
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
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-pink-900/30">
                        <span className="text-xl font-black text-white">B</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">
                        Beauty<span className="text-primary">Stock</span>
                    </h2>
                </div>

                <div className="w-full max-w-[420px]">
                    <div className="bg-card p-8 sm:p-10 rounded-[2.5rem] shadow-soft border border-border lg:border-none lg:shadow-none lg:p-0 w-full lg:bg-transparent">

                        {/* Desktop Logo heading */}
                        <div className="hidden lg:flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-pink-900/30">
                                <span className="text-2xl font-black text-white">B</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-foreground">
                                Beauty<span className="text-primary">Stock</span>
                            </h2>
                        </div>

                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Entrar na sua conta</h2>
                            <p className="text-muted-foreground text-sm font-medium">Bem-vinda de volta! Sentimos sua falta.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-card-foreground">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-muted border border-border text-foreground rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-muted-foreground placeholder:font-normal hover:bg-muted/80"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-card-foreground">Senha</label>
                                <input
                                    type="password"
                                    className="w-full bg-muted border border-border text-foreground rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-muted-foreground placeholder:font-normal hover:bg-muted/80"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Sua senha"
                                />
                                <div className="flex justify-end pt-1">
                                    <button 
                                        type="button" 
                                        onClick={async () => {
                                            if (!email) {
                                                toast.error('Por favor, informe seu email no campo acima para redefinir a senha.');
                                                return;
                                            }
                                            try {
                                                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                                                    redirectTo: `${window.location.origin}/reset-password`,
                                                });
                                                if (error) throw error;
                                                toast.success('Email de redefinição enviado! Verifique sua caixa de entrada.');
                                            } catch (error) {
                                                toast.error(error.message);
                                            }
                                        }}
                                        className="text-xs font-bold text-primary hover:text-primary/80 hover:underline"
                                    >
                                        Esqueci minha senha
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 bg-primary hover:bg-primary/85 text-primary-foreground rounded-2xl py-4 font-bold shadow-pink hover:-translate-y-0.5 transition-all duration-200"
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

                        <div className="mt-8 text-center text-sm font-semibold text-muted-foreground">
                            Ainda não tem conta?
                            <Link to="/signup" className="ml-1.5 font-bold text-primary hover:text-primary/80 transition-colors">
                                Comece grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
