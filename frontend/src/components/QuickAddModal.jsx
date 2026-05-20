import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Plus, Calendar, Tag, CreditCard, Sparkles, Keyboard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import VoiceTransactionInput from './VoiceTransactionInput';
import ReceiptUploader from './ReceiptUploader';

export default function QuickAddModal({ isOpen: parentIsOpen, onClose: parentOnClose, onTransactionAdded }) {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const isOpen = parentIsOpen !== undefined ? parentIsOpen : localIsOpen;
    const onClose = parentOnClose !== undefined ? parentOnClose : () => setLocalIsOpen(false);

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Shopping');
    const [type, setType] = useState('expense');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Shopping', 'Food', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Other'];

    // 1. Keyboard Shortcut (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (parentIsOpen !== undefined) {
                    // Let the parent manage state if controlled
                    if (parentIsOpen) parentOnClose();
                    else toast.success("Use Quick Actions panel to click +", { duration: 1500 });
                } else {
                    setLocalIsOpen(prev => !prev);
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [parentIsOpen, parentOnClose]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid positive amount.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/transactions', {
                type,
                amount: parseFloat(amount),
                currency: 'USD',
                category,
                transaction_date: transactionDate,
                note
            });

            toast.success('Transaction added successfully!', {
                style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }
            });

            // Reset Form
            setAmount('');
            setNote('');
            setCategory('Shopping');
            setType('expense');

            onClose();

            if (onTransactionAdded) {
                onTransactionAdded();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record transaction.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle voice input pre-filling
    const handleVoiceParsed = (parsed) => {
        if (parsed.amount) setAmount(parsed.amount);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.type) setType(parsed.type);
        if (parsed.note) setNote(parsed.note);
    };

    // 3. Handle OCR receipt pre-filling
    const handleOcrParsed = (parsed) => {
        if (parsed.amount) setAmount(parsed.amount);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.note) setNote(parsed.note);
        setType('expense'); // Receipts are always expenses
    };

    return (
        <>
            {/* Floating Action Button (rendered only if state is internally managed) */}
            {parentIsOpen === undefined && (
                <button 
                    onClick={() => setLocalIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/20 active:scale-95 transition-all duration-150 cursor-pointer border border-blue-400/20 z-40 hidden md:flex"
                    title="Quick Add (Ctrl + K)"
                >
                    <Plus size={26} />
                </button>
            )}

            {/* Modal view */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-blue-400 animate-pulse" size={20} />
                                <h3 className="text-xl font-bold text-slate-100">Add New Transaction</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                    <Keyboard size={10} /> Ctrl + K
                                </span>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Container */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            {/* Expandable Voice & OCR Assistant tabs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <VoiceTransactionInput onVoiceParsed={handleVoiceParsed} />
                                <ReceiptUploader onOcrParsed={handleOcrParsed} />
                            </div>

                            {/* Standard manual form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Type selector toggle */}
                                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/60 border border-slate-850 rounded-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setType('expense')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            type === 'expense' 
                                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                                            : 'text-slate-450 hover:text-slate-300'
                                        }`}
                                    >
                                        Expense
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setType('income')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            type === 'income' 
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                            : 'text-slate-450 hover:text-slate-300'
                                        }`}
                                    >
                                        Income
                                    </button>
                                </div>

                                {/* Inputs */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Amount (USD)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            required 
                                            value={amount} 
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Category</label>
                                        <select 
                                            value={category} 
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium appearance-none"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat} className="text-slate-900">{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Transaction Date</label>
                                        <div className="relative">
                                            <input 
                                                type="date" 
                                                required 
                                                value={transactionDate} 
                                                onChange={e => setTransactionDate(e.target.value)}
                                                className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Note</label>
                                        <input 
                                            type="text" 
                                            value={note} 
                                            onChange={e => setNote(e.target.value)}
                                            placeholder="Details..."
                                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3 flex-shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={onClose}
                                        className="flex-1 py-3.5 border border-slate-800 hover:bg-slate-800/40 text-slate-350 font-bold rounded-xl transition-all cursor-pointer text-center text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className={`flex-[2] py-3.5 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-sm ${
                                            type === 'expense' 
                                            ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-500/20' 
                                            : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Plus size={16} /> {loading ? 'Adding...' : 'Add Transaction'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
