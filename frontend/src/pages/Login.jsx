import { useState, useCallback, useEffect, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sun, Moon, Mail, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import SocialLoginButtons from '../components/SocialLoginButtons';

// Memoized Input Field component for zero re-renders on keystroke of other inputs
const FormInput = memo(({ label, icon: Icon, type, value, onChange, placeholder, required }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="space-y-1.5"
        >
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Icon size={18} />
                </div>
                <input 
                    type={type} 
                    required={required} 
                    value={value} 
                    onChange={onChange} 
                    placeholder={placeholder}
                    className="w-full bg-slate-950/60 border border-slate-850 focus:border-blue-500/50 text-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder-slate-600" 
                />
            </div>
        </motion.div>
    );
});

FormInput.displayName = 'FormInput';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login, guestLogin, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    // Check remember me & social error query parameters on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }

        const queryParams = new URLSearchParams(window.location.search);
        const errorParam = queryParams.get('error');
        if (errorParam) {
            if (errorParam === 'auth_denied') {
                setError('Authorization was rejected or denied by the provider.');
            } else if (errorParam === 'no_email_provided') {
                setError('Unable to fetch your email address from your social account.');
            } else {
                setError('An error occurred during social login. Please try again.');
            }
            // Strip the error parameters from the url silently
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Optimized form submit with useCallback
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        // Fast Client-side Validation (no API calls needed)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setIsLoggingIn(false);
            return;
        }

        try {
            // Log in via API
            await login(email, password);
            
            // Handle Remember Me caching
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            // Burst confetti celebration instantly
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#8b5cf6', '#a855f7', '#f43f5e']
            });

            toast.success('Welcome back to BudgetX!', {
                icon: '⚡',
                style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px border #1e293b',
                    borderRadius: '16px',
                }
            });

            // Fast local redirection (<100ms delay)
            setTimeout(() => {
                navigate('/dashboard');
            }, 100);

        } catch (err) {
            setError(err.response?.data?.message || 'The email or password entered is incorrect.');
        } finally {
            setIsLoggingIn(false);
        }
    }, [email, password, rememberMe, login, navigate]);

    // Fast guest login demo
    const handleGuestLogin = useCallback(async () => {
        setError('');
        setIsLoggingIn(true);
        try {
            const data = await guestLogin();

            confetti({
                particleCount: 100,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#3b82f6', '#10b981']
            });

            toast.success(`Welcome to the sandbox!`, {
                icon: '⚡',
                style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    borderRadius: '16px',
                }
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 100);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to launch demo sandbox');
        } finally {
            setIsLoggingIn(false);
        }
    }, [guestLogin, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
            {/* Theme switcher */}
            <div className="absolute top-6 right-6 z-20">
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme} 
                    className="p-2.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-slate-950/10"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-400" />}
                </motion.button>
            </div>

            {/* Glowing background shift */}
            <motion.div 
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 20, 0],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/4 w-[45%] h-[45%] bg-blue-500/10 rounded-full blur-[110px] pointer-events-none"
            />
            <motion.div 
                animate={{
                    scale: [1.1, 1, 1.1],
                    x: [0, -30, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-1/4 right-1/4 w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none"
            />

            {/* Main Auth Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                className="max-w-md w-full bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ rotate: -15, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 shadow-lg"
                    >
                        <LogIn size={30} />
                    </motion.div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Welcome Back</h2>
                    <p className="text-slate-400 mt-2 text-sm">Sign in to manage your budget</p>
                </div>
                
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3.5 rounded-xl mb-5 text-center text-sm font-semibold"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput 
                        label="Email" 
                        icon={Mail} 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="you@example.com" 
                        required 
                    />
                    <FormInput 
                        label="Password" 
                        icon={Lock} 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                    />

                    {/* Remember me & Forgot */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <motion.input 
                                whileTap={{ scale: 1.2 }}
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span>Remember Me</span>
                        </label>
                        <a href="#forgot" className="text-blue-400 hover:underline">Forgot Password?</a>
                    </div>
                    
                    {/* Submit Button with interactive scale and loading spinners */}
                    <motion.button 
                        whileHover={{ scale: isLoggingIn ? 1 : 1.01, translateY: -1 }}
                        whileTap={{ scale: isLoggingIn ? 1 : 0.98 }}
                        type="submit" 
                        disabled={isLoggingIn}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                            </>
                        )}
                    </motion.button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-800/80"></div>
                        <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-extrabold tracking-widest">Or</span>
                        <div className="flex-grow border-t border-slate-800/80"></div>
                    </div>

                    {/* Sandbox Button */}
                    <motion.button 
                        whileHover={{ scale: isLoggingIn ? 1 : 1.01 }}
                        whileTap={{ scale: isLoggingIn ? 1 : 0.98 }}
                        type="button" 
                        onClick={handleGuestLogin}
                        disabled={isLoggingIn}
                        className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900/60 hover:border-slate-700/80 text-orange-400 hover:text-orange-350 font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer text-center text-sm flex items-center justify-center gap-1.5"
                    >
                        ⚡ Try Demo Sandbox
                    </motion.button>
                </form>

                {/* Social Login Buttons with Premium Brand Colors and Animations */}
                <div className="mt-6">
                    <SocialLoginButtons />
                </div>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account? <Link to="/register" className="text-blue-400 font-semibold hover:underline">Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
}
