import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DarkModeToggle() {
    const { theme, toggleTheme } = useAuth();

    return (
        <button 
            onClick={toggleTheme}
            className="w-10 h-10 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-850/80 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-lg active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400 animate-pulse" />
            ) : (
                <Moon size={18} className="text-indigo-400" />
            )}
        </button>
    );
}
