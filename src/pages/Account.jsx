import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Save, Loader2, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { PaymentTab } from '../components/account/PaymentTab';

// Formata CPF visualmente: 123.456.789-00
function formatCPF(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function Account() {
    const { user, signOut } = useAuth();
    const { isPro, refreshPlan } = usePlan();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payment'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        cpf: '',
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
                .select('first_name, last_name, cpf, expires_at')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    cpf: data.cpf ? formatCPF(data.cpf) : ''
                }));

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
                    cpf: formData.cpf.replace(/\D/g, ''),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshPlan();
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

            {/* Tabs Navigation */}
            <div className="flex gap-2 px-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap",
                        activeTab === 'profile' 
                            ? "bg-gray-900 text-white shadow-md shadow-gray-200" 
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                >
                    Perfil e Segurança
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap",
                        activeTab === 'payment' 
                            ? "bg-gray-900 text-white shadow-md shadow-gray-200" 
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                >
                    Assinatura e Pagamento
                </button>
            </div>

            {/* Content Based on Tab selected */}
            {activeTab === 'profile' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                <label className="text-xs font-medium text-gray-500 ml-1">CPF</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                />
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
            ) : (
                <PaymentTab 
                    isPro={isPro} 
                    user={user} 
                    formData={formData} 
                />
            )}
        </div>
    );
}
