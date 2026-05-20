import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, QrCode, CreditCard, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ScanPayModal({ isOpen, onClose, onPaymentCompleted }) {
    const [amount, setAmount] = useState('45.00');
    const [currency, setCurrency] = useState('USD');
    const [category, setCategory] = useState('Shopping');
    const [note, setNote] = useState('Instore Checkout');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const categories = ['Shopping', 'Food', 'Travel', 'Bills', 'Entertainment', 'Other'];

    // Dynamically update online QR code when amount or category changes
    useEffect(() => {
        if (amount && parseFloat(amount) > 0) {
            const dataStr = `budgetx-payment:${amount}:${currency}:${category}:${note || 'ScanPay'}`;
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=3b82f6&bgcolor=ffffff&data=${encodeURIComponent(dataStr)}`);
        } else {
            setQrCodeUrl('');
        }
    }, [amount, currency, category, note]);

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid payment amount.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Simulate gateway delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Post actual transaction to Laravel database
            await api.post('/transactions', {
                type: 'expense',
                amount: parseFloat(amount),
                currency,
                category,
                transaction_date: new Date().toISOString().split('T')[0],
                note: `[Scan & Pay] ${note}`
            });

            // 3. Mark success
            setSuccess(true);
            
            // 4. Trigger dashboard parent reload
            if (onPaymentCompleted) {
                onPaymentCompleted();
            }

            // 5. Autoclose after showing checkmark animation
            setTimeout(() => {
                setSuccess(false);
                setAmount('45.00');
                setNote('Instore Checkout');
                onClose();
            }, 1800);

        } catch (err) {
            setError(err.response?.data?.message || 'Payment processing failed.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 relative">
                {/* Decorative glows */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 relative z-10">
                    <div className="flex items-center gap-2">
                        <QrCode className="text-blue-400" size={22} />
                        <h3 className="text-xl font-bold text-slate-100">Scan & Pay Gateway</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    /* Beautiful confirmation splash screen */
                    <div className="p-8 text-center space-y-6 relative z-10 animate-fade-in flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 size={48} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-extrabold text-slate-100 tracking-tight">Payment Confirmed!</h4>
                            <p className="text-sm text-slate-400">Your transaction was processed successfully.</p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl max-w-xs w-full text-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block">Charged Amount</span>
                            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
                            </span>
                            <span className="text-xs text-slate-400 mt-1 block">Category: {category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                            <Sparkles size={12} /> Syncing dashboard in real-time...
                        </div>
                    </div>
                ) : loading ? (
                    /* Secure processing spinner screen */
                    <div className="p-8 text-center space-y-6 relative z-10 flex flex-col items-center justify-center min-h-[350px] animate-fade-in">
                        <Loader2 className="animate-spin text-blue-400" size={54} />
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold text-slate-200">Connecting Gateway...</h4>
                            <p className="text-sm text-slate-400">Verifying secure multi-currency handshake protocols.</p>
                        </div>
                        <div className="w-48 bg-slate-950/80 rounded-full h-1.5 overflow-hidden p-0.5 border border-slate-800">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-progress-bar"></div>
                        </div>
                    </div>
                ) : (
                    /* The Main Input & Scanner Code Generator Form */
                    <form onSubmit={handleConfirmPayment} className="p-6 space-y-5 relative z-10">
                        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3.5 rounded-xl text-sm font-semibold">{error}</div>}

                        {/* Interactive Barcode & QR Code Section */}
                        <div className="flex flex-col items-center justify-center bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                            {qrCodeUrl ? (
                                <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-800 transition-all hover:scale-[1.02] relative group">
                                    <img src={qrCodeUrl} alt="BudgetX Dynamic QR Code" className="w-[140px] h-[140px] rounded-lg" />
                                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-transparent transition-colors rounded-xl pointer-events-none"></div>
                                </div>
                            ) : (
                                <div className="w-[140px] h-[140px] bg-slate-900 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
                                    <QrCode size={36} className="mb-2 text-slate-600" />
                                    Enter an amount
                                </div>
                            )}

                            {/* Standard Checkout Barcode Mockup */}
                            <div className="w-full flex flex-col items-center justify-center gap-1 opacity-80 mt-1">
                                <div className="flex gap-[1.5px] h-7 items-center justify-center w-4/5 overflow-hidden">
                                    {/* Procedural barcode bars */}
                                    {[2,1,3,1,2,4,1,2,1,3,1,2,1,4,2,1,3,1,2,1,3,2,1,4,1,2,3,1].map((width, idx) => (
                                        <div key={idx} className="bg-slate-300 dark:bg-slate-400 h-full" style={{ width: `${width}px` }}></div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono tracking-[4px]">9834278491029</span>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Amount</label>
                                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-semibold"
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium appearance-none">
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="text-slate-900">{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Note (Optional)</label>
                                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium"
                                    placeholder="Add notes..." />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex gap-3">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-3.5 border border-slate-800 hover:bg-slate-800/40 text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-center text-sm">
                                Cancel
                            </button>
                            <button type="submit"
                                className="flex-[2] py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">
                                <CreditCard size={18} /> Simulate Scan & Pay
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
