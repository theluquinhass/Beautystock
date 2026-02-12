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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
                <label>Nome Completo</label>
                <input
                    type="text"
                    className="input h-12 text-lg"
                    placeholder="Ex: Maria Silva"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Telefone / WhatsApp</label>
                <input
                    type="tel"
                    className="input h-12 text-lg"
                    placeholder="Ex: 11999999999"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Observações</label>
                <textarea
                    className="input h-24 py-2"
                    placeholder="Ex: Gosta de perfumes doces..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary h-12 text-lg mt-4"
                disabled={loading}
            >
                {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente')}
            </button>
        </form>
    );
}
