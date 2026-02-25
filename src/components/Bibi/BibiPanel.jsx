import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../hooks/usePlan';
import toast from 'react-hot-toast';
import { generateBibiInsights, sortRestockAlerts } from './bibiUtils';

import BibiPanelMobile from './BibiPanelMobile';
import BibiPanelDesktop from './BibiPanelDesktop';

export default function BibiPanel({ isOpen, onClose }) {
    const { user } = useAuth();
    const { isPro } = usePlan();

    // UI State
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('resumo'); // 'resumo' | 'restock' | 'dead_stock' | 'top_products'

    // Filter State
    const [periodDays, setPeriodDays] = useState(30);
    const [strategyDays, setStrategyDays] = useState(30);
    const [sortBy, setSortBy] = useState('acaba_mais_rapido');

    // Data State
    const [insights, setInsights] = useState({
        summary: null,
        restockAlerts: [],
        deadStockAlerts: [],
        topProducts: []
    });

    // Lifted state from BibiRestock
    const [shoppingList, setShoppingList] = useState([]);

    useEffect(() => {
        if (isOpen && user) {
            fetchInsights();
        }
    }, [isOpen, user, periodDays, strategyDays]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const data = await generateBibiInsights(user.id, periodDays, strategyDays);
            setInsights(data);
        } catch (error) {
            console.error('Error fetching Bibi insights:', error);
            toast.error('Erro ao calcular tendências de estoque.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleList = (item) => {
        const index = shoppingList.findIndex(i => i.id === item.id);
        if (index >= 0) {
            setShoppingList(prev => prev.filter(i => i.id !== item.id));
        } else {
            setShoppingList(prev => [...prev, item]);
        }
    };

    if (!isOpen) return null;

    const sortedRestockAlerts = sortRestockAlerts(insights.restockAlerts, sortBy);

    const commonProps = {
        isOpen,
        onClose,
        isPro,
        loading,
        activeTab,
        setActiveTab,
        periodDays, setPeriodDays,
        strategyDays, setStrategyDays,
        sortBy, setSortBy,
        insights,
        sortedRestockAlerts,
        shoppingList,
        toggleList: handleToggleList
    };

    return (
        <>
            <BibiPanelMobile {...commonProps} />
            <BibiPanelDesktop {...commonProps} />
        </>
    );
}

