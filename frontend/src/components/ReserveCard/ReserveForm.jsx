import { useState } from 'react';
import '../../styles/ReserveCard.css';

export default function ReserveForm({ reserve, onSave, onDelete, onCancel, isPending }) {
    const [accName, setAccName] = useState(reserve.accommodation_name || '');
    const [accAddress, setAccAddress] = useState(reserve.accommodation_address || '');
    const [checkInDate, setCheckInDate] = useState(reserve.check_in_date || '');
    const [checkOutDate, setCheckOutDate] = useState(reserve.check_out_date || '');
    const [checkInTime, setCheckInTime] = useState(reserve.check_in_time || '14:00');
    const [checkOutTime, setCheckOutTime] = useState(reserve.check_out_time || '11:00');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!accName || !accAddress || !checkInDate || !checkOutDate) {
            setError('Hotel name, address, and dates are required.');
            return;
        }
        setError('');
        onSave({
            name: accName,
            address: accAddress,
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            check_in_time: checkInTime,
            check_out_time: checkOutTime
        });
    };

    return (
        <div className="reserve-form-container">
            <h4 className="reserve-form-title">Manage Accommodation</h4>
            
            <div className="reserve-form-group">
                <label className="reserve-form-label">
                    <span>Hotel / Property Name</span>
                    <input type="text" value={accName} onChange={(e) => setAccName(e.target.value)} disabled={isPending} />
                </label>
                <label>
                    <span>Full Address</span>
                    <input type="text" value={accAddress} onChange={(e) => setAccAddress(e.target.value)} disabled={isPending} />
                </label>
            </div>

            <div>
                <div>
                    <label>
                        <span>Check-in Date</span>
                        <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} disabled={isPending} />
                    </label>
                    <label>
                        <span>Check-in Time</span>
                        <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} disabled={isPending} />
                    </label>
                </div>

                <div>
                    <label>
                        <span>Check-out Date</span>
                        <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} disabled={isPending} />
                    </label>
                    <label>
                        <span>Check-out Time</span>
                        <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} disabled={isPending} />
                    </label>
                </div>
            </div>

            {error && <p className="reserve-form-error">⚠️ {error}</p>}

            <div className="reserve-form-actions">
                <button type="button" className="btn-base btn-orange" onClick={handleSubmit} disabled={isPending}>Save Changes</button>
                <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>Cancel</button>
                <button type="button" className="btn-base btn-red" onClick={onDelete} disabled={isPending}>Remove Reserve</button>
            </div>
        </div>
    );
}
