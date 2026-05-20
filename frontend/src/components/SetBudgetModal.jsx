import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, DollarSign } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SetBudgetModal({ isOpen, onClose, month, currentBudget, onBudgetSaved }) {
    const [totalBudget, setTotalBudget] = useState('');
    const [categoryBudgets, setCategoryBudgets] = useState({
        Food: '',
        Shopping: '',
        Bills: '',
        Travel: '',
        Entertainment: '',
        Other: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Initialize values with current user budgets if available
    useEffect(() => {
        if (isOpen) {
            if (currentBudget) {
                setTotalBudget(currentBudget.total_budget || '');
                const cats = currentBudget.category_budgets || {};
                setCategoryBudgets({
                    Food: cats.Food || '',
                    Shopping: cats.Shopping || '',
                    Bills: cats.Bills || '',
                    Travel: cats.Travel || '',
                    Entertainment: cats.Entertainment || '',
                    Other: cats.Other || ''
                });
            } else {
                setTotalBudget('');
                setCategoryBudgets({
                    Food: '',
                    Shopping: '',
                    Bills: '',
                    Travel: '',
                    Entertainment: '',
                    Other: ''
                });
            }
        }
    }, [isOpen, currentBudget]);

    // Automatically sum category budgets when typed to keep total budget synchronized!
    const handleCategoryChange = (cat, value) => {
        const updatedCats = { ...categoryBudgets, [cat]: value };
        setCategoryBudgets(updatedCats);

        // Sum them up
        const total = Object.values(updatedCats).reduce((acc, val) => {
            const num = parseFloat(val);
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
        
        if (total > 0) {
            setTotalBudget(total.toString());
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const numericTotal = parseFloat(totalBudget);
        if (isNaN(numericTotal) || numericTotal <= 0) {
            toast.error("Please enter a valid total budget amount");
            return;
        }

        setIsSaving(true);
        try {
            // Structure categories payload
            const catPayload = {};
            Object.keys(categoryBudgets).forEach(cat => {
                catPayload[cat] = parseFloat(categoryBudgets[cat]) || 0;
            });

            await api.post('/budgets/save', {
                month,
                total_budget: numericTotal,
                category_budgets: catPayload
            });

            toast.success("Budget set successfully!", {
                style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                }
            });

            onBudgetSaved();
            onClose();
        } catch (error) {
            console.error("Failed to save budget", error);
            toast.error("Failed to save budget configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop Blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-hidden z-10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">Set Monthly Budget Limit</h3>
                            <p className="text-slate-400 text-xs mt-0.5 font-medium">Configure allocations for the month of {month}</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Total Monthly Limit */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Combined Budget</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={totalBudget}
                                    onChange={(e) => setTotalBudget(e.target.value)}
                                    placeholder="Enter total monthly budget limit"
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder-slate-650"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-800/80 my-4" />

                        <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Category Breakdown limits</h4>
                        
                        {/* Category specific limits */}
                        <div className="grid grid-cols-2 gap-3.5">
                            {Object.keys(categoryBudgets).map((cat) => (
                                <div key={cat} className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-400">{cat}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-650">
                                            <DollarSign className="w-3.5 h-3.5" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={categoryBudgets[cat]}
                                            onChange={(e) => handleCategoryChange(cat, e.target.value)}
                                            placeholder="Limit"
                                            className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/50 text-slate-300 pl-8 pr-3 py-2 rounded-lg outline-none text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium placeholder-slate-700"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: isSaving ? 1 : 1.01 }}
                            whileTap={{ scale: isSaving ? 1 : 0.98 }}
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving Budget...</span>
                                </>
                            ) : (
                                <span>Save Budget Configurations</span>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
