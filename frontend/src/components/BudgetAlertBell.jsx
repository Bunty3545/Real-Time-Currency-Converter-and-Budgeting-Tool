import React, { useState, useRef, useEffect } from 'react';
import { Bell, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function BudgetAlertBell() {
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-850/80 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer relative"
                title="Notifications"
            >
                <Bell size={18} className={unreadCount > 0 ? 'animate-swing' : ''} />
                
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-slate-950 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-slate-850 bg-slate-950/20 px-5">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Alerts Log
                        </span>
                        {unreadCount > 0 && (
                            <button 
                                onClick={clearAll}
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <CheckCircle2 size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-850">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 flex gap-3 transition-colors ${
                                        !n.is_read ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-slate-950/20'
                                    }`}
                                >
                                    <div className="mt-0.5">
                                        {n.message.includes('🚨') ? (
                                            <ShieldAlert size={14} className="text-rose-400" />
                                        ) : (
                                            <ShieldAlert size={14} className="text-amber-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
                                            {n.message.replace(/^[🚨⚠️]/, '').trim()}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-slate-550">
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!n.is_read && (
                                                <button 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-[9px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                                                >
                                                    Dismiss
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-xs text-slate-500 space-y-1">
                                <p>📭 Notifications feed is clear</p>
                                <span className="text-[10px] text-slate-600 block">We will alert you here if thresholds breach</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
