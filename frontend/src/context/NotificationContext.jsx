import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef(null);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            const unread = res.data.filter(n => !n.is_read).length;
            
            // If new unread notification, trigger a visual alert toast!
            if (unread > unreadCount && notifications.length > 0) {
                const newest = res.data[0];
                if (newest && !newest.is_read) {
                    toast(newest.message, {
                        icon: newest.message.includes('🚨') ? '🚨' : '⚠️',
                        style: {
                            borderRadius: '12px',
                            background: '#0f172a',
                            color: '#f8fafc',
                            border: '1px solid #1e293b'
                        },
                        duration: 5000
                    });
                }
            }
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to query notifications feed", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/mark-read/${id}`);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(prev - 1, 0));
        } catch (err) {
            console.error("Failed to clear notification item", err);
        }
    };

    const clearAll = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read', {
                style: {
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #1e293b'
                }
            });
        } catch (err) {
            console.error("Failed to clear notifications log", err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Poll API every 30 seconds
            intervalRef.current = setInterval(fetchNotifications, 30000);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [token]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
