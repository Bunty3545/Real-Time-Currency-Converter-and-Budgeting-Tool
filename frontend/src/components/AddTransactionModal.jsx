import { useState } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onTransactionAdded }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = {
        expense: ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Other'],
        income: ['Salary', 'Investments', 'Other']
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/transactions', {
                type,
                amount: parseFloat(amount),
                currency,
                category,
                transaction_date: date,
                note
            });
            onTransactionAdded();
            onClose();
            // Reset
            setAmount('');
            setNote('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-slate-100">Add Transaction</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3.5 rounded-xl text-sm font-semibold">{error}</div>}

                    {/* Transaction Type Tabs */}
                    <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-850">
                        <button type="button" onClick={() => { setType('expense'); setCategory('Food'); }}
                            className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition-all cursor-pointer ${
                                type === 'expense' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450 shadow-sm' : 'text-slate-400 hover:text-slate-250 border border-transparent'
                            }`}>
                            Expense
                        </button>
                        <button type="button" onClick={() => { setType('income'); setCategory('Salary'); }}
                            className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition-all cursor-pointer ${
                                type === 'income' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-250 border border-transparent'
                            }`}>
                            Income
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amount</label>
                            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium"
                                placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Currency</label>
                            <select value={currency} onChange={e => setCurrency(e.target.value)}
                                className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium appearance-none">
                                <option value="USD" className="text-slate-900">USD</option>
                                <option value="EUR" className="text-slate-900">EUR</option>
                                <option value="GBP" className="text-slate-900">GBP</option>
                                <option value="INR" className="text-slate-900">INR</option>
                                <option value="JPY" className="text-slate-900">JPY</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium appearance-none">
                            {categories[type].map(cat => (
                                <option key={cat} value={cat} className="text-slate-900">{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                        <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Note (Optional)</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows="2"
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium resize-none"
                            placeholder="Add notes..." />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-lg cursor-pointer ${
                            type === 'expense' 
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-500/20' 
                            : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20'
                        }`}>
                        {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
}
