import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // Validações
                if (!email || !password || !firstName || !lastName || !confirmPassword) {
                    throw new Error('Preencha todos os campos obrigatórios.');
                }

                if (password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres.');
                }

                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                        }
                    }
                });

                if (error) throw error;

                setShowSuccess(true);
                toast.success('Cadastro realizado com sucesso!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="login-page">
                <div className="card text-center" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-4">Verifique seu email</h2>
                    <p className="text-gray-600 mb-6">
                        Enviamos um link de confirmação para <strong>{email}</strong>.
                        Por favor, verifique sua caixa de entrada para ativar sua conta.
                    </p>
                    <button
                        onClick={() => {
                            setIsSignUp(false);
                            setShowSuccess(false);
                            setPassword('');
                            setConfirmPassword('');
                        }}
                        className="btn btn-outline w-full"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="card" style={{ width: '100%', maxWidth: isSignUp ? '450px' : '400px' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    {isSignUp ? 'Criar Nova Conta' : 'Bem-vindo ao BeautyStock'}
                </h2>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    {isSignUp && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    className="input w-full rounded-2xl"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required={isSignUp}
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                                <input
                                    type="text"
                                    className="input w-full rounded-2xl"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required={isSignUp}
                                    placeholder="Sobrenome"
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="input w-full rounded-2xl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            className="input w-full rounded-2xl"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder={isSignUp ? "Mínimo 6 caracteres" : "Sua senha"}
                        />
                    </div>

                    {isSignUp && (
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                            <input
                                type="password"
                                className="input w-full rounded-2xl"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required={isSignUp}
                                placeholder="Repita a senha"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-2 rounded-2xl py-3 font-semibold shadow-md hover:shadow-lg transition-all"
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
                        ) : (isSignUp ? 'Criar Conta Grátis' : 'Entrar na Plataforma')}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    {isSignUp ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setShowSuccess(false);
                            setEmail('');
                            setPassword('');
                            setFirstName('');
                            setLastName('');
                            setConfirmPassword('');
                        }}
                        className="font-semibold text-pink-600 hover:text-pink-700 hover:underline bg-transparent border-0 cursor-pointer p-0"
                    >
                        {isSignUp ? 'Fazer Login' : 'Cadastre-se Grátis'}
                    </button>
                </p>
            </div>
        </div>
    );
}
