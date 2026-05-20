import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

export default function Budgets() {
    const { user } = useAuth();
    const [budget, setBudget] = useState(null);
    const [month, setMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7)); // YYYY-MM
    const [totalBudget, setTotalBudget] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBudget();
    }, [month]);

    const fetchBudget = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await api.get(`/budgets/month/${month}`);
            setBudget(response.data);
            setTotalBudget(response.data.total_budget);
        } catch (err) {
            if (err.response?.status === 404) {
                // No budget set for this month yet
                setBudget(null);
                setTotalBudget('');
            } else {
                console.error("Error fetching budget", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await api.post('/budgets', {
                month,
                total_budget: parseFloat(totalBudget)
            });
            setBudget(response.data);
            setSuccess('Budget updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update budget');
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.preferred_currency || 'USD' }).format(val || 0);
    };

    const spentPercent = budget ? Math.min(Math.round((budget.spent_amount / budget.total_budget) * 100), 100) : 0;
    const isExceeded = budget && parseFloat(budget.spent_amount) > parseFloat(budget.total_budget);

    // Dynamic savings suggestions based on budget status
    const getSuggestions = () => {
        if (!budget) return ["Set a budget for this month to receive smart savings suggestions."];
        const ratio = budget.spent_amount / budget.total_budget;
        
        if (ratio === 0) {
            return ["Excellent start! Plan your purchases ahead to stick to your brand new budget."];
        } else if (ratio > 1) {
            return [
                "⚠️ Warning: You've exceeded your budget! Consider deferring all non-essential shopping.",
                "Review your 'Bills' and 'Entertainment' categories to spot hidden monthly subscription drains.",
                "Try doing a 'no-spend weekend' to reset your spending balance."
            ];
        } else if (ratio > 0.85) {
            return [
                "Careful! You've used over 85% of your budget. Move to defensive spending for the rest of the month.",
                "Cook meals at home this week; 'Food' is typically the easiest category to cut back on dynamically."
            ];
        } else if (ratio > 0.5) {
            return [
                "You're halfway through your budget. Keep close tabs on your impulse transactions.",
                "Use the 'Currency Converter' widget to evaluate if ordering items in alternative currencies saves money."
            ];
        } else {
            return [
                "Great job! You're pacing well under budget. Consider routing the excess directly to savings.",
                "Keep tracking every minor bill so you have perfect analytics by the month's end."
            ];
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Budget Planner</h1>
                <p className="text-slate-400 text-sm">Define and monitor your target thresholds</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to Set/Update Budget */}
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 space-y-6 h-fit shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-md shadow-rose-500/10"></span>
                            <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/10"></span>
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/10"></span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase">Set Target</h3>
                    </div>

                    <form onSubmit={handleSaveBudget} className="space-y-4">
                        {error && <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3 rounded-xl text-sm">{error}</div>}
                        {success && <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3 rounded-xl text-sm flex items-center gap-2 font-medium"><CheckCircle size={16} />{success}</div>}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Month</label>
                            <input type="month" required value={month} onChange={e => setMonth(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Budget Amount</label>
                            <input type="number" step="0.01" required value={totalBudget} onChange={e => setTotalBudget(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                placeholder="0.00" />
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
                            Save Target Budget
                        </button>
                    </form>
                </div>

                {/* Progress Details */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 text-center text-slate-500 font-medium shadow-lg">Loading details...</div>
                    ) : budget ? (
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 space-y-6 shadow-lg relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-md shadow-rose-500/10"></span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/10"></span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/10"></span>
                                </div>
                                <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase">Progress Status</h3>
                            </div>
                            <div className="flex justify-between items-start flex-wrap gap-4 pt-2">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-200">Budget Progress ({month})</h3>
                                    <p className="text-sm text-slate-400 mt-1">Status of your designated spending limit</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Target</span>
                                    <h4 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">{formatCurrency(budget.total_budget)}</h4>
                                </div>
                            </div>

                            {/* Alert for exceeding */}
                            {isExceeded && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                                    <AlertTriangle size={24} className="shrink-0" />
                                    <div>
                                        <h5 className="font-bold">Over Budget!</h5>
                                        <p className="text-xs text-rose-400/90 mt-0.5">You've exceeded your designated monthly budget by {formatCurrency(budget.spent_amount - budget.total_budget)}!</p>
                                    </div>
                                </div>
                            )}

                            {/* Budget Progress Bar */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-semibold text-slate-300">
                                    <span>Spent: {formatCurrency(budget.spent_amount)}</span>
                                    <span>{spentPercent}% Used</span>
                                </div>
                                <div className="w-full bg-slate-950/60 border border-slate-800 h-4.5 rounded-full overflow-hidden p-0.5">
                                    <div className={`h-full rounded-full transition-all duration-700 shadow-inner ${
                                        isExceeded 
                                        ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-500/20' 
                                        : spentPercent > 85 
                                        ? 'bg-gradient-to-r from-orange-400 to-amber-600 shadow-orange-500/10' 
                                        : spentPercent > 50 
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500' 
                                        : 'bg-gradient-to-r from-emerald-400 to-green-500'
                                    }`} style={{ width: `${spentPercent}%` }}></div>
                                </div>

                                <div className="flex justify-between text-xs font-medium text-slate-400">
                                    <span>Remaining: {formatCurrency(Math.max(budget.total_budget - budget.spent_amount, 0))}</span>
                                    <span>Target cap: {formatCurrency(budget.total_budget)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/10 border border-dashed border-slate-850 p-12 rounded-2xl text-center space-y-4">
                            <Target size={48} className="text-slate-600 mx-auto" />
                            <h3 className="text-lg font-bold text-slate-300">No Budget Target Set</h3>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto">Define a monthly budget limit on the left to activate active progress alerts and smart spending advice.</p>
                        </div>
                    )}

                    {/* Savings Suggestions Panel */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-md shadow-rose-500/10"></span>
                                <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/10"></span>
                                <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/10"></span>
                            </div>
                            <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase">Financial Insights</h3>
                        </div>

                        <div className="space-y-3">
                            {getSuggestions().map((sug, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-md shadow-amber-500/20"></div>
                                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{sug}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
