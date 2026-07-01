import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";

import DashboardCard from '../DashboardCard';
import FlightSegmentForm from './FlightSegmentForm';
import { useConfirm } from '../../context/ConfirmContext';
import SubmitButton from '../../components/SubmitButton';
import '../../styles/FlightCard.css';

export default function FlightForm({ 
    outboundSegments = [], 
    returnSegments = [], 
    onSave, 
    onCancel, 
    isPending,
    apiError,           
    serverFieldErrors = {}, 
    selectedTrip
}) {
    const tripMinDate = selectedTrip?.start_date ? selectedTrip.start_date.split('T')[0] + "T00:00" : "";
    const tripMaxDate = selectedTrip?.end_date ? selectedTrip.end_date.split('T')[0] + "T23:59" : "";

    const confirm = useConfirm();

    const [direction, setDirection] = useState('Outbound');
    const [outbound, setOutbound] = useState([...outboundSegments]);
    const [returns, setReturns] = useState([...returnSegments]);
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        if (Object.keys(serverFieldErrors).length > 0) {
            setLocalErrors(serverFieldErrors);
        }
    }, [serverFieldErrors]);

    // O botão de salvar acende se as listas forem geometricamente diferentes das originais
    const hasChanges = 
        outbound.length !== outboundSegments.length ||
        returns.length !== returnSegments.length ||
        JSON.stringify(outbound) !== JSON.stringify(outboundSegments) ||
        JSON.stringify(returns) !== JSON.stringify(returnSegments);

    const nextOrder = direction === 'Outbound' ? outbound.length + 1 : returns.length + 1;

    // A função limpa o erro dinamicamente se o utilizador começar a escrever
    const handleFieldChange = (list, setList, index, field, value) => {
        const updatedList = [...list];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setList(updatedList);
        
        // Determina qual a chave exata a limpar com base na convenção unificada
        const prefix = direction === 'Outbound' ? 'out' : 'ret';
        let subKey = '';
        if (field === 'flight_number') subKey = 'fn';
        if (field === 'departure_airport') subKey = 'dep';
        if (field === 'arrival_airport') subKey = 'arr';
        if (field === 'departure_datetime') subKey = 'dep-time';
        if (field === 'arrival_datetime') subKey = 'arr-time';

        const errorKey = `${prefix}-${subKey}-${index}`;
        
        setLocalErrors(prev => {
            const copy = { ...prev };
            delete copy[errorKey];
            return copy;
        });
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
        direction === 'Outbound' ? setOutbound([...outbound, newFlight]) : setReturns([...returns, newFlight]);
    };

    const handleRemoveSegment = async (index, type) => {
        const confirmed = await confirm(
            "Delete Flight Segment?",
            "Are you sure you want to remove this segment? Changes are applied only after saving."
        );
        
        if (!confirmed) return;

        type === 'Outbound' 
            ? setOutbound(outbound.filter((_, i) => i !== index)) 
            : setReturns(returns.filter((_, i) => i !== index));
    };

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!hasChanges) return;

    const newErrors = {};
    
    // EXPRESSÃO REGULAR: Apenas letras e espaços (permite acentos latinos)
    const airlineRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/;

    // Validar a cronologia da IDA (Outbound)
    outbound.forEach((flight, index) => {
        if (!flight.flight_number || !flight.flight_number.trim()) {
            newErrors[`out-fn-${index}`] = "Flight number is required";
        }
        if (!flight.departure_airport || flight.departure_airport.trim().length !== 3) {
            newErrors[`out-dep-${index}`] = "Must be a 3-letter airport code";
        }
        if (!flight.arrival_airport || flight.arrival_airport.trim().length !== 3) {
            newErrors[`out-arr-${index}`] = "Must be a 3-letter airport code";
        }
        if (!flight.departure_datetime) {
            newErrors[`out-dep-time-${index}`] = "Departure date/time is required";
        }
        if (!flight.arrival_datetime) {
            newErrors[`out-arr-time-${index}`] = "Arrival date/time is required";
        }

        if (flight.airline && !airlineRegex.test(flight.airline)) {
            newErrors[`out-air-${index}`] = "Airline name must contain only letters.";
        }

        if (flight.departure_datetime && flight.arrival_datetime) {
            if (new Date(flight.arrival_datetime) < new Date(flight.departure_datetime)) {
                newErrors[`out-arr-time-${index}`] = "Arrival cannot be before departure";
            }
        }
    });

    // 2. Validar a cronologia da VOLTA (Return)
    returns.forEach((flight, index) => {
        if (!flight.flight_number || !flight.flight_number.trim()) {
            newErrors[`ret-fn-${index}`] = "Flight number is required";
        }
        if (!flight.departure_airport || flight.departure_airport.trim().length !== 3) {
            newErrors[`ret-dep-${index}`] = "Must be a 3-letter airport code";
        }
        if (!flight.arrival_airport || flight.arrival_airport.trim().length !== 3) {
            newErrors[`ret-arr-${index}`] = "Must be a 3-letter airport code";
        }
        if (!flight.departure_datetime) {
            newErrors[`ret-dep-time-${index}`] = "Departure date/time is required";
        }
        if (!flight.arrival_datetime) {
            newErrors[`ret-arr-time-${index}`] = "Arrival date/time is required";
        }

        if (flight.airline && !airlineRegex.test(flight.airline)) {
            newErrors[`ret-air-${index}`] = "Airline name must contain only letters.";
        }

        if (flight.departure_datetime && flight.arrival_datetime) {
            if (new Date(flight.arrival_datetime) < new Date(flight.departure_datetime)) {
                newErrors[`ret-arr-time-${index}`] = "Arrival cannot be before departure";
            }
        }

        const lastOutboundFlight = outbound[outbound.length - 1];
        if (lastOutboundFlight?.arrival_datetime && flight.departure_datetime) {
            if (new Date(flight.departure_datetime) < new Date(lastOutboundFlight.arrival_datetime)) {
                newErrors[`ret-dep-time-${index}`] = "Return flight must be after outbound flight connects";
            }
        }
    });

    if (Object.keys(newErrors).length > 0) {
        setLocalErrors(newErrors);
        return; 
    }

    setLocalErrors({});
    onSave([...outbound, ...returns]);
};

    const activeList = direction === 'Outbound' ? outbound : returns;
    const setActiveList = direction === 'Outbound' ? setOutbound : setReturns;

    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onCancel} disabled={isPending}>
                    <IoClose size={18}/>
                </button>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="flight-form-container">
                <h5 className='flight-form-title'>Manage Flights</h5>

                {/* BOTÕES SELETORES */}
                <div className="journey-selector">
                    <button
                        type="button"
                        className={`btn-base ${direction === 'Outbound' ? 'btn-light active' : ''}`}
                        onClick={() => setDirection('Outbound')}
                    >
                        Outbound ({outbound.length})
                    </button>
                    <button
                        type="button"
                        className={`btn-base ${direction === 'Return' ? 'btn-light active' : ''}`}
                        onClick={() => setDirection('Return')}
                    >
                        Return ({returns.length})
                    </button>
                </div>

                {/* LISTAGEM REATIVA COMPONENTIZADA */}
                <div className="flight-form-list">
                    {activeList.length === 0 ? (
                        <p className="flight-form-empty-msg">No {direction.toLowerCase()} segments logged yet.</p>
                    ) : (
                        activeList.map((flight, index) => {
                            const segmentKey = `${direction.toLowerCase()}-${index}`;

                            return (
                                <FlightSegmentForm
                                    key={segmentKey}
                                    index={index}
                                    flight={flight}
                                    errors={localErrors} // Passa o saco de erros local reativo
                                    segmentKey={segmentKey}
                                    tripMinDate={tripMinDate}
                                    tripMaxDate={tripMaxDate}
                                    onFieldChange={(field, val) => handleFieldChange(activeList, setActiveList, index, field, val)}
                                    onRemove={() => handleRemoveSegment(index, direction)}
                                />
                            );
                        })
                    )}
                </div>
                    <button 
                        type="button" 
                        className="btn-dashed-add" 
                        onClick={handleAddSegment}
                        disabled={isPending}
                    >
                        <FaPlus size={12} /> Add Segment #{nextOrder}
                    </button>

                {/* RODAPÉ */}
                <div className="flight-form-actions-wrapper">
                    {apiError && <div className="auth-form-error api-error-banner"> {apiError}</div>}
                    <div className="flight-form-actions">
                        {/* SUBMIT BUTTON REUTILIZÁVEL */}
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