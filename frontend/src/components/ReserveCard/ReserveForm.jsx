import { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
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

    const [name, setName] = useState(reserve?.accommodation_name || reserve?.name || '');
    const [address, setAddress] = useState(reserve?.address || reserve?.accommodation_address || '');
    const [city, setCity] = useState(reserve?.city || '');
    const [country, setCountry] = useState(reserve?.country || '');
    
    const [checkIn, setCheckIn] = useState(reserve?.check_in_date ? reserve.check_in_date.split('T')[0] : '');
    const [checkOut, setCheckOut] = useState(reserve?.check_out_date ? reserve.check_out_date.split('T')[0] : '');
    const [checkInTime, setCheckInTime] = useState(reserve?.check_in_time || '');
    const [checkOutTime, setCheckOutTime] = useState(reserve?.check_out_time || '');
    
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
        onSave({
            name: name.trim(),
            address: address.trim(),
            city: city.trim() || null,
            country: country.trim() || null,
            check_in_date: checkIn,
            check_out_date: checkOut,
            check_in_time: checkInTime || null,
            check_out_time: checkOutTime || null
        });
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
                
                {reserve && (
                    <button 
                        type="button" 
                        className="btn-delete-icon" 
                        onClick={onDelete} 
                        disabled={isPending}
                        title="Delete this entire accommodation reservation"
                    >
                        <FaRegTrashAlt size={14} />
                    </button>
                )}

                <h5 className="reserve-form-title">
                    {reserve ? 'Manage Accommodation Reserve' : 'Add New Accommodation Reserve'}
                </h5>

                <div className="reserve-form-row">
                    <div className="reserve-input-group">
                        <input 
                            type="text"
                            placeholder="Accommodation / Hotel Name *"
                            className={localErrors.name ? 'auth-input-error' : ''}
                            value={name}
                            onChange={(e) => handleInputChange('name', e.target.value, setName)}
                            disabled={isPending}
                        />
                        {localErrors.name && <p className="auth-form-error">{localErrors.name}</p>}
                    </div>
                    <div className="reserve-input-group">
                        <input 
                            type="text"
                            placeholder="Street Address *"
                            className={localErrors.address ? 'auth-input-error' : ''}
                            value={address}
                            onChange={(e) => handleInputChange('address', e.target.value, setAddress)}
                            disabled={isPending}
                        />
                        {localErrors.address && <p className="auth-form-error">{localErrors.address}</p>}
                    </div>
                </div>

                <div className="reserve-form-row">
                    <div className="reserve-input-group">
                        <input 
                            type="text"
                            placeholder="City (Optional)"
                            value={city}
                            onChange={(e) => handleInputChange('city', e.target.value, setCity)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="reserve-input-group">
                        <input 
                            type="text"
                            placeholder="Country (Optional)"
                            value={country}
                            onChange={(e) => handleInputChange('country', e.target.value, setCountry)}
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
                                className={localErrors.check_in_date ? 'auth-input-error' : ''}
                                value={checkIn}
                                min={tripMinDate}
                                max={tripMaxDate}
                                onChange={(e) => handleInputChange('check_in_date', e.target.value, setCheckIn)}
                                disabled={isPending}
                            />
                            {localErrors.check_in_date && <p className="auth-form-error">{localErrors.check_in_date}</p>}
                        </div>
                        <div className="reserve-input-group">
                            <label className="reserve-input-label">Check-in Time</label>
                            <input 
                                type="time"
                                value={checkInTime}
                                onChange={(e) => handleInputChange('check_in_time', e.target.value, setCheckInTime)}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    
                    <div className="reserve-form-column">
                        <div className="reserve-input-group">
                            <label className="reserve-input-label">Check-out Date *</label>
                            <input 
                                type="date"
                                className={localErrors.check_out_date ? 'auth-input-error' : ''}
                                value={checkOut}
                                min={checkIn || tripMinDate}
                                max={tripMaxDate}
                                onChange={(e) => handleInputChange('check_out_date', e.target.value, setCheckOut)}
                                disabled={isPending}
                            />
                            {localErrors.check_out_date && <p className="auth-form-error">{localErrors.check_out_date}</p>}
                        </div>
                        <div className="reserve-input-group">
                            <label className="reserve-input-label">Check-out Time</label>
                            <input 
                                type="time"
                                value={checkOutTime}
                                onChange={(e) => handleInputChange('check_out_time', e.target.value, setCheckOutTime)}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </div>

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
