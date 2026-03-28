import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Save, Loader2, Mail, MessageCircle, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { PaymentTab } from '../components/account/PaymentTab';
import ThemeSelector from '../components/account/ThemeSelector';

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

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', cpf: '', email: '' });

    useEffect(() => {
        if (user) { fetchProfile(); setFormData(prev => ({ ...prev, email: user.email })); }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('first_name, last_name, cpf, expires_at').eq('id', user.id).single();
            if (error) throw error;
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    cpf: data.cpf ? formatCPF(data.cpf) : '',
                    ...(data.expires_at ? { expires_at: data.expires_at } : {})
                }));
            }
        } catch { toast.error('Erro ao carregar perfil'); }
        finally { setLoading(false); }
    };

    const handleUpdateProfile = async () => {
        try {
            setSaving(true);
            const { error } = await supabase.from('profiles').update({
                first_name: formData.first_name, last_name: formData.last_name,
                cpf: formData.cpf.replace(/\D/g, ''), updated_at: new Date().toISOString()
            }).eq('id', user.id);
            if (error) throw error;
            await refreshPlan();
            toast.success('Perfil atualizado com sucesso!');
        } catch { toast.error('Erro ao atualizar perfil'); }
        finally { setSaving(false); }
    };

    const handlePasswordReset = async () => {
        try { await authService.resetPasswordForEmail(user.email); toast.success('Email de redefinição enviado!'); }
        catch { toast.error('Erro ao enviar email de redefinição'); }
    };

    const handleLogout = async () => {
        try { await signOut(); navigate('/login'); }
        catch { toast.error('Erro ao sair'); }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    const inputCls = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all placeholder:text-muted-foreground";

    const tabs = [
        { id: 'profile', label: 'Perfil e Segurança', short: 'Perfil' },
        { id: 'payment', label: 'Assinatura e Pagamento', short: 'Assinatura' },
        { id: 'appearance', label: 'Aparência', icon: Palette, short: 'Aparência' },
    ];

    return (
        <div className="pb-24 pt-4 space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-foreground px-2">Minha Conta</h1>

            {/* ── Tabs ── */}
            <div className="flex justify-between sm:justify-start gap-1 sm:gap-2 px-2 pb-2 border-b border-border w-full">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 sm:flex-none px-2 sm:px-4 py-2.5 text-[11px] sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                                activeTab === tab.id
                                    ? "bg-foreground text-background shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {Icon && <Icon size={14} className="shrink-0" />}
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.short}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Perfil ── */}
            {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Perfil */}
                    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <User size={24} />
                            <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Nome</label>
                                    <input type="text" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className={inputCls} placeholder="Seu nome" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Sobrenome</label>
                                    <input type="text" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className={inputCls} placeholder="Sobrenome" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground ml-1">CPF</label>
                                <input type="text" inputMode="numeric" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: formatCPF(e.target.value) })} className={inputCls} placeholder="000.000.000-00" maxLength={14} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input type="email" value={formData.email} readOnly className="w-full bg-muted border border-border rounded-xl pl-11 pr-4 py-3 text-muted-foreground cursor-not-allowed" />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="w-full mt-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-pink active:scale-[0.98]"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>

                    {/* Segurança */}
                    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-foreground mb-1">
                            <Shield size={24} className="text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Segurança</h2>
                        </div>
                        <button
                            onClick={handlePasswordReset}
                            className="w-full bg-card border border-border text-foreground rounded-xl py-3.5 font-medium hover:bg-muted transition-colors"
                        >
                            Alterar Senha
                        </button>
                    </div>

                    {/* Suporte — PRO */}
                    {isPro && (
                        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-1">
                                <MessageCircle size={24} className="text-success" />
                                <h2 className="text-lg font-semibold text-foreground">Suporte</h2>
                            </div>
                            <a
                                href={`https://wa.me/5584996590488?text=${encodeURIComponent("Olá! Estou com Problemas.. Pode me ajudar?")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-success/12 text-success border border-success/25 rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-success/20 hover:border-success/35 transition-all active:scale-[0.98]"
                            >
                                <MessageCircle size={20} />
                                Falar no WhatsApp
                            </a>
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-destructive/18 hover:border-destructive/30 transition-all active:scale-[0.98]"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>

                    <p className="text-center text-xs text-muted-foreground pt-4 pb-8">BeautyStock v2.0.0</p>
                </div>
            )}

            {/* ── Aparência ── */}
            {activeTab === 'appearance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ThemeSelector />
                </div>
            )}

            {/* ── Pagamento ── */}
            {activeTab === 'payment' && (
                <PaymentTab isPro={isPro} user={user} formData={formData} />
            )}
        </div>
    );
}