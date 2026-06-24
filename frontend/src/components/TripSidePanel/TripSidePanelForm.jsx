import { useState, useEffect } from 'react';

export default function TripSidePanelForm({ 
    selectedTrip, 
    onSave, 
    onCancel, 
    isPending, 
    apiError, 
    serverFieldErrors = {} 
}) {
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [localErrors, setLocalErrors] = useState({});

    // Sincroniza dados para edição
    useEffect(() => {
        if (selectedTrip) {
            setTitle(selectedTrip.title || '');
            setDestination(selectedTrip.destination || '');
            setDescription(selectedTrip.description || '');
            setStartDate(selectedTrip.start_date ? selectedTrip.start_date.split('T')[0] : '');
            setEndDate(selectedTrip.end_date ? selectedTrip.end_date.split('T')[0] : '');
        }
    }, [selectedTrip]);

    // Sincroniza erros do servidor com o estado do formulário
    useEffect(() => {
        if (Object.keys(serverFieldErrors).length > 0) {
            setLocalErrors(serverFieldErrors);
        }
    }, [serverFieldErrors]);

    // Função utilitária para atualizar o campo e limpar o erro dele na hora
    const handleInputChange = (field, value, setter) => {
        setter(value);
        setLocalErrors(prev => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        if (!title.trim()) errors.title = "Trip title is required.";
        if (!destination.trim()) errors.destination = "Destination is required.";
        if (!startDate) errors.start_date = "Start date is required.";
        if (!endDate) errors.end_date = "End date is required.";

        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            return;
        }

        setLocalErrors({});
        onSave({
            title: title.trim(),
            destination: destination.trim(),
            start_date: startDate,
            end_date: endDate,
            description: description.trim() || null
        });
    };

    return (
        <div className="dashboard-sidepanel">
            <p className="sidepanel-eyebrow">{selectedTrip ? 'Edit Trip Details' : 'Create New Adventure'}</p>

            <form onSubmit={handleSubmit} noValidate className="sidepanel-form-flow">
                
                <label className="sidepanel-trip-picker">
                    <span>Trip Title *</span>
                    <input 
                        type="text" 
                        placeholder='Summer Vacation in Lisbon'
                        className={localErrors.title ? 'auth-input-error' : ''}
                        value={title} 
                        onChange={(e) => handleInputChange('title', e.target.value, setTitle)} 
                        disabled={isPending} 
                    />
                    {localErrors.title && <p className="auth-form-error">{localErrors.title}</p>}
                </label>

                <label className="sidepanel-trip-picker">
                    <span>Destination *</span>
                    <input 
                        type="text" 
                        placeholder='Lisbon, Portugal'
                        className={localErrors.destination ? 'auth-input-error' : ''}
                        value={destination} 
                        onChange={(e) => handleInputChange('destination', e.target.value, setDestination)} 
                        disabled={isPending} 
                    />
                    {localErrors.destination && <p className="auth-form-error">{localErrors.destination}</p>}
                </label>

                <label className="sidepanel-trip-picker">
                    <span>Start Date *</span>
                    <input 
                        type="date" 
                        className={localErrors.start_date ? 'auth-input-error' : ''}
                        value={startDate} 
                        onChange={(e) => handleInputChange('start_date', e.target.value, setStartDate)} 
                        disabled={isPending} 
                    />
                    {localErrors.start_date && <p className="auth-form-error">{localErrors.start_date}</p>}
                </label>

                <label className="sidepanel-trip-picker">
                    <span>End Date *</span>
                    <input 
                        type="date" 
                        className={localErrors.end_date ? 'auth-input-error' : ''}
                        value={endDate} 
                        min={startDate}
                        onChange={(e) => handleInputChange('end_date', e.target.value, setEndDate)} 
                        disabled={isPending} 
                    />
                    {localErrors.end_date && <p className="auth-form-error">{localErrors.end_date}</p>}
                </label>

                <label className="sidepanel-trip-picker">
                    <span>Description (Optional)</span>
                    <textarea 
                        className={localErrors.description ? 'auth-input-error' : ''}
                        value={description} 
                        onChange={(e) => handleInputChange('description', e.target.value, setDescription)} 
                        disabled={isPending} 
                    />
                    {localErrors.description && <p className="auth-form-error">{localErrors.description}</p>}
                </label>

                {apiError && (
                    <p className="sidepanel-trip-picker-error">
                        {apiError}
                    </p>
                )}

                <div className="dashboard-sidepanel-buttons"> 
                    <button type="submit" className="btn-base btn-orange" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
