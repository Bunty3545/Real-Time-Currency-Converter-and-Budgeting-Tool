import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function TransactionSearch({ transactions = [], onSelectTransaction }) {
    const { formatCurrency } = useCurrency();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);

    // 1. Loading cached search log
    useEffect(() => {
        const cached = localStorage.getItem('budgetx_recent_searches');
        if (cached) {
            try {
                setRecentSearches(JSON.parse(cached));
            } catch (e) {}
        }
    }, []);

    // 2. Debouncing logic (500ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    // 3. Performing the search filter
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = debouncedQuery.toLowerCase();
        const filtered = transactions.filter(t => {
            const catMatch = t.category.toLowerCase().includes(lowerQuery);
            const noteMatch = (t.note || '').toLowerCase().includes(lowerQuery);
            const amtMatch = String(t.amount).includes(lowerQuery);
            return catMatch || noteMatch || amtMatch;
        });
        setResults(filtered.slice(0, 5)); // cap results at top 5
    }, [debouncedQuery, transactions]);

    // 4. Handle selection of a match
    const handleSelect = (item) => {
        // Save search query into cached logs
        const searchWord = query.trim();
        if (searchWord && !recentSearches.includes(searchWord)) {
            const updated = [searchWord, ...recentSearches].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('budgetx_recent_searches', JSON.stringify(updated));
        }

        setShowDropdown(false);
        if (onSelectTransaction) {
            onSelectTransaction(item);
        }
    };

    // Close on outside clicking
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Highlight text segments matching query
    const highlightText = (text, highlight) => {
        if (!text) return '-';
        if (!highlight.trim()) return <span>{text}</span>;
        
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, i) => 
            regex.test(part) ? (
                <mark key={i} className="bg-yellow-500/30 text-yellow-300 rounded px-0.5 border-b border-yellow-500/40">{part}</mark>
            ) : (
                <span key={i} className="text-slate-300">{part}</span>
            )
        );
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <input 
                    type="text"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search category, note, amount..."
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-slate-700/80 hover:border-slate-800 outline-none rounded-xl py-2.5 pl-10 pr-9 text-xs text-slate-200 transition-all focus:ring-1 focus:ring-blue-500/25"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                {query && (
                    <button 
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Results / History dropdown overlay */}
            {showDropdown && (query.trim() || recentSearches.length > 0) && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden z-30 p-2 divide-y divide-slate-850 animate-slide-up">
                    
                    {/* Active search matches list */}
                    {query.trim() ? (
                        <div className="py-2 space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold px-3 block mb-1">Search Results</span>
                            {results.length > 0 ? (
                                results.map(t => (
                                    <div 
                                        key={t.id}
                                        onClick={() => handleSelect(t)}
                                        className="flex justify-between items-center px-3 py-2 hover:bg-slate-950/60 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-850"
                                    >
                                        <div className="space-y-0.5">
                                            <span className="text-xs font-bold text-slate-100 block">
                                                {highlightText(t.category, debouncedQuery)}
                                            </span>
                                            <span className="text-[10px] text-slate-500 block">
                                                {highlightText(t.note, debouncedQuery)}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-extrabold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-xs text-slate-500 font-medium">
                                    No records match "{query}"
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Cached search history log */}
                    {!query.trim() && recentSearches.length > 0 && (
                        <div className="py-2 space-y-1">
                            <div className="flex justify-between items-center px-3 mb-1">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold block">Recent Searches</span>
                                <button 
                                    onClick={() => { setRecentSearches([]); localStorage.removeItem('budgetx_recent_searches'); }}
                                    className="text-[9px] text-rose-400 hover:text-rose-350 font-bold cursor-pointer"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((word, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => { setQuery(word); setDebouncedQuery(word); }}
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-950/60 rounded-xl cursor-pointer transition-all text-xs font-medium text-slate-400 hover:text-slate-200"
                                >
                                    <History size={12} className="text-slate-650" />
                                    <span>{word}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
