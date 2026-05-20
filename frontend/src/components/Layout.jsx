import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, CreditCard, PieChart, LogOut, Menu, User, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import QuickAddModal from './QuickAddModal';

export default function Layout() {
    const { user, logout, theme, toggleTheme } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobileAddOpen, setIsMobileAddOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/dashboard/transactions', label: 'Transactions', icon: <CreditCard size={20} /> },
        { path: '/dashboard/budgets', label: 'Budgets', icon: <Wallet size={20} /> },
        { path: '/dashboard/reports', label: 'Reports', icon: <PieChart size={20} /> }
    ];

    const handleMobileTransactionAdded = () => {
        // Dispatches global notification so that child routes reload their state
        window.dispatchEvent(new CustomEvent('transaction-added'));
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 relative z-20">
                <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">B</div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">BudgetX</span>
                </div>
                
                <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-inner font-semibold' 
                                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 font-medium">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Glowing background blob */}
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                {/* Topbar */}
                <header className="h-16 bg-slate-900/30 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">
                    <button className="md:hidden text-slate-400 hover:text-slate-200 transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:block"></div>
                    
                    <div className="flex items-center gap-4">
                        {/* Theme Switcher Button */}
                        <button 
                            onClick={toggleTheme} 
                            className="p-2.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-slate-950/10"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-400" />}
                        </button>

                        {/* User profile dropdown look-alike */}
                        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt="Profile" 
                                    className="w-7 h-7 rounded-full object-cover border border-slate-700/60 shadow-md"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/10">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="font-medium text-sm text-slate-300 hidden sm:block">{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex transition-all">
                        <div className="w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col p-6 animate-slide-in">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">BudgetX</span>
                                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive 
                                                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30' 
                                                : 'text-slate-400 hover:bg-slate-850/40'
                                            }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                            <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}

                {/* Main scrollable area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 bg-[radial-gradient(var(--color-grid-dots)_1.5px,transparent_1.5px)] [background-size:32px_32px] p-6 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile bottom nav tabs */}
            <BottomNavigation onOpenQuickAdd={() => setIsMobileAddOpen(true)} />

            {/* Global Mobile Quick Add Modal popup */}
            <QuickAddModal 
                isOpen={isMobileAddOpen} 
                onClose={() => setIsMobileAddOpen(false)} 
                onTransactionAdded={handleMobileTransactionAdded} 
            />
        </div>
    );
}


