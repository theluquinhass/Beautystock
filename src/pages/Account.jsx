import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Crown, Save, Loader2, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function Account() {
    const { user, signOut } = useAuth();
    const { isPro, refreshPlan } = usePlan();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, expires_at')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    first_name: data.first_name || '',
                    last_name: data.last_name || ''
                }));

                // Add expires_at to profile state temporarily if it exists
                if (data.expires_at) {
                    setFormData(prev => ({
                        ...prev,
                        expires_at: data.expires_at
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Erro ao carregar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshPlan(); // Refresh context if needed
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Erro ao atualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        try {
            await authService.resetPasswordForEmail(user.email);
            toast.success('Email de redefinição de senha enviado!');
        } catch (error) {
            console.error('Error sending reset email:', error);
            toast.error('Erro ao enviar email de redefinição');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Erro ao sair');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-pink-500" size={32} />
            </div>
        );
    }

    return (
        <div className="pb-24 pt-4 space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-800 px-2">Minha Conta</h1>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-pink-600 mb-2">
                    <User size={24} />
                    <h2 className="text-lg font-semibold">Perfil</h2>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Nome</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Sobrenome</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                placeholder="Sobrenome"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="w-full mt-2 bg-black text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-gray-200 active:scale-[0.98]"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        Salvar Alterações
                    </button>
                </div>
            </div>

            {/* Plan Section */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3 text-pink-600">
                        <Crown size={24} />
                        <h2 className="text-lg font-semibold">Plano Atual</h2>
                    </div>

                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border",
                        isPro
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-pink-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                    )}>
                        {isPro ? 'PRO ✨' : 'FREE'}
                    </span>
                </div>

                {isPro ? (
                    <div className="flex flex-col gap-3">
                        {(() => {
                            if (!formData.expires_at) {
                                return (
                                    <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 text-pink-800 text-sm">
                                        <p>Você tem acesso a todos os recursos premium do BeautyStock! Aproveite.</p>
                                    </div>
                                );
                            }

                            const expiresDate = new Date(formData.expires_at);
                            const now = new Date();
                            const diffTime = expiresDate.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays <= 2 && diffDays >= 0) {
                                return (
                                    <div className="p-4 bg-rose-50 rounded-xl border-2 border-rose-200 shadow-sm flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                                                <Crown size={20} className="fill-rose-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-rose-800 text-sm">Atenção ao seu Plano PRO</h3>
                                                    <span className="bg-rose-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                                        Vence em {diffDays === 0 ? 'algumas horas' : `${diffDays} dia${diffDays === 1 ? '' : 's'}`}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-rose-700 font-medium">
                                                    Renove agora para continuar com recursos PRO sem interrupções.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const toastId = toast.loading('Gerando pagamento...');
                                                    const { data, error } = await supabase.functions.invoke('create-pro-renewal-preference', {
                                                        body: { userId: user.id, email: user.email }
                                                    });

                                                    if (error) throw error;

                                                    toast.dismiss(toastId);
                                                    if (data?.init_point) {
                                                        window.location.href = data.init_point;
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('Erro ao gerar renovação');
                                                }
                                            }}
                                            className="w-full bg-rose-600 text-white text-sm font-bold py-3 rounded-lg shadow-md shadow-rose-200 hover:bg-rose-700 transition-colors active:scale-[0.99] flex items-center justify-center gap-2"
                                        >
                                            <Shield size={16} />
                                            Renovar PRO por R$ 29,90
                                        </button>
                                        <p className="text-[10px] text-center text-rose-500 font-medium">
                                            Válido até: {expiresDate.toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 text-pink-800 text-sm flex flex-col gap-2">
                                    <p>Você tem acesso a todos os recursos premium do BeautyStock! Aproveite.</p>
                                    <p className="opacity-80 text-xs font-semibold">
                                        Válido até: {expiresDate.toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-gray-500 text-sm">Faça o upgrade para desbloquear recursos exclusivos, como gestão de clientes e relatórios avançados.</p>
                        <button
                            onClick={() => navigate('/upgrade')}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-[0.98]"
                        >
                            <Crown size={20} className="text-yellow-300 fill-yellow-300" />
                            Fazer Upgrade para PRO
                        </button>
                    </div>
                )}
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-gray-700 mb-1">
                    <Shield size={24} />
                    <h2 className="text-lg font-semibold">Segurança</h2>
                </div>

                <button
                    onClick={handlePasswordReset}
                    className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-medium hover:bg-gray-50 transition-colors"
                >
                    Alterar Senha
                </button>
            </div>


            {/* Support Section - PRO Only */}
            {isPro && (
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-green-600 mb-1">
                        <MessageCircle size={24} />
                        <h2 className="text-lg font-semibold">Suporte</h2>
                    </div>

                    <a
                        href={`https://wa.me/5584996590488?text=${encodeURIComponent("Olá! Estou com Problemas.. Pode me ajudar?")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-50 text-green-700 border border-green-200 rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                    >
                        <MessageCircle size={20} />
                        Falar no WhatsApp
                    </a>
                </div>
            )}

            {/* Logout Section */}
            <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 border border-red-100 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-[0.98]"
            >
                <LogOut size={20} />
                Sair da Conta
            </button>

            <p className="text-center text-xs text-gray-400 pt-4 pb-8">
                BeautyStock v1.0.0
            </p>
        </div>
    );
}
