import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { NotificationProvider } from './context/NotificationContext';
import { BudgetProvider } from './context/BudgetContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Hero from './pages/Hero';
import OAuthCallback from './pages/OAuthCallback';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-bold text-xl">
            Loading...
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Secure Dashboard & Workspace Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="reports" element={<Reports />} />
            </Route>

            {/* Fallback Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                <NotificationProvider>
                    <BudgetProvider>
                        <Toaster position="top-right" reverseOrder={false} />
                        <Router>
                            <AppRoutes />
                        </Router>
                    </BudgetProvider>
                </NotificationProvider>
            </CurrencyProvider>
        </AuthProvider>
    );
}

export default App;

