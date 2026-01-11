import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: '#ecfdf5',
        error: '#fef2f2',
        info: '#eff6ff',
        warning: '#fffbeb'
    };
    const borderColors = {
        success: '#34d399',
        error: '#f87171',
        info: '#60a5fa',
        warning: '#fbbf24'
    };
    const textColors = {
        success: '#065f46',
        error: '#991b1b',
        info: '#1e40af',
        warning: '#92400e'
    };
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };

    return (
        <div className="animate-slide-in-right" style={{
            minWidth: '300px',
            background: bgColors[type] || 'white',
            borderLeft: `4px solid ${borderColors[type] || '#ccc'}`,
            color: textColors[type] || '#333',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'relative',
            opacity: 1,
            transition: 'all 0.3s ease',
            pointerEvents: 'auto'
        }}>
            <i className={icons[type]} style={{ fontSize: '1.2rem' }}></i>
            <div style={{ flex: 1, fontWeight: '500', fontSize: '0.9rem' }}>{message}</div>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: '0 0.25rem' }}>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none' // allow clicking through container
            }}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out forwards;
                }
            `}</style>
        </ToastContext.Provider>
    );
};
