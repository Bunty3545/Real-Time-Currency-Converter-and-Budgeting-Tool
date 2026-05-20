import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../services/api';
import AddTransactionModal from '../components/AddTransactionModal';
import { Plus, Trash2, Filter, CreditCard, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Transactions() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search query to prevent massive database queries on every keystroke (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Reference container for virtual list
    const parentRef = useRef(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (typeFilter) params.type = typeFilter;
            if (categoryFilter) params.category = categoryFilter;
            if (monthFilter) params.month = monthFilter;

            const response = await api.get('/transactions', { params });
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions", error);
            toast.error("Failed to sync transactions");
        } finally {
            setLoading(false);
        }
    }, [typeFilter, categoryFilter, monthFilter]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Local memoized search filtering to keep rendering instantaneous
    const filteredTransactions = useMemo(() => {
        if (!debouncedSearch) return transactions;
        const query = debouncedSearch.toLowerCase();
        return transactions.filter(t => 
            t.category.toLowerCase().includes(query) || 
            (t.note && t.note.toLowerCase().includes(query)) ||
            t.amount.toString().includes(query)
        );
    }, [transactions, debouncedSearch]);

    // Initialize virtual list layout engine
    const rowVirtualizer = useVirtualizer({
        count: filteredTransactions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 76, // height of styled row card in pixels
        overscan: 5,
    });

    const handleDelete = useCallback(async (id) => {
        // Fast Optimistic Update to UI
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast.success("Removing transaction...", { id: 'delete-progress' });

        try {
            await api.delete(`/transactions/${id}`);
            toast.success("Transaction deleted successfully", { id: 'delete-progress' });
            fetchTransactions();
        } catch (error) {
            console.error("Error deleting transaction", error);
            toast.error("Failed to delete transaction");
            fetchTransactions(); // Rollback if API fails
        }
    }, [fetchTransactions]);

    const formatCurrency = useCallback((val, currency) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: currency || user?.preferred_currency || 'USD' 
        }).format(val);
    }, [user]);

    const categories = useMemo(() => ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Investments', 'Other'], []);

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Transactions</h1>
                    <p className="text-slate-400 text-sm">Manage and filter your transaction ledger</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 font-bold text-sm cursor-pointer"
                >
                    <Plus size={18} /> Add Transaction
                </motion.button>
            </div>

            {/* Filters panel with search input integration */}
            <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 flex flex-wrap gap-4 items-center justify-between shadow-lg">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        <Filter size={16} className="text-indigo-400" /> Filters:
                    </div>
                    
                    {/* Type Filter */}
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        className="bg-slate-950/60 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium">
                        <option value="" className="text-slate-900">All Types</option>
                        <option value="income" className="text-slate-900">Income</option>
                        <option value="expense" className="text-slate-900">Expense</option>
                    </select>

                    {/* Category Filter */}
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                        className="bg-slate-950/60 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium">
                        <option value="" className="text-slate-900">All Categories</option>
                        {categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                    </select>

                    {/* Date Filter */}
                    <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                        className="bg-slate-950/60 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
                </div>

                {/* Instant Search Bar */}
                <div className="relative group min-w-[240px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search category, note, amount..."
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/25 transition-all placeholder-slate-650"
                    />
                </div>
            </div>

            {/* Virtualized Ledger View */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-950/20">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-md"></span>
                        <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-md"></span>
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-md"></span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Virtualized Transaction Ledger</span>
                </div>

                {loading && filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">Loading ledger...</div>
                ) : filteredTransactions.length > 0 ? (
                    /* The Scroll Container for Virtualization */
                    <div 
                        ref={parentRef}
                        className="overflow-auto max-h-[500px] w-full px-6 py-4 space-y-2 relative scrollbar-thin scrollbar-thumb-slate-800"
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const t = filteredTransactions[virtualRow.index];
                                if (!t) return null;
                                return (
                                    <div
                                        key={t.id}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size - 8}px`, // leaves room for padding/margin gap
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                        className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/20 rounded-xl transition-all overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                                t.type === 'income' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                                            }`}>
                                                {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-200 capitalize text-sm">{t.category}</span>
                                                    <span className="bg-slate-800 border border-slate-700/60 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t.type}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {new Date(t.transaction_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    {t.note && <span className="mx-1.5">•</span>}
                                                    <span className="italic text-slate-500 font-medium truncate max-w-xs">{t.note}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`font-extrabold text-sm ${
                                                t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                                            }`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                                            </div>
                                            
                                            <motion.button 
                                                whileHover={{ scale: 1.1, color: '#f43f5e' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDelete(t.id)} 
                                                className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                                                title="Delete entry"
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-550 font-medium">No ledger details found matching those active filters.</div>
                )}
            </div>

            <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTransactionAdded={fetchTransactions} />
        </motion.div>
    );
}
