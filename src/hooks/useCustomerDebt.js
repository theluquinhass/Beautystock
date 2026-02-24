import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useCustomerDebt() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalReceivables, setTotalReceivables] = useState(0);

    const fetchDebtors = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // PARALLEL FETCH for performance
            const [
                { data: customersData },
                { data: creditMovements },
                { data: payments }
            ] = await Promise.all([
                supabase.from('customers').select('*').eq('user_id', user.id),
                supabase.from('movements').select('customer_id, quantity, unit_price').eq('user_id', user.id).eq('is_on_credit', true),
                supabase.from('payments').select('customer_id, amount').eq('user_id', user.id)
            ]);

            // Calculate Debt per Customer
            const customersWithDebt = customersData?.map(c => {
                const customerCredits = creditMovements?.filter(m => m.customer_id === c.id) || [];
                const customerPayments = payments?.filter(p => p.customer_id === c.id) || [];

                const totalCredit = customerCredits.reduce((acc, curr) => acc + (curr.quantity * (curr.unit_price || 0)), 0);
                const totalPaid = customerPayments.reduce((acc, curr) => acc + curr.amount, 0);
                const debt = totalCredit - totalPaid;

                return { ...c, debt };
            }) || [];

            // Sort by Debt DESC (Biggest debtors first)
            customersWithDebt.sort((a, b) => b.debt - a.debt);

            // Calculate Total Receivables
            const total = customersWithDebt.reduce((acc, c) => acc + (c.debt > 0 ? c.debt : 0), 0);
            setTotalReceivables(total);

            setCustomers(customersWithDebt);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDebtors();
    }, [fetchDebtors]);

    return {
        customers,
        loading,
        totalReceivables,
        refresh: fetchDebtors
    };
}
