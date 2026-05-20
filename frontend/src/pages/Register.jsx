import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sun, Moon } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [error, setError] = useState('');
    const { register, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, passwordConf);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating Theme Switcher */}
            <div className="absolute top-6 right-6 z-20">
                <button 
                    onClick={toggleTheme} 
                    className="p-2.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-slate-950/10"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-400" />}
                </button>
            </div>

            {/* Background glowing gradients */}
            <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg">
                        <UserPlus size={30} />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Create Account</h2>
                    <p className="text-slate-400 mt-2 text-sm">Start managing your budget today</p>
                </div>
                
                {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3.5 rounded-xl mb-4 text-center text-sm font-semibold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} 
                            className="w-full bg-slate-950/60 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                            className="w-full bg-slate-950/60 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                        <input type="password" required value={passwordConf} onChange={e => setPasswordConf(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            placeholder="••••••••" />
                    </div>
                    
                    <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account? <Link to="/login" className="text-indigo-400 font-semibold hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
