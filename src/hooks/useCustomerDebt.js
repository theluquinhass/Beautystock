import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useCustomerDebt() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalReceivables, setTotalReceivables] = useState(0);
    const [predictedProfit, setPredictedProfit] = useState(0);

    const fetchDebtors = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // PARALLEL FETCH for performance
            const [
                { data: customersData },
                { data: creditMovements },
                { data: payments },
                { data: products }
            ] = await Promise.all([
                supabase.from('customers').select('*').eq('user_id', user.id),
                supabase.from('movements').select('customer_id, quantity, unit_price, variation_id, date').eq('user_id', user.id).eq('is_on_credit', true).eq('type', 'EXIT'),
                supabase.from('payments').select('customer_id, amount').eq('user_id', user.id),
                supabase.from('products').select('id, cost, variations(id)').eq('user_id', user.id)
            ]);

            // Build lookup same way as useDashboard: find product that has matching variation
            // (mirrors: products?.find(p => p.variations?.some(v => v.id === m.variation_id)))
            const getProductCost = (variationId) => {
                const product = products?.find(p => p.variations?.some(v => v.id === variationId));
                return product?.cost || 0;
            };

            // Calculate Debt per Customer + Predicted Profit
            // Strategy: sort each customer's credit movements newest-first,
            // accumulate sales until we cover their debt — those are the unpaid ones.
            const customersWithDebt = customersData?.map(c => {
                const customerCredits = (creditMovements?.filter(m => m.customer_id === c.id) || [])
                    .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

                const customerPayments = payments?.filter(p => p.customer_id === c.id) || [];

                const totalCredit = customerCredits.reduce((acc, m) => acc + (m.quantity * (m.unit_price || 0)), 0);
                const totalPaid = customerPayments.reduce((acc, p) => acc + p.amount, 0);
                const debt = totalCredit - totalPaid;

                // Walk movements newest→oldest, accumulating until debt is covered.
                // Only count profit from those genuinely unpaid movements.
                let remaining = Math.max(0, debt);
                let openProfit = 0;
                for (const m of customerCredits) {
                    if (remaining <= 0) break;
                    const saleValue = m.quantity * (m.unit_price || 0);
                    const saleCost = m.quantity * getProductCost(m.variation_id);
                    const saleProfit = saleValue - saleCost;
                    const fraction = Math.min(1, remaining / saleValue);
                    openProfit += saleProfit * fraction;
                    remaining -= saleValue;
                }

                return { ...c, debt, _openProfit: openProfit };
            }) || [];

            // Sort by Debt DESC (Biggest debtors first)
            customersWithDebt.sort((a, b) => b.debt - a.debt);

            // Calculate Total Receivables
            const total = customersWithDebt.reduce((acc, c) => acc + (c.debt > 0 ? c.debt : 0), 0);
            setTotalReceivables(total);

            // Sum predicted profit only for customers with open debt
            const calculatedPredictedProfit = customersWithDebt
                .filter(c => c.debt > 0)
                .reduce((acc, c) => acc + c._openProfit, 0);

            setPredictedProfit(Math.max(0, calculatedPredictedProfit));

            // Strip internal fields before storing
            customersWithDebt.forEach(c => delete c._openProfit);

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
        predictedProfit,
        refresh: fetchDebtors
    };
}
