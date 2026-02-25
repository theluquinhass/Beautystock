import { supabase } from '../../lib/supabase';
import { subDays, formatISO } from 'date-fns';

export async function fetchInventoryData(userId) {
    const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            price,
            cost,
            variations(id, name, stock_quantity)
        `)
        .eq('user_id', userId);

    if (productsError) throw productsError;
    return productsData;
}

export async function fetchSalesData(userId, startDate, endDate) {
    const query = supabase
        .from('movements')
        .select('variation_id, quantity')
        .eq('user_id', userId)
        .eq('type', 'EXIT')
        .gte('date', formatISO(startDate));

    if (endDate) {
        query.lt('date', formatISO(endDate));
    }

    const { data: movementsData, error: movementsError } = await query;

    if (movementsError) throw movementsError;

    const salesPerVariation = {};
    movementsData.forEach(m => {
        if (!salesPerVariation[m.variation_id]) {
            salesPerVariation[m.variation_id] = 0;
        }
        salesPerVariation[m.variation_id] += m.quantity;
    });

    return salesPerVariation;
}


export async function generateBibiInsights(userId, periodDays = 30, strategyDays = 30) {
    const now = new Date();
    const periodStart = subDays(now, periodDays);
    const previousPeriodStart = subDays(now, periodDays * 2);

    const [productsData, currentSales, previousSales] = await Promise.all([
        fetchInventoryData(userId),
        fetchSalesData(userId, periodStart, now),
        fetchSalesData(userId, previousPeriodStart, periodStart)
    ]);

    const restockAlerts = [];
    const deadStockAlerts = [];
    let topProducts = [];

    const summary = {
        checkedPeriod: periodDays,
        criticalRiskCount: 0,
        moderateRiskCount: 0,
        totalLostProfitRisk: 0,
        deadStockCount: 0
    };

    productsData.forEach(product => {
        const price = product.price || 0;
        const cost = product.cost || 0;
        const margin = price - cost;

        product.variations?.forEach(variation => {
            const stock = variation.stock_quantity || 0;
            const currentPeriodSold = currentSales[variation.id] || 0;
            const previousPeriodSold = previousSales[variation.id] || 0;

            const variantName = variation.name !== 'Padrão' ? ` - ${variation.name}` : '';
            const fullName = `${product.name}${variantName}`;

            const avgDailySales = currentPeriodSold / periodDays;

            // ============================
            // TENDÊNCIA E CAMPEÕES
            // ============================
            let trend = 0;
            if (previousPeriodSold > 0) {
                trend = ((currentPeriodSold - previousPeriodSold) / previousPeriodSold) * 100;
            } else if (currentPeriodSold > 0) {
                trend = 100; // Cresceu do 0
            }

            const profitGenerated = currentPeriodSold * margin;

            if (currentPeriodSold > 0) {
                topProducts.push({
                    id: variation.id,
                    product_name: fullName,
                    trend,
                    profitGenerated,
                    currentPeriodSold,
                    previousPeriodSold
                });
            }

            // ============================
            // REPOSIÇÃO E LUCRO EM RISCO
            // ============================
            let daysRemaining = Infinity;
            if (avgDailySales > 0) {
                daysRemaining = stock / avgDailySales;

                const recommendedQty = Math.ceil((avgDailySales * strategyDays) - stock);

                if (recommendedQty > 0) {
                    const estimatedLostProfit = margin * avgDailySales * (strategyDays - daysRemaining);
                    const riskValue = estimatedLostProfit > 0 ? estimatedLostProfit : 0;

                    if (daysRemaining < 7) {
                        summary.criticalRiskCount++;
                        summary.totalLostProfitRisk += riskValue;
                    } else if (daysRemaining <= 15) {
                        summary.moderateRiskCount++;
                        summary.totalLostProfitRisk += riskValue;
                    } else if (daysRemaining < strategyDays) {
                        summary.totalLostProfitRisk += riskValue;
                    }

                    restockAlerts.push({
                        id: variation.id,
                        product_name: fullName,
                        stock,
                        avg_daily_sales: avgDailySales,
                        days_remaining: daysRemaining,
                        suggested_qty: recommendedQty,
                        estimated_lost_profit: riskValue,
                        margin
                    });
                }
            } else if (stock === 0) {
                // Out of stock with 0 recent sales - skip suggestions? Or alert critical
            }

            // ============================
            // PRODUTOS PARADOS
            // ============================
            // Critério: Estoque > 20 e Vendas nos últimos 30 dias < 3
            if (stock > 20 && currentPeriodSold < 3) {
                summary.deadStockCount++;
                deadStockAlerts.push({
                    id: variation.id,
                    product_name: fullName,
                    stock,
                    total_sold_period: currentPeriodSold,
                    status: 'no_sales'
                });
            }
        });
    });

    // Sort Top Products based on profit 
    topProducts.sort((a, b) => b.profitGenerated - a.profitGenerated);

    return {
        summary,
        restockAlerts,
        deadStockAlerts,
        topProducts: topProducts.slice(0, 10)
    };
}

export function sortRestockAlerts(alerts, sortBy) {
    return [...alerts].sort((a, b) => {
        if (sortBy === 'acaba_mais_rapido') {
            return a.days_remaining - b.days_remaining;
        }
        if (sortBy === 'maior_risco') {
            return b.estimated_lost_profit - a.estimated_lost_profit;
        }
        if (sortBy === 'mais_vendido') {
            return b.avg_daily_sales - a.avg_daily_sales;
        }
        return 0; // Default
    });
}

// FORMATTERS
export const generateBuyListText = (shoppingList) => {
    if (!shoppingList || shoppingList.length === 0) return "Sua lista de compras está vazia!";

    let text = "🛍️ *Lista de Reposição - BeautyStock*\n\n";
    shoppingList.forEach(item => {
        text += `• ${item.product_name} → ${item.suggested_qty} un\n`;
    });

    text += "\nGerada por Bibi Inteligente ✨";
    return text;
};

export const exportToCSV = (alerts) => {
    if (!alerts || alerts.length === 0) return;

    const headers = ['Produto', 'Estoque Atual', 'Dias Restantes', 'Sugestao Compra', 'Lucro em Risco (R$)'];

    const rows = alerts.map(item => [
        `"${item.product_name.replace(/"/g, '""')}"`,
        item.stock,
        item.days_remaining === Infinity ? 'Infinito' : Math.floor(item.days_remaining),
        item.suggested_qty,
        item.estimated_lost_profit.toFixed(2)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lista-compras-bibi-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
