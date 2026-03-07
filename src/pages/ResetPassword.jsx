import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Verifica se há uma sessão de recuperação ativa
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error('Link de recuperação inválido ou expirado.');
                navigate('/login');
            }
        });
    }, [navigate]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('Senha atualizada com sucesso!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-[#fdf2f8] font-sans text-gray-800 items-center justify-center p-6">
            <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-50">
                <div className="flex items-center justify-center mb-8 gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ec4899] to-[#d8b4fe] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                        <span className="text-xl font-black text-white">B</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900">
                        Beauty<span className="text-[#ec4899]">Stock</span>
                    </h2>
                </div>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Nova Senha</h2>
                    <p className="text-gray-500 text-sm font-medium">Digite sua nova senha abaixo.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Nova Senha</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium placeholder:text-gray-400 placeholder:font-normal hover:bg-gray-100/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Mínimo de 6 caracteres"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 bg-[#ec4899] hover:bg-[#db3186] text-white rounded-2xl py-4 font-bold shadow-[0_4px_14px_0_rgba(236,72,153,0.39)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.23)] hover:-translate-y-0.5 transition-all duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
