import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

export default function YearlyTrendChart({ stats, onYearChange }) {
    const { formatCurrency } = useCurrency();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 1. Gather yearly trends dataset from dashboard API payload
    const trendsData = stats?.yearly_trends || [
        { month: 'Jan', income: 0, expense: 0 },
        { month: 'Feb', income: 0, expense: 0 },
        { month: 'Mar', income: 0, expense: 0 },
        { month: 'Apr', income: 0, expense: 0 },
        { month: 'May', income: 0, expense: 0 },
        { month: 'Jun', income: 0, expense: 0 },
        { month: 'Jul', income: 0, expense: 0 },
        { month: 'Aug', income: 0, expense: 0 },
        { month: 'Sep', income: 0, expense: 0 },
        { month: 'Oct', income: 0, expense: 0 },
        { month: 'Nov', income: 0, expense: 0 },
        { month: 'Dec', income: 0, expense: 0 }
    ];

    const handleYearSelect = (e) => {
        const year = parseInt(e.target.value);
        setSelectedYear(year);
        if (onYearChange) {
            onYearChange(year);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-xl space-y-1">
                    <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">{label} {selectedYear}</p>
                    <p className="text-sm font-semibold text-emerald-400">Income: {formatCurrency(payload[0].value)}</p>
                    <p className="text-sm font-semibold text-rose-400">Expense: {formatCurrency(payload[1].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden h-[360px]">
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-100">Cash Flow Trends</h4>
                    <p className="text-xs text-slate-400">MoM inflows vs outflows</p>
                </div>
                
                {/* Custom Styled Select Dropdown */}
                <div className="relative">
                    <select 
                        value={selectedYear} 
                        onChange={handleYearSelect}
                        className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer appearance-none pr-8"
                    >
                        <option value="2024" className="text-slate-900">FY 2024</option>
                        <option value="2025" className="text-slate-900">FY 2025</option>
                        <option value="2026" className="text-slate-900">FY 2026</option>
                    </select>
                    {/* Caret icon indicator */}
                    <div className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500 pointer-events-none text-[8px] font-bold">▼</div>
                </div>
            </div>

            <div className="w-full h-[260px] font-sans">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                        <Line 
                            type="monotone" 
                            dataKey="income" 
                            name="Income" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            activeDot={{ r: 6 }} 
                            dot={{ r: 2 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="expense" 
                            name="Expense" 
                            stroke="#ef4444" 
                            strokeWidth={3} 
                            activeDot={{ r: 6 }} 
                            dot={{ r: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
