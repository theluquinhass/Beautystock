import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function CustomerForm({ initialData = {} }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: '',
        ...initialData
    });

    const isEditing = !!initialData.id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (isEditing) {
                const { error } = await supabase
                    .from('customers')
                    .update(formData)
                    .eq('id', initialData.id);
                if (error) throw error;
                toast.success('Cliente atualizado!');
            } else {
                const { error } = await supabase
                    .from('customers')
                    .insert({ ...formData, user_id: user.id });
                if (error) throw error;
                toast.success('Cliente cadastrado!');
            }
            navigate('/clientes');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-6">
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
        </form>
    );
}
