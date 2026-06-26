import { createContext, useState, useContext } from 'react';
import InfoCard from '../components/InfoCard';
import '../styles/ConfirmContext.css';

const ConfirmContext = createContext();

// Modal de confirmação global para ações críticas
export function ConfirmProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null
    });

    const askConfirmation = (title, message) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    resolve(true); // Utilizador clicou em Confirmar
                },
                onCancel: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                },
            });
        });
    };

    const handleCancel = () => {
        modalState.onCancel?.();
    };

    return (
        <ConfirmContext.Provider value={askConfirmation}>
            {children}
            {modalState.isOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-content">
                        <InfoCard>
                            <h3 className="confirm-modal-title heading-dark">{modalState.title}</h3>
                            <p className='subtitle subtitle-dark'>{modalState.message}</p>
                            <div className="confirm-modal-actions">
                                <button type="button" className="btn-base" onClick={handleCancel}>Cancel</button>
                                <button type="button" className="btn-base btn-orange" onClick={modalState.onConfirm}>Confirm</button>
                            </div>
                        </InfoCard>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export const useConfirm = () => useContext(ConfirmContext);
