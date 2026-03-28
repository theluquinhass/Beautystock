import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rateLimiter } from '../lib/rateLimiter';
import { validateForm, signupSchema } from '../lib/validation';

// Formata CPF visualmente: 123.456.789-00
function formatCPF(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [cpf, setCpf] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Rate limiting: bloqueia abuso de cadastro
        if (!rateLimiter.canProceed('signup')) {
            const wait = rateLimiter.getWaitTime('signup');
            toast.error(`Muitas tentativas de cadastro. Aguarde ${wait}s.`);
            return;
        }

        setLoading(true);

        try {
            if (!email || !password || !firstName || !lastName || !cpf || !confirmPassword) {
                throw new Error('Preencha todos os campos obrigatórios.');
            }

            const cleanCPF = cpf.replace(/\D/g, '');
            if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) {
                throw new Error('CPF inválido. Verifique e tente novamente.');
            }

            // Validação Zod (email + senha forte: 8+ chars, maiúscula, número)
            const { success, errors } = validateForm(signupSchema, {
                name: `${firstName} ${lastName}`,
                email,
                password,
            });
            if (!success) {
                throw new Error(errors[0]);
            }

            if (password !== confirmPassword) {
                throw new Error('As senhas não coincidem.');
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'https://beautystockapp.com',
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        cpf: cpf.replace(/\D/g, ''),
                    }
                }
            });

            if (error) throw error;

            rateLimiter.reset('signup');
            setShowSuccess(true);
            toast.success('Cadastro realizado com sucesso!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-6 font-sans">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md text-center border border-pink-50">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#ec4899]">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Verifique seu email</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Enviamos um link de confirmação para <strong className="text-gray-800">{email}</strong>.
                        Por favor, verifique sua caixa de entrada para ativar sua conta e começar.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3.5 px-4 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8] font-sans selection:bg-pink-100 selection:text-pink-900 px-4">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-50">
                <div className="flex items-center justify-center mb-8 gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                        <span className="text-xl font-black text-white">B</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900">
                        Beauty<span className="text-[#ec4899]">Stock</span>
                    </h2>
                </div>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Criar sua conta</h2>
                    <p className="text-gray-500 text-sm font-medium">Preencha os dados abaixo para começar grátis.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Nome</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 focus:bg-white hover:bg-gray-100/50"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Sobrenome</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 focus:bg-white hover:bg-gray-100/50"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                placeholder="Seu sobrenome"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">CPF</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 focus:bg-white hover:bg-gray-100/50"
                            value={cpf}
                            onChange={(e) => setCpf(formatCPF(e.target.value))}
                            required
                            maxLength={14}
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 focus:bg-white hover:bg-gray-100/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 focus:bg-white hover:bg-gray-100/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Confirmar Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 focus:bg-white hover:bg-gray-100/50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Repita a senha"
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
                        ) : 'Criar conta e começar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-semibold text-gray-600">
                    Já tem uma conta?
                    <Link to="/login" className="ml-1.5 font-bold text-[#ec4899] hover:text-[#db3186] transition-colors">
                        Fazer login
                    </Link>
                </div>
            </div>
        </div>
    );
}
