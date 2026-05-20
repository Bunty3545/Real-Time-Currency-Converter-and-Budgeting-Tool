import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { X, Calendar, DollarSign, Tag, Info } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function ExpensePieChart({ stats, allTransactions = [] }) {
    const { formatCurrency } = useCurrency();
    const [activeIndex, setActiveIndex] = useState(null);
    const [modalCategory, setModalCategory] = useState(null);

    // 1. Compile category breakdown dataset
    const breakdown = stats?.category_breakdown || {};
    const data = Object.keys(breakdown).map((cat, idx) => ({
        name: cat,
        value: parseFloat(breakdown[cat] || 0)
    })).filter(item => item.value > 0);

    const totalExpense = data.reduce((sum, item) => sum + item.value, 0);

    // 2. Handle slice clicking
    const handlePieClick = (data, index) => {
        setModalCategory(data.name);
    };

    // Filter transactions belonging to selected category
    const categoryTransactions = allTransactions.filter(
        t => t.category.toLowerCase() === modalCategory?.toLowerCase() && t.type === 'expense'
    );

    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden h-[360px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-1 mb-2">
                <h4 className="text-lg font-bold text-slate-100">Expense Breakdown</h4>
                <p className="text-xs text-slate-400">Interact with slices to view details</p>
            </div>

            <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
                {data.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    onClick={handlePieClick}
                                    cursor="pointer"
                                    animationDuration={600}
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            className="transition-all duration-300 hover:opacity-80 outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => [formatCurrency(value), 'Spent']}
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Balance Display */}
                        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Spent</span>
                            <span className="text-xl font-extrabold text-slate-100 mt-0.5">
                                {formatCurrency(totalExpense)}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                        <Info size={28} className="text-slate-650" />
                        No expenses logged this month.
                    </div>
                )}
            </div>

            {/* Labels Indicators footer */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2 max-h-[60px] overflow-y-auto">
                {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer" onClick={() => setModalCategory(entry.name)}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-slate-400">{entry.name}</span>
                        <span className="text-slate-500">({Math.round((entry.value / totalExpense) * 100)}%)</span>
                    </div>
                ))}
            </div>

            {/* Slice Breakdown Transactions Modal */}
            {modalCategory && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                <h3 className="text-lg font-bold text-slate-100">{modalCategory} Spending</h3>
                            </div>
                            <button onClick={() => setModalCategory(null)} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-5 max-h-[300px] overflow-y-auto space-y-3.5">
                            {categoryTransactions.length > 0 ? (
                                categoryTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center bg-slate-950/40 border border-slate-850 p-3 rounded-xl hover:border-slate-800 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                                <Tag size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-semibold text-slate-300 block">{t.note || 'No notes'}</span>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <Calendar size={10} />
                                                    <span>{t.transaction_date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-extrabold text-rose-400">
                                            -{formatCurrency(t.amount, t.currency)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-slate-500">
                                    No logged {modalCategory} records detected this period.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400 px-5">
                            <span>Aggregate {modalCategory} spent</span>
                            <span className="text-sm text-slate-200">{formatCurrency(categoryTransactions.reduce((s,t) => s + parseFloat(t.amount), 0))}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
