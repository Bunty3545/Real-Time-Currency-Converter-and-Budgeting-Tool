import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, RefreshCw, BarChart3, ShieldCheck, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
    const { user, theme, toggleTheme } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden relative">
            {/* Glowing background blob */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">BudgetX</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Theme Switcher Button */}
                    <button 
                        onClick={toggleTheme} 
                        className="p-2.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-slate-950/10"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-400" />}
                    </button>

                    {user ? (
                        <Link to="/dashboard" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-medium">Sign In</Link>
                            <Link to="/register" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-md">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </header>


            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
                        <Zap size={14} /> Real-Time Smart Budgeting
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        Take Control of Your <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Financial Destiny
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Track income, manage budgets, analyze expenses, and convert currencies in real-time with our sleek, automated financial planner.
                    </p>

                    <div className="pt-6 flex flex-wrap justify-center gap-4">
                        {user ? (
                            <Link to="/dashboard" className="bg-gradient-to-r from-blue-50 to-indigo-100 hover:from-white hover:to-slate-100 text-slate-950 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-white/10 flex items-center gap-2 group">
                                Go to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link to="/register" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 group">
                                Start Budgeting Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Dashboard Preview / Interface teaser */}
                <div className="mt-20 border border-slate-800 rounded-3xl bg-slate-900/40 backdrop-blur-md p-2.5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10 rounded-3xl pointer-events-none"></div>
                    <img 
                        src="/dashboard_3d_preview.png" 
                        alt="BudgetX Real-Time 3D Multi-Currency Dashboard Preview" 
                        className="w-full h-auto rounded-2xl border border-slate-900 object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 shadow-xl"
                    />
                </div>

                {/* Feature Grid */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-8 rounded-2xl transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20 mb-6">
                            <RefreshCw size={24} />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Live Currency Converter</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Fetch live, real-time exchange rates instantly for accurate comparisons and cross-border cash flow planning.</p>
                    </div>

                    <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-8 rounded-2xl transition-all duration-300">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 mb-6">
                            <Wallet size={24} />
                        </div>
                        <h4 className="text-xl font-bold mb-3">SaaS-style Budget Tracker</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Establish monthly spending thresholds and get smart suggestions, warnings, and alerts when nearing your budget caps.</p>
                    </div>

                    <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-8 rounded-2xl transition-all duration-300">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20 mb-6">
                            <BarChart3 size={24} />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Deep Reports & Analytics</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Explore expense ratios, savings pacing, and category-wise breakdowns via gorgeous responsive data charts.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
