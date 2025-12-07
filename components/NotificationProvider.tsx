'use client';

import {
    createContext,
    useCallback,
    useContext,
    useState,
    useMemo,
    ReactNode,
    useEffect,
} from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

interface NotificationContextValue {
    notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return ctx;
}

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [items, setItems] = useState<Notification[]>([]);

    const notify = useCallback((type: NotificationType, message: string) => {
        setItems((prev) => {
            const id = Date.now() + Math.random();
            return [...prev, { id, type, message }];
        });
    }, []);

    // Auto-remove notifications after 4 seconds
    useEffect(() => {
        if (items.length === 0) return;

        const timers = items.map((item) =>
            setTimeout(() => {
                setItems((prev) => prev.filter((n) => n.id !== item.id));
            }, 4000)
        );

        return () => {
            timers.forEach((t) => clearTimeout(t));
        };
    }, [items]);

    const value = useMemo(
        () => ({
            notify,
        }),
        [notify]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '4rem',
                    right: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 60,
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            minWidth: '220px',
                            maxWidth: '320px',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            backgroundColor:
                                item.type === 'success'
                                    ? 'rgba(22,163,74,0.9)'
                                    : item.type === 'error'
                                        ? 'rgba(220,38,38,0.9)'
                                        : 'rgba(37,99,235,0.9)',
                            color: '#f9fafb',
                            fontSize: '0.9rem',
                            boxShadow: '0 10px 30px rgba(15,23,42,0.9)',
                        }}
                    >
                        {item.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}
