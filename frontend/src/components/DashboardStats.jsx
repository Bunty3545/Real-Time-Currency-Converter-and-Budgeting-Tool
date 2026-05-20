import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const AnimatedCounter = ({ value, prefix = "", suffix = "", duration = 800 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const endValue = parseFloat(value) || 0;
        if (endValue === 0) {
            setCount(0);
            return;
        }

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(progress * endValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [value, duration]);

    return (
        <span>
            {prefix}
            {count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {suffix}
        </span>
    );
};

export default function DashboardStats({ stats }) {
    const { formatCurrency, baseCurrency } = useCurrency();
    
    const balance = stats?.balance || 0;
    const income = stats?.total_income || 0;
    const expense = stats?.total_expense || 0;
    
    // Calculate Budget Used %
    const budgetLimit = stats?.budget ? parseFloat(stats.budget.total_budget) : 0;
    const budgetPercent = budgetLimit > 0 ? Math.round((expense / budgetLimit) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Net Balance Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-1 hover:border-blue-500/20 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                        <Wallet size={20} />
                    </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-100 mb-2 font-sans relative z-10">
                    <AnimatedCounter value={balance} prefix={`${baseCurrency === 'INR' ? '₹' : baseCurrency === 'EUR' ? '€' : '$'} `} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold relative z-10 text-emerald-400">
                    <TrendingUp size={14} />
                    <span>Active tracking enabled</span>
                </div>
            </div>

            {/* Income Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-1 hover:border-emerald-500/20 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monthly Income</span>
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                        <ArrowDownRight size={20} />
                    </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-100 mb-2 font-sans relative z-10">
                    <AnimatedCounter value={income} prefix={`${baseCurrency === 'INR' ? '₹' : baseCurrency === 'EUR' ? '€' : '$'} `} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold relative z-10 text-emerald-400">
                    <TrendingUp size={14} />
                    <span>Inflows this month</span>
                </div>
            </div>

            {/* Expense Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-1 hover:border-rose-500/20 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monthly Expenses</span>
                    <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-center justify-center">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-100 mb-2 font-sans relative z-10">
                    <AnimatedCounter value={expense} prefix={`${baseCurrency === 'INR' ? '₹' : baseCurrency === 'EUR' ? '€' : '$'} `} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold relative z-10 text-rose-400">
                    <TrendingDown size={14} />
                    <span>Outflows this month</span>
                </div>
            </div>

            {/* Budget Used % Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-1 hover:border-purple-500/20 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Budget Spent %</span>
                    <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                        <Percent size={20} />
                    </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-100 mb-2 font-sans relative z-10">
                    <span>{budgetPercent}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold relative z-10">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden p-0.5 border border-slate-700/60 mt-1">
                        <div className={`h-full rounded-full transition-all duration-700 ${
                            budgetPercent > 100 
                            ? 'bg-red-500 animate-pulse' 
                            : budgetPercent > 85 
                            ? 'bg-orange-500' 
                            : budgetPercent > 50 
                            ? 'bg-yellow-500' 
                            : 'bg-emerald-500'
                        }`} style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
