import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Eye, PieChart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import ExportButtons from './ExportButtons';

export default function MonthlyStatement() {
    const { formatCurrency } = useCurrency();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/transactions/summary?month=${selectedMonth}`);
            setSummary(res.data);
        } catch (e) {
            console.error("Failed to load preview details", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [selectedMonth]);

    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group h-[360px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-100">Monthly Statement</h4>
                    <p className="text-xs text-slate-400">Download formatted ledgers</p>
                </div>
                
                {/* Month Selector */}
                <div className="relative flex items-center">
                    <input 
                        type="month"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="bg-slate-950/80 border border-slate-800 text-slate-350 text-xs font-bold px-3 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                    <div className="w-8 h-8 border-2 border-t-emerald-400 border-r-transparent border-slate-800 rounded-full animate-spin"></div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Compiling Statement Preview...</span>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10 my-1">
                    {/* Summary Row Preview */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-850 p-3 rounded-xl">
                        <div className="text-center space-y-0.5 border-r border-slate-850">
                            <span className="text-[9px] text-slate-550 uppercase tracking-wider font-extrabold block">Inflow</span>
                            <span className="text-xs font-bold text-emerald-400">
                                {formatCurrency(summary?.total_income || 0)}
                            </span>
                        </div>
                        <div className="text-center space-y-0.5 border-r border-slate-850">
                            <span className="text-[9px] text-slate-550 uppercase tracking-wider font-extrabold block">Outflow</span>
                            <span className="text-xs font-bold text-rose-450">
                                {formatCurrency(summary?.total_expense || 0)}
                            </span>
                        </div>
                        <div className="text-center space-y-0.5">
                            <span className="text-[9px] text-slate-550 uppercase tracking-wider font-extrabold block">Net</span>
                            <span className={`text-xs font-bold ${summary?.balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                                {formatCurrency(summary?.balance || 0)}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown Mini List */}
                    <div className="space-y-2 max-h-[85px] overflow-y-auto px-1">
                        {summary?.category_breakdown && Object.keys(summary.category_breakdown).length > 0 ? (
                            Object.keys(summary.category_breakdown).map(cat => (
                                <div key={cat} className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> {cat}
                                    </span>
                                    <span className="text-slate-300">
                                        {formatCurrency(summary.category_breakdown[cat])}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-[10px] text-slate-550 py-3 font-semibold">
                                No logged expenses to categorize
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons Panel */}
            <div className="relative z-10 mt-2">
                <ExportButtons />
            </div>
        </div>
    );
}

