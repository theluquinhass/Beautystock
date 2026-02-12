import CustomerForm from '../../components/Customers/CustomerForm';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function CustomerFormPage() {
    const { id } = useParams();
    const [initialData, setInitialData] = useState({});
    const [loading, setLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            fetchCustomer();
        }
    }, [id]);

    const fetchCustomer = async () => {
        const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();
        if (data) {
            setInitialData(data);
        }
        setLoading(false);
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <CustomerForm initialData={initialData} />
        </div>
    );
}
