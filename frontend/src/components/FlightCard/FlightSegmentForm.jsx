import { FaRegTrashAlt } from "react-icons/fa";
import { toDateTimeLocalInput } from '../../utils/dateHelpers';

// Recebe a propriedade 'errors' (enviada pelo pai)
export default function FlightSegmentForm({ 
    flight, 
    index, 
    segmentKey, // Já vem no formato: "outbound-0" ou "return-0"
    errors = {}, // Alterado de localErrors para errors para casar com o pai
    onFieldChange, 
    onRemove,
    tripMinDate,
    tripMaxDate 
}) {
    
    // Unificação de chaves: Lê as mesmas strings geradas pelo validador do handleSubmit do pai
    const isOutbound = segmentKey.startsWith('outbound');
    const prefix = isOutbound ? 'out' : 'ret';
    
    const keyFlightNumber = `${prefix}-fn-${index}`;
    const keyAirline = `${prefix}-air-${index}`;
    const keyDepartureAirport = `${prefix}-dep-${index}`;
    const keyArrivalAirport = `${prefix}-arr-${index}`;
    const keyDepartureTime = `${prefix}-dep-time-${index}`;
    const keyArrivalTime = `${prefix}-arr-time-${index}`;

    // Determina o texto amigável da etiqueta
    const labelDirection = isOutbound ? 'Outbound' : 'Return';

    return (
        <div className="flight-form-segment-card">
            <button type="button" className="btn-delete-icon" onClick={onRemove} title="Remove segment">
                <FaRegTrashAlt size={14} />
            </button>

            <span className="segment-card-badge">{labelDirection} Flight</span>
            
            {/* Número do voo e companhia aérea */}
            <div className="flight-form-row">
                <div className="flight-input-group">
                    <input 
                        type="text" 
                        placeholder="Flight No. (ex: TP102)" 
                        className={errors[keyFlightNumber] ? 'auth-input-error' : ''}
                        value={flight.flight_number || ''} 
                        onChange={(e) => onFieldChange('flight_number', e.target.value)} 
                    />
                    {errors[keyFlightNumber] && <p className="auth-form-error">{errors[keyFlightNumber]}</p>}
                </div>
                <div className="flight-input-group">
                    <input 
                        type="text" 
                        placeholder="Airline (ex: TAP)" 
                        className={errors[keyAirline] ? 'auth-input-error' : ''} 
                        value={flight.airline || ''} 
                        onChange={(e) => onFieldChange('airline', e.target.value)} 
                    />
                    {errors[keyAirline] && <p className="auth-form-error">{errors[keyAirline]}</p>}
                </div>
            </div>

            {/* Código de Aeroportos */}
            <div className="flight-form-row">
                <div className="flight-input-group small-input">
                    <input 
                        type="text" 
                        className={`input-airport ${errors[keyDepartureAirport] ? 'auth-input-error' : ''}`}
                        placeholder="From" 
                        maxLength={3} 
                        value={flight.departure_airport || ''} 
                        onChange={(e) => onFieldChange('departure_airport', e.target.value.toUpperCase())} 
                    />
                    {errors[keyDepartureAirport] && <p className="auth-form-error">{errors[keyDepartureAirport]}</p>}
                </div>
                <div className="flight-input-group small-input">
                    <input 
                        type="text" 
                        className={`input-airport ${errors[keyArrivalAirport] ? 'auth-input-error' : ''}`}
                        placeholder="To" 
                        maxLength={3} 
                        value={flight.arrival_airport || ''} 
                        onChange={(e) => onFieldChange('arrival_airport', e.target.value.toUpperCase())} 
                    />
                </div>
            </div>

            {/* Datas de Outbound e Return */}
            <div className="flight-form-row">
                <div className="flight-input-group">
                    <input 
                        type="datetime-local" 
                        className={errors[keyDepartureTime] ? 'auth-input-error' : ''}
                        value={toDateTimeLocalInput(flight.departure_datetime)}
                        min={tripMinDate} 
                        max={tripMaxDate} 
                        onChange={(e) => onFieldChange('departure_datetime', e.target.value)} 
                    />
                    {errors[keyDepartureTime] && <p className="auth-form-error">{errors[keyDepartureTime]}</p>}
                </div>
                <div className="flight-input-group">
                    <input 
                        type="datetime-local"
                        className={errors[keyArrivalTime] ? 'auth-input-error' : ''}
                        value={toDateTimeLocalInput(flight.arrival_datetime)}
                        min={toDateTimeLocalInput(flight.departure_datetime) || tripMinDate}
                        max={tripMaxDate}
                        onChange={(e) => onFieldChange('arrival_datetime', e.target.value)}
                    />
                    {errors[keyArrivalTime] && <p className="auth-form-error">{errors[keyArrivalTime]}</p>}
                </div>
            </div>
        </div>
    );
}
