import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Award, TrendingDown, PieChart as ChartIcon, FileText as StatementIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import MonthlyStatement from './MonthlyStatement';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

export default function Reports() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'statements'
    const [summary, setSummary] = useState(null);
    const [month, setMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchReports();
        }
    }, [month, activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transactions/summary', {
                params: { month }
            });
            setSummary(response.data);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.preferred_currency || 'USD' }).format(val || 0);
    };

    const categoryData = summary?.category_breakdown 
        ? Object.entries(summary.category_breakdown).map(([name, value]) => ({ name, value }))
        : [];

    const barChartData = [
        {
            name: month,
            Income: summary?.total_income || 0,
            Expense: summary?.total_expense || 0
        }
    ];

    const netSavings = summary ? (summary.total_income - summary.total_expense) : 0;
    const savingsRate = summary && summary.total_income > 0 
        ? Math.round((netSavings / summary.total_income) * 100) 
        : 0;

    return (
        <div className="space-y-6">
            {/* Tabbed Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Reports & Ledger Audits</h1>
                    <p className="text-slate-400 text-sm mt-0.5 font-medium">Deep visual reporting and export solutions</p>
                </div>
                
                <div className="flex bg-slate-900/60 border border-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === 'analytics'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <ChartIcon className="w-4 h-4" />
                        Analytics Charts
                    </button>
                    <button
                        onClick={() => setActiveTab('statements')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === 'statements'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <StatementIcon className="w-4 h-4" />
                        Statement Downloads
                    </button>
                </div>
            </div>

            {activeTab === 'statements' ? (
                <MonthlyStatement />
            ) : loading ? (
                <div className="p-16 text-center text-slate-500 font-semibold animate-pulse">Generating analytical charts...</div>
            ) : (
                <div className="space-y-6">
                    {/* Month Filter */}
                    <div className="flex justify-end">
                        <input 
                            type="month" 
                            value={month} 
                            onChange={e => setMonth(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                        />
                    </div>

                    {/* Top Insight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Savings Rate */}
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
                                <h3 className="text-3xl font-bold text-slate-100 tracking-tight mt-1">{savingsRate}%</h3>
                                <p className="text-xs text-slate-500 mt-1 font-medium font-semibold">Income percentage routed to savings</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        {/* Net Savings */}
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Savings</span>
                                <h3 className={`text-3xl font-bold mt-1 tracking-tight ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                    {formatCurrency(netSavings)}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 font-semibold">Monthly income minus expenditures</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Award size={24} />
                            </div>
                        </div>

                        {/* Expense Ratio */}
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg flex items-center justify-between md:col-span-2 lg:col-span-1">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Ratio</span>
                                <h3 className="text-3xl font-bold text-slate-100 tracking-tight mt-1">
                                    {summary?.total_income > 0 ? Math.round((summary.total_expense / summary.total_income) * 100) : 0}%
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 font-medium font-semibold">Percentage of income spent</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450">
                                <TrendingDown size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Income vs Expenses Bar Chart */}
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                                </div>
                                <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase">Income vs Expense</h3>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                            itemStyle={{ color: '#f1f5f9' }}
                                            formatter={(value) => formatCurrency(value)} 
                                        />
                                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                        <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Pie Chart */}
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                                </div>
                                <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase">Category Allocation</h3>
                            </div>
                            <div className="h-72">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                                itemStyle={{ color: '#f1f5f9' }}
                                                formatter={(value) => formatCurrency(value)} 
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500 font-medium">No transactions mapped this month.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
