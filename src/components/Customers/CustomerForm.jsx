import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Camera, X, Trash, Loader2 } from 'lucide-react';
import { uploadCustomerPhoto, getPublicCustomerPhotoUrl } from '../../lib/customerPhotos';
import { usePlan } from '../../hooks/usePlan';
import { canAddCustomer } from '../../lib/planUtils';
import UpgradeModal from '../UpgradeModal';
import { validateForm, customerSchema } from '../../lib/validation';

export default function CustomerForm({ initialData = {} }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        phone: initialData.phone || '',
        notes: initialData.notes || ''
    });

    const { profile, usage, limits } = usePlan();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        initialData.photo_path ? getPublicCustomerPhotoUrl(initialData.photo_path) : null
    );
    const [currentPhotoPath, setCurrentPhotoPath] = useState(initialData.photo_path || null);

    const isEditing = !!initialData.id;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 2MB'); return; }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); setCurrentPhotoPath(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success, errors, data: validatedData } = validateForm(customerSchema, formData);
        if (!success) { toast.error(errors[0]); return; }
        if (!isEditing && !canAddCustomer(profile, usage.customersCount)) { setShowUpgradeModal(true); return; }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!isEditing) {
                const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                if (!canAddCustomer(profile, count)) { setLoading(false); setShowUpgradeModal(true); return; }
            }

            if (isEditing) {
                const customerId = initialData.id;
                const { error } = await supabase.from('customers').update(validatedData).eq('id', customerId);
                if (error) throw error;
                if (imageFile) {
                    try {
                        const uploadedPath = await uploadCustomerPhoto(imageFile, user.id, customerId);
                        await supabase.from('customers').update({ photo_path: uploadedPath }).eq('id', customerId);
                    } catch { toast.error('Erro ao enviar foto.'); }
                } else if (currentPhotoPath === null) {
                    await supabase.from('customers').update({ photo_path: null }).eq('id', customerId);
                }
                toast.success('Cliente atualizado!');
                navigate(`/clientes/${customerId}`);
            } else {
                const { data: newCustomer, error } = await supabase.from('customers').insert({ ...validatedData, user_id: user.id }).select().single();
                if (error) throw error;
                if (imageFile) {
                    try {
                        const uploadedPath = await uploadCustomerPhoto(imageFile, user.id, newCustomer.id);
                        await supabase.from('customers').update({ photo_path: uploadedPath }).eq('id', newCustomer.id);
                    } catch { toast.error('Erro ao enviar foto.'); }
                }
                toast.success('Cliente cadastrado!');
                navigate('/clientes');
            }
        } catch (error) {
            toast.error('Erro ao salvar cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('customers').delete().eq('id', initialData.id);
            if (error) throw error;
            toast.success('Cliente excluído com sucesso!');
            navigate('/clientes');
        } catch {
            toast.error('Erro ao excluir. O cliente pode ter movimentações registradas.');
        } finally {
            setLoading(false);
        }
    };

    /* ── shared classes ── */
    const inputCls = "w-full p-3 bg-input-bg border border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:bg-card focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none text-sm";
    const labelCls = "text-sm font-medium text-muted-foreground";

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-6">

            {/* ── Avatar ── */}
            <div className="flex flex-col items-center justify-center bg-card p-6 rounded-2xl shadow-soft border border-border">
                <div className="relative group">
                    {imagePreview ? (
                        <>
                            <img
                                src={imagePreview}
                                alt="Avatar do Cliente"
                                className="w-24 h-24 rounded-full object-cover shadow-soft border-2 border-border ring-2 ring-primary/20"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-1 -right-1 bg-card text-destructive rounded-full p-1 shadow-soft border border-border hover:scale-110 hover:bg-destructive/10 transition-all z-10"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        </>
                    ) : (
                        <label className="w-24 h-24 flex flex-col items-center justify-center bg-accent text-primary hover:bg-primary/15 rounded-full cursor-pointer transition-colors border-2 border-dashed border-primary/30 hover:border-primary/50">
                            <Camera size={28} className="mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Foto</span>
                            <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-3 font-medium">JPG, PNG ou WEBP até 2MB</p>
            </div>

            {/* ── Campos ── */}
            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className={labelCls}>Nome Completo</label>
                        <input
                            type="text" className={inputCls}
                            placeholder="Ex: Maria Silva"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Telefone / WhatsApp</label>
                        <input
                            type="tel" className={inputCls}
                            placeholder="Ex: 11999999999"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Observações</label>
                        <textarea
                            className={inputCls + " min-h-[100px] resize-none"}
                            placeholder="Ex: Gosta de perfumes doces..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* ── Submit ── */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-pink hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading
                    ? <><Loader2 size={20} className="animate-spin" /> Salvando...</>
                    : (isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente')
                }
            </button>

            {/* ── Delete (só no modo edição) ── */}
            {isEditing && (
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-card text-destructive font-bold py-4 rounded-2xl shadow-soft border border-destructive/20 hover:bg-destructive/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading
                        ? <><Loader2 size={20} className="animate-spin" /> Excluindo...</>
                        : <><Trash size={20} /> Excluir Cliente</>
                    }
                </button>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitText={`${limits?.customers || 15} clientes`}
                featureName="clientes"
            />
        </form>
    );
}