import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

export default function BudgetComparisonChart({ stats }) {
    const { formatCurrency, baseCurrency } = useCurrency();

    // 1. Gather actual monthly spending per category from API breakdown
    const breakdown = stats?.category_breakdown || {};
    
    // 2. Set realistic allocated target budgets per category for mock comparison
    // If user has set a total budget, we allocate percentage limits, otherwise we use standard baselines
    const totalBudgetLimit = stats?.budget ? parseFloat(stats.budget.total_budget) : 500;
    
    const categoryBudgets = {
        'Food': totalBudgetLimit * 0.25,      // 25% allocated to food
        'Shopping': totalBudgetLimit * 0.20,  // 20% to shopping
        'Bills': totalBudgetLimit * 0.30,     // 30% to bills/rent
        'Travel': totalBudgetLimit * 0.15,    // 15% to transit
        'Entertainment': totalBudgetLimit * 0.10, // 10% to leisure
        'Other': totalBudgetLimit * 0.10
    };

    // 3. Compile data array for Recharts
    const data = Object.keys(categoryBudgets).map(cat => {
        const spent = parseFloat(breakdown[cat] || 0);
        const budget = parseFloat(categoryBudgets[cat]);
        return {
            name: cat,
            Budget: budget,
            Actual: spent,
            isOver: spent > budget
        };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-xl space-y-1">
                    <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-emerald-400">Budget: {formatCurrency(payload[0].value)}</p>
                    <p className={`text-sm font-bold ${payload[1].value > payload[0].value ? 'text-red-400' : 'text-blue-400'}`}>
                        Actual: {formatCurrency(payload[1].value)}
                    </p>
                    {payload[1].value > payload[0].value && (
                        <p className="text-[10px] text-red-400 font-medium mt-1 animate-pulse">⚠️ Exceeded by {formatCurrency(payload[1].value - payload[0].value)}!</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden h-[360px]">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-100">Budget vs. Actual Spending</h4>
                    <p className="text-xs text-slate-400">Monthly category ceiling allocations</p>
                </div>
            </div>

            <div className="w-full h-[260px] font-sans">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                        <Bar dataKey="Budget" name="Budget Cap" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
                        <Bar dataKey="Actual" name="Actual Spent" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.isOver ? '#f43f5e' : '#3b82f6'} 
                                    opacity={0.9} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
