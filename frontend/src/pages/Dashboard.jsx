import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Plus, ArrowLeftRight, QrCode, Target, Trash2, Calendar, Settings } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Component Imports
import DashboardStats from '../components/DashboardStats';
import ExpensePieChart from '../components/ExpensePieChart';
import SmartInsights from '../components/SmartInsights';
import TransactionSearch from '../components/TransactionSearch';
import BudgetAlertBell from '../components/BudgetAlertBell';
import DarkModeToggle from '../components/DarkModeToggle';
import GuestModeBanner from '../components/GuestModeBanner';
import QuickAddModal from '../components/QuickAddModal';
import ScanPayModal from '../components/ScanPayModal';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import MonthlyStatement from '../components/MonthlyStatement';

// Custom Added Budget Widgets
import ProgressCircle from '../components/ProgressCircle';
import SetBudgetModal from '../components/SetBudgetModal';
import BudgetVsActualChart from '../components/BudgetVsActualChart';

export default function Dashboard() {
    const { user } = useAuth();
    
    // States
    const [month, setMonth] = useState(() => new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [dashboardData, setDashboardData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Modals
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [isScanPayOpen, setIsScanPayOpen] = useState(false);
    const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);

    // Sandbox Exchange Rates
    const [rates, setRates] = useState({});
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState(0);
    const currencies = useMemo(() => ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'], []);

    const handleSwap = useCallback(() => {
        setFromCurrency(prev => {
            const next = toCurrency;
            setToCurrency(prev);
            return next;
        });
    }, [toCurrency]);

    // Fetch primary stats and comparison metrics parallelly
    const fetchDashboardPayload = useCallback(async () => {
        setRefreshing(true);
        try {
            const [dashRes, chartRes] = await Promise.all([
                api.get(`/dashboard-data?month=${month}`),
                api.get(`/budget-vs-actual?month=${month}`)
            ]);
            setDashboardData(dashRes.data);
            setChartData(chartRes.data);
        } catch (error) {
            console.error("Error fetching unified dashboard dataset", error);
            toast.error("Failed to fetch fresh dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [month]);

    const fetchRates = useCallback(async () => {
        try {
            const response = await axios.get('https://open.er-api.com/v6/latest/USD');
            setRates(response.data.rates);
        } catch (error) {
            console.error("Error fetching sandbox rates", error);
        }
    }, []);

    useEffect(() => {
        fetchDashboardPayload();
    }, [fetchDashboardPayload]);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    // Converter math
    useEffect(() => {
        if (rates[fromCurrency] && rates[toCurrency]) {
            const base = amount / rates[fromCurrency];
            setConvertedAmount(base * rates[toCurrency]);
        }
    }, [amount, fromCurrency, toCurrency, rates]);

    const handleTransactionAdded = useCallback(() => {
        fetchDashboardPayload();
    }, [fetchDashboardPayload]);

    const handleDeleteTransaction = useCallback(async (id) => {
        // Optimistic UI Removal
        if (dashboardData?.recent_transactions) {
            setDashboardData(prev => ({
                ...prev,
                recent_transactions: prev.recent_transactions.filter(t => t.id !== id)
            }));
        }

        try {
            await api.delete(`/transactions/${id}`);
            toast.success("Transaction removed");
            fetchDashboardPayload(); // Sync counts & progress
        } catch (error) {
            console.error("Error deleting transaction", error);
            toast.error("Failed to delete transaction.");
            fetchDashboardPayload();
        }
    }, [dashboardData, fetchDashboardPayload]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.preferred_currency || 'USD'
        }).format(val || 0);
    };

    const transactions = useMemo(() => dashboardData?.recent_transactions || [], [dashboardData]);

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-10 bg-slate-900/50 rounded-xl w-48 border border-slate-800 animate-pulse" />
                    <div className="h-10 bg-slate-900/50 rounded-xl w-36 border border-slate-800 animate-pulse" />
                </div>
                <CardSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <TableSkeleton />
                    </div>
                    <div className="h-96 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
                </div>
            </motion.div>
        );
    }

    // Adapt budget models
    const hasBudgetSet = dashboardData?.monthly_budget > 0;
    const budgetSpentPercent = dashboardData?.budget_percentage || 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="space-y-6 pb-20 md:pb-6"
        >
            <GuestModeBanner />

            {/* Premium Custom Navigation Bar */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800/40 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
                        Financial Hub 
                        {refreshing && <RefreshCw size={18} className="animate-spin text-slate-500" />}
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">Real-time balances & expenditure thresholds for {user?.name}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Integrated Debounced Search */}
                    <div className="w-56">
                        <TransactionSearch transactions={transactions} onSelectTransaction={(item) => toast.success(`Category: ${item.category} (${formatCurrency(item.amount)})`)} />
                    </div>

                    <BudgetAlertBell />
                    <DarkModeToggle />

                    {/* Scan & Pay QR */}
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsScanPayOpen(true)} 
                        className="bg-slate-900/60 border border-slate-850 hover:bg-slate-850 text-indigo-450 hover:text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer"
                        title="Scan QR"
                    >
                        <QrCode size={18} />
                    </motion.button>

                    {/* Month selection filter */}
                    <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-850 px-3.5 py-2 rounded-xl">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <input 
                            type="month" 
                            value={month} 
                            onChange={e => setMonth(e.target.value)}
                            className="bg-transparent text-slate-200 outline-none text-xs font-bold cursor-pointer"
                        />
                    </div>

                    {/* Quick Add */}
                    <motion.button 
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsQuickAddOpen(true)} 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg font-bold cursor-pointer text-xs"
                    >
                        <Plus size={16} /> Add Transaction
                    </motion.button>
                </div>
            </div>

            {/* Numeric Indicators (Income, Expense, Net Savings) */}
            <DashboardStats stats={dashboardData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visualizations Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Budget vs Actual Spending Comparison graph */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3.5 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md"></span>
                                <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Budget vs Actual Spending</h3>
                            </div>
                            <button
                                onClick={() => setIsSetBudgetOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-bold transition-all border border-slate-800 cursor-pointer"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Set Budget Limits
                            </button>
                        </div>
                        <BudgetVsActualChart chartData={chartData} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ExpensePieChart stats={dashboardData} />
                        <SmartInsights />
                    </div>

                    {/* Recent Activities list */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md"></span>
                                <h3 className="text-xs font-bold text-slate-350 tracking-wider uppercase">Recent Activity</h3>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Top 5 Records</span>
                        </div>
                        
                        {transactions.length > 0 ? (
                            <div className="space-y-2.5 relative">
                                <AnimatePresence initial={false}>
                                    {transactions.map(t => (
                                        <motion.div 
                                            key={t.id} 
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                            className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl transition-all overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                                                    t.type === 'income' 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                                                }`}>
                                                    {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200 text-xs">{t.category}</p>
                                                    <p className="text-[10px] text-slate-550 mt-0.5">{new Date(t.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className={`font-extrabold text-xs ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                </div>
                                                <motion.button 
                                                    whileHover={{ scale: 1.1, color: '#f43f5e' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteTransaction(t.id)} 
                                                    className="text-slate-650 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-10 font-semibold text-xs border border-dashed border-slate-850 rounded-xl bg-slate-950/20">
                                No transactions yet. Click "+ Add Transaction" to add.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Widgets Column */}
                <div className="space-y-6">
                    
                    {/* Original Monthly Statement Inflow/Outflow and Export card */}
                    <MonthlyStatement />
                    
                    {/* Live Budget ceiling progress ring widget */}
                    <div className="p-6 rounded-2xl shadow-xl border bg-slate-900/40 border-slate-800 backdrop-blur-md relative overflow-hidden flex flex-col items-center">
                        <div className="w-full flex items-center justify-between border-b border-slate-800/40 pb-3 mb-5">
                            <div className="flex items-center gap-1.5">
                                <Target size={14} className="text-slate-450" />
                                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-350">Budget Spent Indicator</h3>
                            </div>
                        </div>

                        {hasBudgetSet ? (
                            <div className="flex flex-col items-center w-full space-y-5">
                                <ProgressCircle percentage={budgetSpentPercent} size={150} />
                                
                                <div className="text-center w-full bg-slate-950/50 p-3 border border-slate-850 rounded-xl">
                                    <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-500">Monthly Target Limit</span>
                                    <p className="text-base font-black text-slate-200 mt-0.5">{formatCurrency(dashboardData?.monthly_budget)}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                        Remaining: {formatCurrency(Math.max(0, dashboardData.monthly_budget - dashboardData.monthly_expense))}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4 flex flex-col items-center">
                                <Target size={32} className="text-slate-700" />
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wide">No active budget target</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[190px]">Declare a spending ceiling limit for this month to monitor consumption circles.</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsSetBudgetOpen(true)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition-all cursor-pointer"
                                >
                                    Set Monthly Budget
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {/* Consolidated Currency Exchange Converter */}
                    <div className="bg-gradient-to-br from-indigo-650 to-purple-650 backdrop-blur-md p-6 rounded-2xl shadow-xl text-white border border-indigo-500/20 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                            <h3 className="text-xs font-bold tracking-wider uppercase text-indigo-150">Converter Sandbox</h3>
                            <RefreshCw size={12} className="text-indigo-200 animate-spin-slow" />
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">Amount</label>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={e => setAmount(Number(e.target.value) || 0)}
                                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-semibold" 
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">From</label>
                                    <select 
                                        value={fromCurrency} 
                                        onChange={e => setFromCurrency(e.target.value)}
                                        className="w-full bg-slate-950/45 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium appearance-none"
                                    >
                                        {currencies.map(c => <option key={c} value={c} className="text-slate-900 font-medium">{c}</option>)}
                                    </select>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button" 
                                    onClick={handleSwap}
                                    className="p-2 mb-0.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition-all text-white shrink-0 flex items-center justify-center h-9 w-9 cursor-pointer"
                                    title="Swap"
                                >
                                    <ArrowLeftRight size={16} />
                                </motion.button>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">To</label>
                                    <select 
                                        value={toCurrency} 
                                        onChange={e => setToCurrency(e.target.value)}
                                        className="w-full bg-slate-950/45 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium appearance-none"
                                    >
                                        {currencies.map(c => <option key={c} value={c} className="text-slate-900 font-medium">{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">Converted Balance</p>
                                <p className="text-3xl font-extrabold mt-1.5 tracking-tight text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: toCurrency }).format(convertedAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals and Forms */}
            <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onTransactionAdded={handleTransactionAdded} />
            <ScanPayModal isOpen={isScanPayOpen} onClose={() => setIsScanPayOpen(false)} onPaymentCompleted={handleTransactionAdded} />
            
            <SetBudgetModal
                isOpen={isSetBudgetOpen}
                onClose={() => setIsSetBudgetOpen(false)}
                month={month}
                currentBudget={dashboardData?.monthly_budget ? {
                    total_budget: dashboardData.monthly_budget,
                    category_budgets: chartData?.budget ? chartData.categories.reduce((acc, cat, idx) => {
                        acc[cat] = chartData.budget[idx];
                        return acc;
                    }, {}) : {}
                } : null}
                onBudgetSaved={fetchDashboardPayload}
            />
        </motion.div>
    );
}
