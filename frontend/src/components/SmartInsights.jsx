import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SmartInsights() {
    const { token } = useAuth();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    const fetchInsights = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await api.get('/insights');
            setInsights(res.data);
        } catch (err) {
            console.error("Failed to compile smart insights", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchInsights();
            // Auto-refresh recommendations every 5 minutes (300,000 ms)
            intervalRef.current = setInterval(fetchInsights, 300000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [token]);

    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-between group">
            {/* Pulsing lightbulb glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400 animate-pulse" size={18} />
                    <h4 className="text-base font-extrabold text-slate-100">Smart Financial Advice</h4>
                </div>
                <button 
                    onClick={fetchInsights} 
                    disabled={loading}
                    className="text-slate-500 hover:text-slate-350 transition-colors cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && !insights ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-2 border-t-yellow-400 border-r-transparent border-slate-800 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium">Running budget comparison loops...</span>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
                    {/* Trend Banner */}
                    <div className={`p-4 rounded-xl border flex gap-3 items-start ${
                        insights?.direction === 'up' 
                        ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' 
                        : insights?.direction === 'down' 
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        : 'bg-blue-500/5 border-blue-500/10 text-blue-400'
                    }`}>
                        {insights?.direction === 'up' ? (
                            <TrendingUp size={20} className="mt-0.5" />
                        ) : insights?.direction === 'down' ? (
                            <CheckCircle size={20} className="mt-0.5" />
                        ) : (
                            <Lightbulb size={20} className="mt-0.5" />
                        )}
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider block opacity-70">
                                {insights?.direction === 'up' ? 'Expense Trend' : 'Savings Progress'}
                            </span>
                            <span className="text-sm font-bold text-slate-100 leading-snug">
                                {insights?.comparative_text}
                            </span>
                        </div>
                    </div>

                    {/* Recommendations Rows */}
                    <div className="space-y-2.5">
                        {insights?.suggestions?.map((item, idx) => {
                            let icon = <Lightbulb className="text-yellow-400 mt-0.5" size={16} />;
                            if (item.includes('🚨') || item.includes('📈')) {
                                icon = <AlertTriangle className="text-rose-400 mt-0.5" size={16} />;
                            } else if (item.includes('🎉') || item.includes('✅')) {
                                icon = <CheckCircle className="text-emerald-400 mt-0.5" size={16} />;
                            }
                            
                            return (
                                <div key={idx} className="flex gap-2.5 items-start bg-slate-950/40 border border-slate-850 p-3 rounded-xl hover:border-slate-800 transition-all">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {icon}
                                    </div>
                                    <p className="text-xs text-slate-350 leading-relaxed">
                                        {item.replace(/^[📈📉💡⚠️✅🎉🍔🎯]/, '').trim()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <span className="text-[10px] text-slate-650 font-medium block mt-4 text-center">
                Insights auto-refresh every 5 minutes.
            </span>
        </div>
    );
}
