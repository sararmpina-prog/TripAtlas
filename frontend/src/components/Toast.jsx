import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import '../styles/Toast.css';

export default function Toast({ id, message, type = 'success', onRemove }) {
    
    // Mapeamento de ícones por tipo de alerta
    const icons = {
        success: <FaCheckCircle className="toast-icon success" />,
        error: <FaExclamationCircle className="toast-icon error" />,
        info: <FaInfoCircle className="toast-icon info" />,
        warning: <FaExclamationTriangle className="toast-icon warning" />
    };

    // Mapeamento de títulos automáticos amigáveis
    const titles = {
        success: 'Success',
        error: 'Error',
        info: 'Information',
        warning: 'Warning'
    };

    return (
        <div className={`toast-item ${type}`}>
            {icons[type]}
            
            <div className="toast-message">
                <h3 className={`toast-title ${type}`}>{titles[type]}</h3>
                <p>{message}</p>
            </div>

            <button 
                type="button" 
                className="toast-close-btn" 
                onClick={() => onRemove(id)}
                title="Dismiss notification"
            >
                <FaTimes size={12} />
            </button>
        </div>
    );
}
