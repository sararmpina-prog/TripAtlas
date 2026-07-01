import { createContext, useState, useContext, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    // Função elástica para disparar um aviso de qualquer parte do site
    // Aceita o tipo: 'success' | 'error' | 'info' | 'warning'
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9); // ID único seguro

        setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

        // Remove automaticamente o Toast após 4 segundos
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    // Permite fechar manualmente clicando no "X"
    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            {/* O Container fica sempre à escuta para desenhar os alertas no ecrã */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
