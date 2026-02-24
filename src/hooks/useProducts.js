import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import toast from 'react-hot-toast';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productService.getAll();
            setProducts(data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err);
            toast.error('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id) => {
        try {
            await productService.delete(id);
            setProducts(current => current.filter(p => p.id !== id));
            toast.success('Produto excluído');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Erro ao excluir produto');
            return false;
        }
    }, []);

    const createProduct = useCallback(async (data) => {
        try {
            const newProduct = await productService.create(data);
            setProducts(current => [...current, newProduct]);
            toast.success('Produto criado');
            return newProduct;
        } catch (err) {
            console.error(err);
            toast.error('Erro ao criar produto');
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        error,
        refresh: fetchProducts,
        deleteProduct,
        createProduct
    };
}
