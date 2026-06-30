import { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import DashboardCard from '../DashboardCard';

export default function ReserveForm({ 
    reserve, 
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

    const [name, setName] = useState(reserve?.accommodation_name || reserve?.name || '');
    const [address, setAddress] = useState(reserve?.address || reserve?.accommodation_address || '');
    const [city, setCity] = useState(reserve?.city || '');
    const [country, setCountry] = useState(reserve?.country || '');
    
    const [checkIn, setCheckIn] = useState(reserve?.check_in_date ? reserve.check_in_date.split('T')[0] : '');
    const [checkOut, setCheckOut] = useState(reserve?.check_out_date ? reserve.check_out_date.split('T')[0] : '');
    const [checkInTime, setCheckInTime] = useState(reserve?.check_in_time || '');
    const [checkOutTime, setCheckOutTime] = useState(reserve?.check_out_time || '');
    
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        if (Object.keys(serverFieldErrors).length > 0) setLocalErrors(serverFieldErrors);
    }, [serverFieldErrors]);

    const handleInputChange = (field, value, setter) => {
        setter(value);
        setLocalErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        if (!name.trim()) errors.name = "Accommodation name is required.";
        if (!address.trim()) errors.address = "Address is required.";
        if (!checkIn) errors.check_in_date = "Check-in date is required.";
        if (!checkOut) errors.check_out_date = "Check-out date is required.";

        const tripStart = tripMinDate ? new Date(tripMinDate) : null;
        const tripEnd = tripMaxDate ? new Date(tripMaxDate) : null;
        const cIn = checkIn ? new Date(checkIn) : null;
        const cOut = checkOut ? new Date(checkOut) : null;

        if (tripStart && cIn < tripStart) errors.check_in_date = "Cannot check-in before trip starts.";
        if (tripEnd && cOut > tripEnd) errors.check_out_date = "Cannot check-out after trip ends.";
        if (cIn && cOut && cOut < cIn) errors.check_out_date = "Check-out must be after check-in.";

        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            return;
        }

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

                <button type="button" className="btn-dashed-add" onClick={handleAddSegment}>
                    <FaPlus size={12} /> Add Accomodation Reserve (Segment #{nextOrder})
                </button>

                {/* RODAPÉ */}
                <div className="flight-form-actions-wrapper">
                    {apiError && <div className="auth-form-error api-error-banner"> {apiError}</div>}
                    <div className="flight-form-actions">
                        <button type="submit" className="btn-base btn-orange" disabled={isPending}>
                            {isPending ? 'Syncing Reservation...' : 'Save Reservation'}
                        </button>
                        <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>Cancel</button>
                    </div>
                </div>
            </form>
        </DashboardCard>
    );
}
