import { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import '../../styles/FlightCard.css';

export default function FlightForm({ outboundSegments = [], returnSegments = [], onSave, onCancel, isPending }) {
    const [direction, setDirection] = useState('Outbound');

    const [outbound, setOutbound] = useState([...outboundSegments]);
    const [returns, setReturns] = useState([...returnSegments]);

    const nextOrder = direction === 'Outbound' ? outbound.length + 1 : returns.length + 1;

    const handleFieldChange = (list, setList, index, field, value) => {
        const updatedList = [...list];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setList(updatedList);
    };

    const handleAddSegment = () => {
        const newFlight = {
            id: null,
            flight_number: '',
            airline: '',
            departure_airport: '',
            arrival_airport: '',
            departure_datetime: '',
            arrival_datetime: '',
            direction: direction.toLowerCase()
        };

        if (direction === 'Outbound') {
            setOutbound([...outbound, newFlight]);
        } else {
            setReturns([...returns, newFlight]);
        }
    };

    const handleRemoveSegment = (index, type) => {
        if (type === 'Outbound') {
            setOutbound(outbound.filter((_, i) => i !== index));
        } else {
            setReturns(returns.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave([...outbound, ...returns]);
    };

    const activeList = direction === 'Outbound' ? outbound : returns;
    const setActiveList = direction === 'Outbound' ? setOutbound : setReturns;

    return (
        <form onSubmit={handleSubmit} className="flight-form-container">
            <h5>Manage Flights</h5>

            {/* BOTÕES SELETORES */}
            <div className="journey-selector">
                <button
                    type="button"
                    className={`btn-base ${direction === 'Outbound' ? 'active btn-orange' : ''}`}
                    onClick={() => setDirection('Outbound')}
                >
                    Outbound ({outbound.length})
                </button>

                <button
                    type="button"
                    className={`btn-base ${direction === 'Return' ? 'active btn-orange' : ''}`}
                    onClick={() => setDirection('Return')}
                >
                    Return ({returns.length})
                </button>
            </div>

            {/* LISTAGEM REATIVA DOS CARTÕES */}
            <div className="flight-form-list">
                {activeList.length === 0 ? (
                    <p className="flight-form-empty-msg">
                        No {direction.toLowerCase()} segments logged yet.
                    </p>
                ) : (
                    activeList.map((flight, index) => (
                        <div key={index} className="flight-form-segment-card">
                            
                            {/* Botão de Apagar Voo */}
                            <button 
                                type="button" 
                                className="btn-delete-segment"
                                onClick={() => handleRemoveSegment(index, direction)} 
                                title="Remove segment"
                            >
                                <FaTrash size={14} />
                            </button>

                            <span className="segment-card-badge">
                                {direction} Flight #{index + 1}
                            </span>
                            
                            {/* Linha 1: Número do Voo e Linha Aérea */}
                            <div className="flight-form-grid-row">
                                <input type="text" placeholder="Flight No. (ex: TP102)" value={flight.flight_number || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'flight_number', e.target.value)} required />
                                <input type="text" placeholder="Airline (ex: TAP)" value={flight.airline || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'airline', e.target.value)} required />
                            </div>

                            {/* Linha 2: Aeroportos e Horários */}
                            <div className="flight-form-grid-row">
                                <input type="text" className="input-airport" placeholder="From" maxLength={3} value={flight.departure_airport || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'departure_airport', e.target.value.toUpperCase())} required />
                                <input type="text" className="input-airport" placeholder="To" maxLength={3} value={flight.arrival_airport || ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'arrival_airport', e.target.value.toUpperCase())} required />
                                
                                <input type="datetime-local" value={flight.departure_datetime ? flight.departure_datetime.slice(0, 16) : ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'departure_datetime', e.target.value)} required />
                                <input type="datetime-local" value={flight.arrival_datetime ? flight.arrival_datetime.slice(0, 16) : ''} onChange={(e) => handleFieldChange(activeList, setActiveList, index, 'arrival_datetime', e.target.value)} required />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* BOTÃO DINÂMICO ADICIONAR */}
            <button 
                type="button" 
                className="btn-dashed-add" 
                onClick={handleAddSegment}
            >
                <FaPlus size={12} /> Add {direction} Flight (Segment #{nextOrder})
            </button>

            {/* SUBMISSÃO */}
            <div className="flight-form-actions">
                <button type="submit" className="btn-base btn-orange" disabled={isPending}>
                    {isPending ? 'Syncing Flights...' : 'Save Flight Configuration'}
                </button>
                <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>
                    Cancel
                </button>
            </div>
        </form>
    );
}
