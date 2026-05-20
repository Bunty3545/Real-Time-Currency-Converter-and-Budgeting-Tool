import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
    const { token } = useAuth();
    const [currentBudget, setCurrentBudget] = useState(null);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [percentageUsed, setPercentageUsed] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshBudgetData = async (targetMonth) => {
        if (!token) return;
        const month = targetMonth || new Date().toISOString().split('T')[0].substring(0, 7);
        setLoading(true);
        try {
            // 1. Fetch budget cap for month
            const budgetRes = await api.get(`/budgets/month/${month}`).catch(() => null);
            const budgetAmt = budgetRes && budgetRes.data ? parseFloat(budgetRes.data.total_budget) : 0;
            setCurrentBudget(budgetRes ? budgetRes.data : null);

            // 2. Fetch transaction summary for month
            const summaryRes = await api.get(`/transactions/summary?month=${month}`).catch(() => null);
            const expenseAmt = summaryRes && summaryRes.data ? parseFloat(summaryRes.data.total_expense) : 0;
            setExpenseTotal(expenseAmt);

            // 3. Compute ratio
            if (budgetAmt > 0) {
                const ratio = Math.round((expenseAmt / budgetAmt) * 100);
                setPercentageUsed(ratio);
            } else {
                setPercentageUsed(0);
            }
        } catch (err) {
            console.error("Failed to refresh budget values", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            refreshBudgetData();
        } else {
            setCurrentBudget(null);
            setExpenseTotal(0);
            setPercentageUsed(0);
        }
    }, [token]);

    return (
        <BudgetContext.Provider value={{ currentBudget, expenseTotal, percentageUsed, refreshBudgetData, loading }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => useContext(BudgetContext);
