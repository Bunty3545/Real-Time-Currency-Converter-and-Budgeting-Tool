import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
    const { setToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenVal = queryParams.get('token');
        const provider = queryParams.get('provider') || 'social';
        const name = queryParams.get('name') || '';

        if (tokenVal) {
            // Log in using token
            setToken(tokenVal);

            // Confetti burst for high-fidelity interactive feedback
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 },
                colors: provider === 'google' 
                    ? ['#4285F4', '#34A853', '#FBBC05', '#EA4335'] 
                    : ['#24292e', '#8b5cf6', '#a855f7']
            });

            toast.success(`Logged in with ${provider === 'google' ? 'Google' : 'GitHub'}! Welcome back, ${name}.`, {
                icon: '⚡',
                style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                }
            });

            // Redirect instantly
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 500);

            return () => clearTimeout(timer);
        } else {
            // Access denied or aborted authorization flow
            toast.error(`Authentication rejected or failed. Please try again.`, {
                style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                }
            });
            navigate('/login');
        }
    }, [location, setToken, navigate]);

    // Animated loading backdrop
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center gap-6"
            >
                <div className="relative flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <div className="absolute w-6 h-6 bg-blue-500/10 rounded-full animate-ping pointer-events-none"></div>
                </div>
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-200">Completing Sign In</h3>
                    <p className="text-slate-400 text-sm mt-1.5 font-medium">Please wait while we establish your session securely...</p>
                </div>
            </motion.div>
        </div>
    );
}
