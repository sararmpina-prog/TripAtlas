import Toast from './Toast';
import '../styles/Toast.css';

export default function ToastContainer({ toasts = [], onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast 
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
}
