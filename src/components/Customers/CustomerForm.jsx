import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Camera, X, Trash } from 'lucide-react';
import { uploadCustomerPhoto, getPublicCustomerPhotoUrl } from '../../lib/customerPhotos';
import { usePlan } from '../../hooks/usePlan';
import { canAddCustomer } from '../../lib/planUtils';
import UpgradeModal from '../UpgradeModal';

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
    const [imagePreview, setImagePreview] = useState(initialData.photo_path ? getPublicCustomerPhotoUrl(initialData.photo_path) : null);
    const [currentPhotoPath, setCurrentPhotoPath] = useState(initialData.photo_path || null);

    const isEditing = !!initialData.id;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setCurrentPhotoPath(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditing && !canAddCustomer(profile, usage.customersCount)) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!isEditing) {
                const { count } = await supabase
                    .from('customers')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (!canAddCustomer(profile, count)) {
                    setLoading(false);
                    setShowUpgradeModal(true);
                    return;
                }
            }

            if (isEditing) {
                let customerId = initialData.id;

                const { error } = await supabase
                    .from('customers')
                    .update(formData)
                    .eq('id', customerId);
                if (error) throw error;

                if (imageFile) {
                    try {
                        const uploadedPath = await uploadCustomerPhoto(imageFile, user.id, customerId);
                        await supabase.from('customers').update({ photo_path: uploadedPath }).eq('id', customerId);
                    } catch (imgErr) {
                        toast.error('Erro ao enviar foto.');
                    }
                } else if (currentPhotoPath === null) {
                    await supabase.from('customers').update({ photo_path: null }).eq('id', customerId);
                }

                toast.success('Cliente atualizado!');
                navigate(`/clientes/${customerId}`);
            } else {
                const { data: newCustomer, error } = await supabase
                    .from('customers')
                    .insert({ ...formData, user_id: user.id })
                    .select()
                    .single();
                if (error) throw error;

                let customerId = newCustomer.id;

                if (imageFile) {
                    try {
                        const uploadedPath = await uploadCustomerPhoto(imageFile, user.id, customerId);
                        await supabase.from('customers').update({ photo_path: uploadedPath }).eq('id', customerId);
                    } catch (imgErr) {
                        toast.error('Erro ao enviar foto.');
                    }
                }

                toast.success('Cliente cadastrado!');
                navigate('/clientes');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este cliente? Histórico associado pode impedir a exclusão em caso de faturas abertas.')) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('customers').delete().eq('id', initialData.id);
            if (error) throw error;

            toast.success('Cliente excluído com sucesso!');
            navigate('/clientes');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir. O cliente pode ter movimentações registradas que impedem a exclusão direta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-6">

            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="relative group">
                    {imagePreview ? (
                        <>
                            <img
                                src={imagePreview}
                                alt="Avatar do Cliente"
                                className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-pink-100"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-100 hover:scale-110 hover:bg-red-50 transition-all z-10"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        </>
                    ) : (
                        <label className="w-24 h-24 flex flex-col items-center justify-center bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600 rounded-full cursor-pointer transition-colors shadow-inner border-2 border-dashed border-pink-200 hover:border-pink-300">
                            <Camera size={28} className="mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Foto</span>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-3 font-medium">JPG, PNG ou WEBP até 2MB</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                            placeholder="Ex: Maria Silva"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                        <input
                            type="tel"
                            className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                            placeholder="Ex: 11999999999"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Observações</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all min-h-[100px]"
                            placeholder="Ex: Gosta de perfumes doces..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-gray-200 hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente')}
            </button>

            {isEditing && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full bg-white text-red-500 font-bold py-4 rounded-2xl shadow-sm border border-red-100 hover:bg-red-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Excluindo...' : (
                        <>
                            <Trash size={20} />
                            Excluir Cliente
                        </>
                    )}
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
