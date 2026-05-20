import React from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GuestModeBanner() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user || !user.is_guest) return null;

    return (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-600/15 to-amber-500/10 border border-orange-500/20 px-6 py-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl backdrop-blur-md relative overflow-hidden animate-fade-in mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 relative z-10 text-center md:text-left flex-col md:flex-row">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center animate-bounce">
                    <ShieldAlert size={20} />
                </div>
                <div className="space-y-0.5">
                    <h5 className="text-sm font-bold text-orange-300 flex items-center gap-1.5 justify-center md:justify-start">
                        Demo Sandbox Mode Active <span className="text-[10px] bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">Temporary Session</span>
                    </h5>
                    <p className="text-xs text-slate-350 max-w-xl">
                        You are logged in with a temporary session. Any changes will be cleaned up automatically after 24 hours. Sign up for a full account to keep your data permanent!
                    </p>
                </div>
            </div>

            <button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/15 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] relative z-10"
            >
                <Sparkles size={14} /> Register Full Account
            </button>
        </div>
    );
}
