import React, { useState } from 'react';
import { Clock, Check, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BibiInsightCard({ item, strategyDays, isInList, onToggleList }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Badge & bar por urgência
    let badge, barColor;
    if (item.days_remaining < 5) {
        badge = { label: '🔥 Crítico', cls: 'bg-destructive/10 text-destructive border-destructive/20' };
        barColor = 'bg-destructive';
    } else if (item.days_remaining <= 10) {
        badge = { label: '⚠️ Atenção', cls: 'bg-warning/10 text-warning border-warning/20' };
        barColor = 'bg-warning';
    } else {
        badge = { label: '🟡 Alerta', cls: 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 border-yellow-400/20' };
        barColor = 'bg-yellow-400';
    }

    const stockPercentage = Math.min((item.days_remaining / strategyDays) * 100, 100);

    return (
        <div className="p-4 rounded-2xl border border-border bg-card shadow-soft hover:shadow-card-hover hover:border-border-strong transition-all mb-3">

            {/* Header */}
            <div className="flex justify-between items-start mb-3 gap-2">
                <h4 className="font-bold text-foreground text-sm leading-tight flex-1 truncate">
                    {item.product_name}
                </h4>
                <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border flex-shrink-0",
                    badge.cls
                )}>
                    {badge.label}
                </span>
            </div>

            {/* Barra de estoque */}
            <div className="mb-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                    <span>Estoque: {item.stock} un</span>
                    <span>Meta: {strategyDays} dias</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-500 ease-out", barColor)}
                        style={{ width: `${stockPercentage}%` }}
                    />
                </div>
            </div>

            {/* Métricas rápidas */}
            <div className="flex items-center text-xs text-muted-foreground font-medium gap-1.5 mt-3">
                <Clock size={12} className="text-muted-foreground/60 flex-shrink-0" />
                Vende{' '}
                <span className="font-bold text-foreground">{item.avg_daily_sales.toFixed(1)}/dia</span>
                <span className="text-muted-foreground/30">•</span>
                Acaba em{' '}
                <span className="font-bold text-foreground">{Math.floor(item.days_remaining)}d</span>
            </div>

            {/* Risco financeiro */}
            {item.estimated_lost_profit > 0 && (
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                    <span className="text-destructive font-bold uppercase tracking-wide">Risco:</span>{' '}
                    Perder{' '}
                    <span className="text-destructive font-bold">
                        {item.estimated_lost_profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>{' '}
                    em lucro
                </div>
            )}

            {/* Accordion detalhes */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out overflow-hidden mt-3",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 mt-0"
            )}>
                <div className="min-h-0">
                    <div className="bg-muted/50 rounded-xl p-3 border border-border grid grid-cols-2 gap-3 mb-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Total Vendido</span>
                            <span className="text-xs font-black text-foreground">{Math.round(item.avg_daily_sales * 30)} un / 30d</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Margem unitária</span>
                            <span className="text-xs font-black text-foreground">
                                {item.margin?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-border flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
                                Cálculo de Recomendação
                            </span>
                            <span className="text-[11px] font-medium text-muted-foreground">
                                ({item.avg_daily_sales.toFixed(1)} un/dia × {strategyDays} dias) − {item.stock} estoque ={' '}
                                <span className="font-black text-success">{item.suggested_qty} un</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                {/* Btn Lista de compra */}
                <button
                    onClick={() => onToggleList(item)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border",
                        isInList
                            ? "bg-secondary/20 text-secondary-foreground border-secondary/30 dark:bg-secondary/15 dark:text-secondary dark:border-secondary/25"
                            : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-primary hover:border-primary/20"
                    )}
                >
                    {isInList ? (
                        <><Check size={14} /> Na lista ({item.suggested_qty})</>
                    ) : (
                        <><Plus size={14} /> Lista de compra ({item.suggested_qty})</>
                    )}
                </button>

                {/* Btn Detalhes */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex shrink-0 items-center justify-center py-2 px-3 rounded-xl text-xs font-bold bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-foreground transition-all"
                >
                    Detalhes
                    <ChevronDown size={14} className={cn("ml-1 transition-transform", isExpanded && "rotate-180")} />
                </button>
            </div>
        </div>
    );
}