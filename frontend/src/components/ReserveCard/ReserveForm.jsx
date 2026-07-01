import { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaPlus } from 'react-icons/fa';
import DashboardCard from '../DashboardCard';
import SubmitButton from '../../components/SubmitButton';
import { useConfirm } from '../../context/ConfirmContext';

export default function ReserveForm({ 
    reserve, 
    selectedTrip, 
    onSave, 
    onCreateNew,
    onCancel, 
    onDelete, 
    isPending, 
    apiError, 
    serverFieldErrors = {} 
}) {
    const confirm = useConfirm();
    const tripMinDate = selectedTrip?.start_date ? selectedTrip.start_date.split('T')[0] : "";
    const tripMaxDate = selectedTrip?.end_date ? selectedTrip.end_date.split('T')[0] : "";

    // Inicializa lista de reservas: se é edição de uma existente, começa com essa; se é criação, começa vazio
    const [reserves, setReserves] = useState(reserve ? [reserve] : []);
    const [localErrors, setLocalErrors] = useState({});
    const [editedFields, setEditedFields] = useState({});

    // Detecção de alterações
    const hasChanges = reserve 
        ? reserves.length > 0 && JSON.stringify(reserves) !== JSON.stringify([reserve])
        : reserves.length > 0;

    const getErrorKey = (field, reserveIndex) => {
        return `reserve-${reserveIndex}-${field}`;
    };

    const handleFieldChange = (index, field, value) => {
        const updatedReserves = [...reserves];
        updatedReserves[index] = { ...updatedReserves[index], [field]: value };
        setReserves(updatedReserves);
        
        const errorKey = getErrorKey(field, index);
        setLocalErrors(prev => {
            const copy = { ...prev };
            delete copy[errorKey];
            return copy;
        });
        setEditedFields(prev => ({ ...prev, [errorKey]: true }));
    };

    const getFieldError = (field, reserveIndex) => {
        const errorKey = getErrorKey(field, reserveIndex);
        if (localErrors[errorKey]) return localErrors[errorKey];
        if (editedFields[errorKey]) return null;
        return serverFieldErrors[errorKey] || null;
    };

    const handleAddSegment = () => {
        const newReserve = {
            id: null,
            accommodation_name: '',
            accommodation_id: null,
            address: '',
            accommodation_address: '',
            city: '',
            country: '',
            check_in_date: '',
            check_out_date: '',
            check_in_time: '',
            check_out_time: ''
        };
        setReserves([...reserves, newReserve]);
    };

    const handleRemoveSegment = async (index) => {
        // Se é edit mode com só uma reserva, não deixa remover (use delete button)
        if (reserve && reserves.length === 1) return;
        
        const confirmed = await confirm(
            "Delete Accommodation?",
            "Do you want to remove this accommodation? This action can't be undone."
        );
        
        if (!confirmed) return;
        setReserves(reserves.filter((_, i) => i !== index));
    };

    const validateReserves = () => {
        const errors = {};
        let isValid = true;

        reserves.forEach((res, idx) => {
            const name = res.accommodation_name || res.name || '';
            const address = res.address || res.accommodation_address || '';
            const checkIn = res.check_in_date ? res.check_in_date.split('T')[0] : '';
            const checkOut = res.check_out_date ? res.check_out_date.split('T')[0] : '';

            if (!name.trim()) {
                errors[getErrorKey('accommodation_name', idx)] = "Accommodation name is required.";
                isValid = false;
            }
            if (!address.trim()) {
                errors[getErrorKey('address', idx)] = "Address is required.";
                isValid = false;
            }
            if (!checkIn) {
                errors[getErrorKey('check_in_date', idx)] = "Check-in date is required.";
                isValid = false;
            }
            if (!checkOut) {
                errors[getErrorKey('check_out_date', idx)] = "Check-out date is required.";
                isValid = false;
            }

            const tripStart = tripMinDate ? new Date(tripMinDate) : null;
            const tripEnd = tripMaxDate ? new Date(tripMaxDate) : null;
            const cIn = checkIn ? new Date(checkIn) : null;
            const cOut = checkOut ? new Date(checkOut) : null;

            if (tripStart && cIn < tripStart) {
                errors[getErrorKey('check_in_date', idx)] = "Cannot check-in before trip starts.";
                isValid = false;
            }
            if (tripEnd && cOut > tripEnd) {
                errors[getErrorKey('check_out_date', idx)] = "Cannot check-out after trip ends.";
                isValid = false;
            }
            if (cIn && cOut && cOut < cIn) {
                errors[getErrorKey('check_out_date', idx)] = "Check-out must be after check-in.";
                isValid = false;
            }
        });

        if (!isValid) {
            setLocalErrors(errors);
        }
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!hasChanges) return;
        if (!validateReserves()) return;

        setEditedFields({});
        setLocalErrors({});

        // Se é edição de uma reserva só, passa a reserva singular
        if (reserve && reserves.length === 1) {
            onSave({
                accommodation_name: reserves[0].accommodation_name || reserves[0].name,
                name: reserves[0].accommodation_name || reserves[0].name,
                accommodation_id: reserves[0].accommodation_id,
                address: reserves[0].address || reserves[0].accommodation_address,
                accommodation_address: reserves[0].address || reserves[0].accommodation_address,
                city: reserves[0].city || null,
                country: reserves[0].country || null,
                check_in_date: reserves[0].check_in_date,
                check_out_date: reserves[0].check_out_date,
                check_in_time: reserves[0].check_in_time || null,
                check_out_time: reserves[0].check_out_time || null
            });
        } else {
            // Se é criação com múltiplas reservas, passa todas
            onSave(reserves.map(r => ({
                accommodation_name: r.accommodation_name || r.name,
                accommodation_id: r.accommodation_id,
                address: r.address || r.accommodation_address,
                city: r.city || null,
                country: r.country || null,
                check_in_date: r.check_in_date,
                check_out_date: r.check_out_date,
                check_in_time: r.check_in_time || null,
                check_out_time: r.check_out_time || null
            })));
        }
    };

    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onCancel} disabled={isPending} title="Close form">
                    <IoClose size={18}/>
                </button>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="reserve-form-container">
                
                <h5 className="reserve-form-title">
                    {reserve ? 'Manage Accommodation Reserve' : 'Add Accommodation Reserves'}
                </h5>

                {/* RENDERIZAR SEGMENTOS DE ACOMODAÇÃO */}
                {reserves.map((res, index) => {
                    const name = res.accommodation_name || res.name || '';
                    const address = res.address || res.accommodation_address || '';
                    const city = res.city || '';
                    const country = res.country || '';
                    const checkIn = res.check_in_date ? (typeof res.check_in_date === 'string' ? res.check_in_date.split('T')[0] : res.check_in_date) : '';
                    const checkOut = res.check_out_date ? (typeof res.check_out_date === 'string' ? res.check_out_date.split('T')[0] : res.check_out_date) : '';
                    const checkInTime = res.check_in_time || '';
                    const checkOutTime = res.check_out_time || '';

                    return (
                        <div key={index} className="reserve-segment-wrapper">
                            <div className="reserve-segment-header">
                                <span className="segment-card-badge">Accommodation #{index + 1}</span>
                                {(reserves.length > 1 || !reserve) && (
                                    <button 
                                        type="button" 
                                        className="btn-delete-icon" 
                                        onClick={() => handleRemoveSegment(index)} 
                                        disabled={isPending}
                                        title="Delete this accommodation"
                                    >
                                        <FaRegTrashAlt size={14} />
                                    </button>
                                )}
                                {reserve && reserves.length === 1 && (
                                    <button 
                                        type="button" 
                                        className="btn-delete-icon" 
                                        onClick={onDelete} 
                                        disabled={isPending}
                                        title="Delete this accommodation reservation"
                                    >
                                        <FaRegTrashAlt size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="reserve-form-row">
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="Accommodation / Hotel Name *"
                                        className={getFieldError('accommodation_name', index) ? 'auth-input-error' : ''}
                                        value={name}
                                        onChange={(e) => handleFieldChange(index, 'accommodation_name', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {getFieldError('accommodation_name', index) && <p className="auth-form-error">{getFieldError('accommodation_name', index)}</p>}
                                </div>
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="Street Address *"
                                        className={getFieldError('address', index) ? 'auth-input-error' : ''}
                                        value={address}
                                        onChange={(e) => handleFieldChange(index, 'address', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {getFieldError('address', index) && <p className="auth-form-error">{getFieldError('address', index)}</p>}
                                </div>
                            </div>

                            <div className="reserve-form-row">
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="City (Optional)"
                                        value={city}
                                        onChange={(e) => handleFieldChange(index, 'city', e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="reserve-input-group">
                                    <input 
                                        type="text"
                                        placeholder="Country (Optional)"
                                        value={country}
                                        onChange={(e) => handleFieldChange(index, 'country', e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="reserve-form-row">
                                <div className="reserve-form-column">
                                    <div className="reserve-input-group">
                                        <label className="reserve-input-label">Check-in Date *</label>
                                        <input 
                                            type="date"
                                            className={getFieldError('check_in_date', index) ? 'auth-input-error' : ''}
                                            value={checkIn}
                                            min={tripMinDate}
                                            max={tripMaxDate}
                                            onChange={(e) => handleFieldChange(index, 'check_in_date', e.target.value)}
                                            disabled={isPending}
                                        />
                                        {getFieldError('check_in_date', index) && <p className="auth-form-error">{getFieldError('check_in_date', index)}</p>}
                                    </div>
                                    <div className="reserve-input-group">
                                        <label className="reserve-input-label">Check-in Time</label>
                                        <input 
                                            type="time"
                                            value={checkInTime}
                                            onChange={(e) => handleFieldChange(index, 'check_in_time', e.target.value)}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                                
                                <div className="reserve-form-column">
                                    <div className="reserve-input-group">
                                        <label className="reserve-input-label">Check-out Date *</label>
                                        <input 
                                            type="date"
                                            className={getFieldError('check_out_date', index) ? 'auth-input-error' : ''}
                                            value={checkOut}
                                            min={checkIn || tripMinDate}
                                            max={tripMaxDate}
                                            onChange={(e) => handleFieldChange(index, 'check_out_date', e.target.value)}
                                            disabled={isPending}
                                        />
                                        {getFieldError('check_out_date', index) && <p className="auth-form-error">{getFieldError('check_out_date', index)}</p>}
                                    </div>
                                    <div className="reserve-input-group">
                                        <label className="reserve-input-label">Check-out Time</label>
                                        <input 
                                            type="time"
                                            value={checkOutTime}
                                            onChange={(e) => handleFieldChange(index, 'check_out_time', e.target.value)}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Em create mode adiciona segmento local; em edit mode oferece atalho para criar nova accommodation */}
                {!reserve ? (
                    <button type="button" className="btn-dashed-add" onClick={handleAddSegment} disabled={isPending}>
                        <FaPlus size={12} /> Add Accommodation Reserve (Segment #{reserves.length + 1})
                    </button>
                ) : (
                    <button type="button" className="btn-dashed-add" onClick={onCreateNew} disabled={isPending}>
                        <FaPlus size={12} /> Add New Accommodation
                    </button>
                )}

                {/* RODAPÉ */}
                <div className="flight-form-actions-wrapper">
                    {apiError && <div className="auth-form-error api-error-banner"> {apiError}</div>}
                    <div className="flight-form-actions">
                        
                        {/* SUBMIT BUTTON REUTILIZÁVEL */}
                        <SubmitButton
                            isPending={isPending}
                            hasChanges={hasChanges}
                            label={reserve ? 'Save Changes' : 'Add Reservation'}
                            pendingLabel={reserve ? 'Saving...' : 'Adding...'}
                        />
                        <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>Cancel</button>
                    </div>
                </div>
            </form>
        </DashboardCard>
    );
}
