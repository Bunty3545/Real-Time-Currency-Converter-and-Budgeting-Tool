import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from 'file-saver';
import { Calendar, Download, FileSpreadsheet, FileText, FileCode, ArrowDownRight, ArrowUpRight, DollarSign, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MonthlyStatement() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [statementData, setStatementData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);

    const monthStr = selectedDate.toISOString().substring(0, 7); // YYYY-MM

    useEffect(() => {
        fetchStatement();
    }, [selectedDate]);

    const fetchStatement = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/monthly-statement?month=${monthStr}`);
            setStatementData(response.data);
        } catch (error) {
            console.error("Failed to fetch monthly statement", error);
            toast.error("Failed to load statement preview.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format) => {
        setExporting(format);
        try {
            const response = await api.get(`/monthly-statement/export/${format}?month=${monthStr}`, {
                responseType: 'blob'
            });

            const mimeTypes = {
                csv: 'text/csv;charset=utf-8;',
                excel: 'application/vnd.ms-excel',
                pdf: 'text/html;charset=utf-8;'
            };

            const blob = new Blob([response.data], { type: mimeTypes[format] });

            if (format === 'pdf') {
                // PDFs are styled HTML structures with window.print() embedded, open in new printable tab!
                const fileURL = URL.createObjectURL(blob);
                window.open(fileURL, '_blank');
                toast.success("Opening print/save PDF layout...");
            } else {
                const ext = format === 'excel' ? 'xls' : 'csv';
                saveAs(blob, `budgetx_statement_${monthStr}.${ext}`);
                toast.success(`Statement exported as ${format.toUpperCase()}!`);
            }
        } catch (error) {
            console.error(`Export failed for ${format}`, error);
            toast.error(`Failed to export statement in ${format.toUpperCase()} format.`);
        } finally {
            setExporting(null);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.preferred_currency || 'USD'
        }).format(val || 0);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/25 p-6 rounded-2xl border border-slate-800/80">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Statement & Export Center</h1>
                    <p className="text-slate-400 text-sm mt-0.5 font-medium">Generate, preview, and download itemized monthly statements</p>
                </div>
                
                {/* Premium Month Picker */}
                <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-850 px-4 py-2 rounded-xl focus-within:border-blue-500/50 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        className="bg-transparent text-slate-200 outline-none font-semibold text-sm cursor-pointer w-36"
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-slate-400 text-sm font-semibold animate-pulse">Assembling Statement Ledger...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Summary & Exports */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Financial Cards */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-2">Statement Summary</h3>
                            
                            <div className="flex justify-between items-center py-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><ArrowUpRight className="w-4 h-4" /></div>
                                    <span className="text-sm font-semibold text-slate-400">Total Income</span>
                                </div>
                                <span className="font-extrabold text-emerald-400">{formatCurrency(statementData?.total_income)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-450"><ArrowDownRight className="w-4 h-4" /></div>
                                    <span className="text-sm font-semibold text-slate-400">Total Expenses</span>
                                </div>
                                <span className="font-extrabold text-rose-450">-{formatCurrency(statementData?.total_expense)}</span>
                            </div>

                            <div className="border-t border-slate-800/80 my-3" />

                            <div className="flex justify-between items-center py-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-450"><Wallet className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-slate-350">Net Savings</span>
                                </div>
                                <span className={`font-black text-lg ${statementData?.net_balance >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                                    {formatCurrency(statementData?.net_balance)}
                                </span>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-2">Available Formats</h3>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDownload('csv')}
                                disabled={exporting !== null}
                                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-300 py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2.5">
                                    <FileCode className="w-5 h-5 text-emerald-400" />
                                    Export CSV Spreadsheet
                                </span>
                                <Download className="w-4 h-4 text-slate-500" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDownload('excel')}
                                disabled={exporting !== null}
                                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-300 py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2.5">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                                    Export MS Excel Ledger
                                </span>
                                <Download className="w-4 h-4 text-slate-500" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDownload('pdf')}
                                disabled={exporting !== null}
                                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-300 py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2.5">
                                    <FileText className="w-5 h-5 text-orange-400" />
                                    Print / Save PDF Statement
                                </span>
                                <Download className="w-4 h-4 text-slate-500" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Right: Statement Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Category Wise Preview */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-3 mb-4">Category Expenses Breakdown</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(statementData?.category_breakdown || {}).map(([cat, val]) => (
                                    <div key={cat} className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl">
                                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{cat}</p>
                                        <p className="text-base font-black text-slate-300 mt-1">{formatCurrency(val)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction List Preview */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-3 mb-4">Monthly Statements Ledger</h3>
                            
                            {statementData?.transactions && statementData.transactions.length > 0 ? (
                                <div className="overflow-x-auto max-h-96">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                <th className="pb-3.5 pl-2">Date</th>
                                                <th className="pb-3.5">Category</th>
                                                <th className="pb-3.5">Note</th>
                                                <th className="pb-3.5 text-right pr-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/40">
                                            {statementData.transactions.map((t) => (
                                                <tr key={t.id} className="text-sm font-semibold text-slate-305 hover:bg-slate-800/10">
                                                    <td className="py-3.5 pl-2 text-slate-450">{t.transaction_date}</td>
                                                    <td className="py-3.5 font-bold text-slate-300">{t.category}</td>
                                                    <td className="py-3.5 text-slate-500 italic max-w-xs truncate">{t.note || '-'}</td>
                                                    <td className={`py-3.5 text-right pr-2 font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-350'}`}>
                                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center gap-2.5">
                                    <AlertCircle className="w-8 h-8 text-slate-650" />
                                    <p className="text-slate-500 font-semibold text-sm">No transaction entries found for this month period.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
