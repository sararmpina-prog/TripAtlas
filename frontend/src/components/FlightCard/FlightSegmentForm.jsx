import { FaRegTrashAlt } from "react-icons/fa";

import { toDateTimeLocalInput } from '../../utils/dateHelpers';

function FlightSegmentForm({ 
    flight, 
    index, 
    direction, 
    segmentKey,
    localErrors, 
    onFieldChange, 
    onRemove,
    tripMinDate,
    tripMaxDate 
}) {
    return (
        <div className="flight-form-segment-card">
            <button type="button" className="btn-delete-icon" onClick={onRemove} title="Remove segment">
                <FaRegTrashAlt size={14} />
            </button>

            <span className="segment-card-badge">{direction} Flight #{index + 1}</span>
            
            {/* Linha 1 */}
            <div className="flight-form-row">
                <div className="flight-input-group">
                    <input 
                        type="text" 
                        placeholder="Flight No. (ex: TP102)" 
                        className={localErrors[`fn-${segmentKey}`] ? 'auth-input-error' : ''}
                        value={flight.flight_number || ''} 
                        onChange={(e) => onFieldChange('flight_number', e.target.value)} 
                    />
                    {localErrors[`fn-${segmentKey}`] && <p className="auth-form-error">{localErrors[`fn-${segmentKey}`]}</p>}
                </div>
                <div className="flight-input-group">
                    <input 
                        type="text" 
                        placeholder="Airline (ex: TAP)" 
                        value={flight.airline || ''} 
                        onChange={(e) => onFieldChange('airline', e.target.value)} 
                    />
                </div>
            </div>

            {/* Linha 2 */}
            <div className="flight-form-row">
                <div className="flight-input-group small-input">
                    <input 
                        type="text" 
                        className={`input-airport ${localErrors[`dep-${segmentKey}`] ? 'auth-input-error' : ''}`}
                        placeholder="From" 
                        maxLength={3} 
                        value={flight.departure_airport || ''} 
                        onChange={(e) => onFieldChange('departure_airport', e.target.value.toUpperCase())} 
                    />
                    {localErrors[`dep-${segmentKey}`] && <p className="auth-form-error">{localErrors[`dep-${segmentKey}`]}</p>}
                </div>
                <div className="flight-input-group small-input">
                    <input 
                        type="text" 
                        className={`input-airport ${localErrors[`arr-${segmentKey}`] ? 'auth-input-error' : ''}`}
                        placeholder="To" 
                        maxLength={3} 
                        value={flight.arrival_airport || ''} 
                        onChange={(e) => onFieldChange('arrival_airport', e.target.value.toUpperCase())} 
                    />
                    {localErrors[`arr-${segmentKey}`] && <p className="auth-form-error">{localErrors[`arr-${segmentKey}`]}</p>}
                </div>
            </div>

            {/* Linha 3 */}
            <div className="flight-form-row">
                <div className="flight-input-group">
                    <input 
                        type="datetime-local" 
                        className={localErrors[`dep-time-${segmentKey}`] ? 'auth-input-error' : ''}
                        value={toDateTimeLocalInput(flight.departure_datetime)}
                         min={tripMinDate} // Não pode voar antes de a viagem começar
                         max={tripMaxDate} // Não pode voar depois de a viagem acabar
                        onChange={(e) => onFieldChange('departure_datetime', e.target.value)} 
                    />
                    {localErrors[`dep-time-${segmentKey}`] && <p className="auth-form-error">{localErrors[`dep-time-${segmentKey}`]}</p>}
                </div>
                <div className="flight-input-group">
                    <input 
                        type="datetime-local"
                        className={localErrors[`arr-time-${segmentKey}`] ? 'auth-input-error' : ''}
                        value={toDateTimeLocalInput(flight.arrival_datetime)}
                        // O mínimo é a data de partida deste voo específico, o máximo é o fim da viagem!
                        min={toDateTimeLocalInput(flight.departure_datetime)}
                        max={tripMaxDate}
                        onChange={(e) => onFieldChange('arrival_datetime', e.target.value)}
                    />
                    {localErrors[`arr-time-${segmentKey}`] && <p className="auth-form-error">{localErrors[`arr-time-${segmentKey}`]}</p>}
                </div>
            </div>
        </div>
    );
}

export default FlightSegmentForm;