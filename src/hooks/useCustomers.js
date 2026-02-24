import { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customer.service';
import toast from 'react-hot-toast';

export function useCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err);
            toast.error('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCustomer = useCallback(async (id) => {
        try {
            await customerService.delete(id);
            setCustomers(current => current.filter(c => c.id !== id));
            toast.success('Cliente excluído');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Erro ao excluir cliente');
            return false;
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return {
        customers,
        loading,
        error,
        refresh: fetchCustomers,
        deleteCustomer
    };
}
