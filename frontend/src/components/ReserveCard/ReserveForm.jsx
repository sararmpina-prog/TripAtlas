import { useMemo, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { FaRegTrashAlt, FaPlus } from "react-icons/fa";

import DashboardCard from '../DashboardCard';
import SubmitButton from '../../components/SubmitButton';
import { useConfirm } from '../../context/ConfirmContext';

const EMPTY_RESERVE = {
    id: null,
    accommodation_id: null,
    accommodation_name: '',
    address: '',
    city: '',
    country: '',
    check_in_date: '',
    check_out_date: '',
    check_in_time: '',
    check_out_time: ''
};

function normalizeReserve(reserve) {
    if (!reserve) return { ...EMPTY_RESERVE };

    return {
        id: reserve.id ?? null,
        accommodation_id: reserve.accommodation_id ?? null,
        accommodation_name: reserve.accommodation_name || reserve.name || '',
        address: reserve.address || reserve.accommodation_address || '',
        city: reserve.city || '',
        country: reserve.country || '',
        check_in_date: reserve.check_in_date ? String(reserve.check_in_date).split('T')[0] : '',
        check_out_date: reserve.check_out_date ? String(reserve.check_out_date).split('T')[0] : '',
        check_in_time: reserve.check_in_time || '',
        check_out_time: reserve.check_out_time || ''
    };
}

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
    const confirm = useConfirm();
    const tripMinDate = selectedTrip?.start_date ? selectedTrip.start_date.split('T')[0] : "";
    const tripMaxDate = selectedTrip?.end_date ? selectedTrip.end_date.split('T')[0] : "";

    const initialReserves = useMemo(
        () => (reserve ? [normalizeReserve(reserve)] : [{ ...EMPTY_RESERVE }]),
        [reserve]
    );

    const [reserves, setReserves] = useState(initialReserves);
    const [localErrors, setLocalErrors] = useState({});
    const [editedFields, setEditedFields] = useState({});

    const hasChanges = JSON.stringify(reserves) !== JSON.stringify(initialReserves);

    const getErrorKey = (field, index) => `reserve-${index}-${field}`;

    const getFieldError = (field, index) => {
        const key = getErrorKey(field, index);
        if (localErrors[key]) return localErrors[key];
        if (editedFields[key]) return null;
        return serverFieldErrors[key] || null;
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...reserves];
        updated[index] = { ...updated[index], [field]: value };
        setReserves(updated);

        const key = getErrorKey(field, index);
        setLocalErrors((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
        setEditedFields((prev) => ({ ...prev, [key]: true }));
    };

    const handleAddSegment = () => {
        setReserves((prev) => [...prev, { ...EMPTY_RESERVE }]);
    };

    const handleRemoveSegment = async (index) => {
        if (reserves.length === 1) return;

        if (reserves[index]?.id) {
            return;
        }

        const confirmed = await confirm(
            'Remove Accommodation?',
            'Do you want to remove this new accommodation segment before saving?'
        );
        if (!confirmed) return;

        setReserves((prev) => prev.filter((_, i) => i !== index));
    };

    const validateReserves = () => {
        const newErrors = {};
        let valid = true;

        reserves.forEach((item, index) => {
            if (!item.accommodation_name.trim()) {
                newErrors[getErrorKey('accommodation_name', index)] = 'Accommodation name is required.';
                valid = false;
            }

            if (!item.address.trim()) {
                newErrors[getErrorKey('address', index)] = 'Address is required.';
                valid = false;
            }

            if (!item.check_in_date) {
                newErrors[getErrorKey('check_in_date', index)] = 'Check-in date is required.';
                valid = false;
            }

            if (!item.check_out_date) {
                newErrors[getErrorKey('check_out_date', index)] = 'Check-out date is required.';
                valid = false;
            }

            const tripStart = tripMinDate ? new Date(tripMinDate) : null;
            const tripEnd = tripMaxDate ? new Date(tripMaxDate) : null;
            const checkInDate = item.check_in_date ? new Date(item.check_in_date) : null;
            const checkOutDate = item.check_out_date ? new Date(item.check_out_date) : null;

            if (tripStart && checkInDate && checkInDate < tripStart) {
                newErrors[getErrorKey('check_in_date', index)] = 'Cannot check-in before trip starts.';
                valid = false;
            }

            if (tripEnd && checkOutDate && checkOutDate > tripEnd) {
                newErrors[getErrorKey('check_out_date', index)] = 'Cannot check-out after trip ends.';
                valid = false;
            }

            if (checkInDate && checkOutDate && checkOutDate < checkInDate) {
                newErrors[getErrorKey('check_out_date', index)] = 'Check-out must be after check-in.';
                valid = false;
            }
        });

        setLocalErrors(newErrors);
        return valid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!hasChanges) return;
        if (!validateReserves()) return;

        setEditedFields({});
        setLocalErrors({});
        onSave(reserves);
    };

    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onCancel} disabled={isPending} title="Close form">
                    <IoClose size={18} />
                </button>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="reserve-form-container">
                <h5 className="reserve-form-title">Manage Accommodation Reserve</h5>

                {reserves.map((item, index) => (
                    <div key={`${item.id ?? 'new'}-${index}`} className="reserve-segment-wrapper">
                        <div className="reserve-segment-header">
                            <span className="segment-card-badge">Accommodation</span>

                            {item.id ? (
                                reserves.length === 1 && reserve ? (
                                    <button
                                        type="button"
                                        className="btn-delete-icon"
                                        onClick={onDelete}
                                        disabled={isPending}
                                        title="Delete this accommodation reservation"
                                    >
                                        <FaRegTrashAlt size={14} />
                                    </button>
                                ) : null
                            ) : (
                                <button
                                    type="button"
                                    className="btn-delete-icon"
                                    onClick={() => handleRemoveSegment(index)}
                                    disabled={isPending}
                                    title="Remove this new accommodation segment"
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
                                    value={item.accommodation_name}
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
                                    value={item.address}
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
                                    placeholder="City *"
                                    value={item.city}
                                    onChange={(e) => handleFieldChange(index, 'city', e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="reserve-input-group">
                                <input
                                    type="text"
                                    placeholder="Country *"
                                    value={item.country}
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
                                        value={item.check_in_date}
                                        min={tripMinDate}
                                        max={tripMaxDate}
                                        onChange={(e) => handleFieldChange(index, 'check_in_date', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {getFieldError('check_in_date', index) && <p className="auth-form-error">{getFieldError('check_in_date', index)}</p>}
                                </div>
                            </div>

                            <div className="reserve-form-column">
                                <div className="reserve-input-group">
                                    <label className="reserve-input-label">Check-out Date *</label>
                                    <input
                                        type="date"
                                        className={getFieldError('check_out_date', index) ? 'auth-input-error' : ''}
                                        value={item.check_out_date}
                                        min={item.check_in_date || tripMinDate}
                                        max={tripMaxDate}
                                        onChange={(e) => handleFieldChange(index, 'check_out_date', e.target.value)}
                                        disabled={isPending}
                                    />
                                    {getFieldError('check_out_date', index) && <p className="auth-form-error">{getFieldError('check_out_date', index)}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    className="btn-dashed-add"
                    onClick={handleAddSegment}
                    disabled={isPending}
                >
                    <FaPlus size={12} /> Add New Accommodation
                </button>

                <div className="flight-form-actions-wrapper">
                    {apiError && <div className="auth-form-error api-error-banner">{apiError}</div>}
                    <div className="flight-form-actions">
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
