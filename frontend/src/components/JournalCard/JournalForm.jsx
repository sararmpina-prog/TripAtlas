import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import DashboardCard from '../DashboardCard';
import { useConfirm } from '../../context/ConfirmContext';

export default function JournalForm({ currentEntries = [], onSave, onCancel, isPending, apiError }) {
    const confirm = useConfirm();
    // Guarda as notas (sejam vindas da AI ou manuais) num estado local elástico
    const [notes, setNotes] = useState(currentEntries.length > 0 ? [...currentEntries] : [{ id: null, text: '' }]);

    const handleTextChange = (index, value) => {
        const updated = [...notes];
        updated[index].text = value;
        setNotes(updated);
    };

    const handleAddLine = () => {
        // Adiciona uma linha em branco para escrita manual
        setNotes([...notes, { id: null, text: '' }]);
    };

    const handleRemoveLine = async (index) => {
        const confirmed = await confirm('flight'); // Reutiliza o teu template genérico de aviso
        if (!confirmed) return;

        setNotes(notes.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filtra para não enviar linhas totalmente vazias para o servidor
        const cleanNotes = notes.filter(n => n.text.trim() !== '');
        onSave(cleanNotes);
    };

    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onCancel} disabled={isPending}>
                    <IoClose size={18}/>
                </button>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="flight-form-container">
                <h5>Manage Travel Journal</h5>

                <div className="flight-form-list">
                    {notes.map((note, index) => (
                        <div key={note.id || index} className="flight-form-row">
                            <div className="flight-input-group">
                                <input 
                                    type="text"
                                    placeholder="Write a note or edit AI suggestion..."
                                    value={note.text || ''}
                                    onChange={(e) => handleTextChange(index, e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            
                            <button 
                                type="button" 
                                className="btn-delete-segment" 
                                onClick={() => handleRemoveLine(index)}
                                title="Delete entry"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Botão para o utilizador escrever mais coisas à mão */}
                <button type="button" className="btn-dashed-add" onClick={handleAddLine}>
                    <FaPlus size={12} /> Add New Note Line
                </button>

                <div className="flight-form-actions-wrapper">
                    {apiError && <div className="auth-form-error api-error-banner"> {apiError}</div>}
                    <div className="flight-form-actions">
                        <button type="submit" className="btn-base btn-orange" disabled={isPending}>
                            {isPending ? 'Saving Journal...' : 'Save Configuration'}
                        </button>
                        <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>Cancel</button>
                    </div>
                </div>
            </form>
        </DashboardCard>
    );
}
