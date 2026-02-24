import { useState, useEffect, useCallback } from 'react';
import { movementService } from '../services/movement.service';
import toast from 'react-hot-toast';

export function useMovements() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMovements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await movementService.getAll();
            setMovements(data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err);
            toast.error('Erro ao carregar movimentações');
        } finally {
            setLoading(false);
        }
    }, []);

    const createMovement = useCallback(async (data) => {
        try {
            const newMovement = await movementService.create(data);
            // Optimistic update or refresh? Refresh ensures consistency with triggers
            await fetchMovements();
            toast.success('Movimentação registrada');
            return newMovement;
        } catch (err) {
            console.error(err);
            toast.error('Erro ao registrar movimentação');
            throw err;
        }
    }, [fetchMovements]);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    return {
        movements,
        loading,
        error,
        refresh: fetchMovements,
        createMovement
    };
}
