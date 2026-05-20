import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const { user } = useAuth();
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [exchangeRates, setExchangeRates] = useState({
        USD: 1.0,
        EUR: 0.92,
        INR: 83.50,
        GBP: 0.78,
        JPY: 155.20
    });

    useEffect(() => {
        if (user && user.preferred_currency) {
            setBaseCurrency(user.preferred_currency);
        }
    }, [user]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await api.get('/exchange-rates');
                if (res.data && res.data.length > 0) {
                    const ratesObj = {};
                    res.data.forEach(rate => {
                        ratesObj[rate.currency] = parseFloat(rate.rate);
                    });
                    setExchangeRates(prev => ({ ...prev, ...ratesObj }));
                }
            } catch (err) {
                console.warn("Failed to fetch rates, utilizing backup static exchange rates.", err);
            }
        };

        if (user) {
            fetchRates();
        }
    }, [user]);

    const convertAmount = (amount, from, to) => {
        const amt = parseFloat(amount);
        if (isNaN(amt)) return 0;
        if (from === to) return amt;

        const rates = exchangeRates;
        // Convert to USD base first, then to target currency
        const rateFrom = rates[from] || 1.0;
        const rateTo = rates[to] || 1.0;

        const amountInUSD = amt / rateFrom;
        return amountInUSD * rateTo;
    };

    const formatCurrency = (amount, curr = baseCurrency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ baseCurrency, setBaseCurrency, exchangeRates, convertAmount, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
