import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Plus, BarChart3, Settings } from 'lucide-react';

export default function BottomNavigation({ onOpenQuickAdd }) {
    const location = useLocation();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 h-16 z-40 px-6 flex justify-between items-center shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
            {/* Home Link */}
            <NavLink 
                to="/dashboard"
                className={({ isActive }) => 
                    `flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                        isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-400'
                    }`
                }
            >
                <Home size={18} />
                <span>Home</span>
            </NavLink>

            {/* Reports Link */}
            <NavLink 
                to="/reports"
                className={({ isActive }) => 
                    `flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                        isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-400'
                    }`
                }
            >
                <BarChart3 size={18} />
                <span>Reports</span>
            </NavLink>

            {/* Floating Quick Add Trigger */}
            <div className="relative -top-4">
                <button 
                    onClick={onOpenQuickAdd}
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform duration-150 cursor-pointer border border-blue-400/20"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Settings Link */}
            <NavLink 
                to="/settings"
                className={({ isActive }) => 
                    `flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                        isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-400'
                    }`
                }
            >
                <Settings size={18} />
                <span>Settings</span>
            </NavLink>
        </div>
    );
}
