import { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import DashboardCard from '../DashboardCard';
import SubmitButton from '../../components/SubmitButton';

export default function ReserveForm({ 
    initialReserves = [], 
    selectedTrip, 
    onSave, 
    onCancel, 
    onDelete, 
    isPending, 
    apiError, 
    serverFieldErrors = {} 
}) {
    const tripMinDate = selectedTrip?.start_date ? selectedTrip.start_date.split('T')[0] : "";
    const tripMaxDate = selectedTrip?.end_date ? selectedTrip.end_date.split('T')[0] : "";

    const normalizedInitialReserves = initialReserves.length > 0
        ? initialReserves.map((reserve) => ({
            ...reserve,
            name: reserve.name ?? reserve.accommodation_name ?? '',
            address: reserve.address ?? reserve.accommodation_address ?? '',
            city: reserve.city ?? '',
            country: reserve.country ?? '',
            check_in_time: reserve.check_in_time ?? '',
            check_out_time: reserve.check_out_time ?? ''
        }))
        : [{ id: null, name: '', address: '', city: '', country: '', check_in_date: '', check_out_date: '', check_in_time: '', check_out_time: '' }];

    // Se a lista inicial estiver vazia (modo criação), insere logo um elemento em branco por omissão
    const [reservesList, setReservesList] = useState(normalizedInitialReserves);
    
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        if (Object.keys(serverFieldErrors).length > 0) setLocalErrors(serverFieldErrors);
    }, [serverFieldErrors]);

    // Compara via JSON stringify para saber se o botão deve ativar
    const hasChanges = 
        reservesList.length !== normalizedInitialReserves.length ||
        JSON.stringify(reservesList) !== JSON.stringify(normalizedInitialReserves);

    const nextOrder = reservesList.length + 1;

    // Atualiza o input específico dentro do array e limpa o erro correspondente
    const handleFieldChange = (index, field, value) => {
        const updatedList = [...reservesList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setReservesList(updatedList);
        
        setLocalErrors(prev => { 
            const copy = { ...prev }; 
            delete copy[`${field}-${index}`]; 
            return copy; 
        });
    };

    const handleAddAccommodation = () => {
        const newReserve = {
            id: null,
            name: '',
            address: '',
            city: '',
            country: '',
            check_in_date: '',
            check_out_date: '',
            check_in_time: '',
            check_out_time: ''
        };
        setReservesList([...reservesList, newReserve]);
    };

    const handleRemoveAccommodation = async (index, reserveItem) => {
        // Se já existe no banco de dados, chama a eliminação real via API
        if (reserveItem.id) {
            onDelete(reserveItem.id, reserveItem.accommodation_name || reserveItem.name);
            return;
        }
        // Se for um bloco novo em branco criado localmente, remove logo do array sem perguntar
        setReservesList(reservesList.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hasChanges) return;

        const errors = {};

        // Varre e valida todos os hotéis da lista dinamicamente
        reservesList.forEach((res, index) => {
            const normalizedName = (res.name ?? res.accommodation_name ?? '').trim();
            const normalizedAddress = (res.address ?? res.accommodation_address ?? '').trim();

            if (!normalizedName) errors[`name-${index}`] = "Accommodation name is required.";
            if (!normalizedAddress) errors[`address-${index}`] = "Address is required.";
            if (!res.check_in_date) errors[`check_in_date-${index}`] = "Check-in date is required.";
            if (!res.check_out_date) errors[`check_out_date-${index}`] = "Check-out date is required.";

            const tripStart = tripMinDate ? new Date(tripMinDate) : null;
            const tripEnd = tripMaxDate ? new Date(tripMaxDate) : null;
            const cIn = res.check_in_date ? new Date(res.check_in_date) : null;
            const cOut = res.check_out_date ? new Date(res.check_out_date) : null;

            if (tripStart && cIn < tripStart) errors[`check_in_date-${index}`] = "Cannot check-in before trip starts.";
            if (tripEnd && cOut > tripEnd) errors[`check_out_date-${index}`] = "Cannot check-out after trip ends.";
            if (cIn && cOut && cOut < cIn) errors[`check_out_date-${index}`] = "Check-out must be after check-in.";
        });

        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            return;
        }

        setLocalErrors({});
        onSave(reservesList.map(res => ({
            ...res,
            name: (res.name ?? res.accommodation_name ?? '').trim(),
            address: (res.address ?? res.accommodation_address ?? '').trim(),
            city: res.city?.trim() || null,
            country: res.country?.trim() || null
        })));
    };

    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onCancel} disabled={isPending}>
                    <IoClose size={18}/>
                </button>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="reserve-form-container">
                <h5>Manage Accommodations</h5>

                {/* Iterador dinâmico de componentes */}
                <div className="reserve-form-list" >
                    {reservesList.map((reserveItem, index) => (
                        <div key={index} className="reserve-form-segment-card">
                            
                            {/* Caixote do lixo no canto superior direito de cada cartão de hotel */}
                            <button 
                                type="button" 
                                className="btn-delete-icon"
                                onClick={() => handleRemoveAccommodation(index, reserveItem)} 
                                disabled={isPending}
                                title="Remove this accommodation"
                            >
                                <FaRegTrashAlt size={14} />
                            </button>

                            <span className="reserve-card-badge">Accommodation</span>

                            {/* Linha 1: Dados do Hotel */}
                            <div className="reserve-form-row">
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="Accommodation / Hotel Name *"
                                        className={localErrors[`name-${index}`] ? 'auth-input-error' : ''}
                                        value={reserveItem.name || reserveItem.accommodation_name || ''}
                                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {localErrors[`name-${index}`] && <p className="auth-form-error">{localErrors[`name-${index}`]}</p>}
                                </div>
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="Street Address *"
                                        className={localErrors[`address-${index}`] ? 'auth-input-error' : ''}
                                        value={reserveItem.address || reserveItem.accommodation_address || ''}
                                        onChange={(e) => handleFieldChange(index, 'address', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {localErrors[`address-${index}`] && <p className="auth-form-error">{localErrors[`address-${index}`]}</p>}
                                </div>
                            </div>

                            {/* Linha 2: Localização Geográfica */}
                            <div className="reserve-form-row">
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="City (Optional)"
                                        value={reserveItem.city || ''}
                                        onChange={(e) => handleFieldChange(index, 'city', e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="Country (Optional)"
                                        value={reserveItem.country || ''}
                                        onChange={(e) => handleFieldChange(index, 'country', e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            {/* Linha 3: Logística de Check-in */}
                            <div className="reserve-form-row">
                                <div className="reserve-input-group">
                                    <label>Check-in Date *</label>
                                    <input 
                                        type="date"
                                        className={localErrors[`check_in_date-${index}`] ? 'auth-input-error' : ''}
                                        value={reserveItem.check_in_date ? reserveItem.check_in_date.split('T')[0] : ''}
                                        min={tripMinDate}
                                        max={tripMaxDate}
                                        onChange={(e) => handleFieldChange(index, 'check_in_date', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {localErrors[`check_in_date-${index}`] && <p className="auth-form-error">{localErrors[`check_in_date-${index}`]}</p>}
                                </div>
                                <div className="reserve-input-group">
                                    <label>Check-in Time</label>
                                    <input 
                                        type="time"
                                        value={reserveItem.check_in_time || ''}
                                        onChange={(e) => handleFieldChange(index, 'check_in_time', e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            {/* Linha 4: Logística de Check-out */}
                            <div className="reserve-form-row">
                                <div className="reserve-input-group">
                                    <label>Check-out Date *</label>
                                    <input 
                                        type="date"
                                        className={localErrors[`check_out_date-${index}`] ? 'auth-input-error' : ''}
                                        value={reserveItem.check_out_date ? reserveItem.check_out_date.split('T')[0] : ''}
                                        min={(reserveItem.check_in_date ? reserveItem.check_in_date.split('T')[0] : '') || tripMinDate}
                                        max={tripMaxDate}
                                        onChange={(e) => handleFieldChange(index, 'check_out_date', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {localErrors[`check_out_date-${index}`] && <p className="auth-form-error">{localErrors[`check_out_date-${index}`]}</p>}
                                </div>
                                <div className="reserve-input-group">
                                    <label>Check-out Time</label>
                                    <input 
                                        type="time"
                                        value={reserveItem.check_out_time || ''}
                                        onChange={(e) => handleFieldChange(index, 'check_out_time', e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RODAPÉ */}
                <div className="reserve-form-bottom-actions">
                    {/* Adiciona o próximo bloco de hotel dinamicamente no formulário */}
                    <button 
                        type="button" 
                        className="btn-dashed-add" 
                        onClick={handleAddAccommodation}
                        disabled={isPending}
                    >
                        <FaPlus size={12} /> Add Accommodation
                    </button>

                    {apiError && <div className="auth-form-error api-error-banner">{apiError}</div>}
                    
                    <div className="reserve-form-actions">
                        <SubmitButton
                            isPending={isPending}
                            hasChanges={hasChanges}
                            label="Save Changes"
                            pendingLabel="Saving..."
                        />
                        <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>Cancel</button>
                    </div>
                </div>
            </form>
        </DashboardCard>
    );
}
