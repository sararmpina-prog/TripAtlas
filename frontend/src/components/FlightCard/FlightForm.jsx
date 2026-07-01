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
    selectedTrip // Recebemos a viagem aqui
}) {
    // Converte as datas da viagem para o formato aceite pelos calendários (YYYY-MM-DD)
    const tripMinDate = selectedTrip?.start_date ? selectedTrip.start_date.split('T')[0] + "T00:00" : "";
    const tripMaxDate = selectedTrip?.end_date ? selectedTrip.end_date.split('T')[0] + "T23:59" : "";
    const tripStart = tripMinDate ? new Date(tripMinDate) : null;
    const tripEnd = tripMaxDate ? new Date(tripMaxDate) : null;


    const confirm = useConfirm();

    const getErrorKey = (field, segmentKey) => {
        if (field === 'flight_number') return `fn-${segmentKey}`;
        if (field === 'departure_airport') return `dep-${segmentKey}`;
        if (field === 'arrival_airport') return `arr-${segmentKey}`;
        if (field === 'departure_datetime') return `dep-time-${segmentKey}`;
        if (field === 'arrival_datetime') return `arr-time-${segmentKey}`;
        return null;
    };

    const [direction, setDirection] = useState('Outbound');
    const [outbound, setOutbound] = useState([...outboundSegments]);
    const [returns, setReturns] = useState([...returnSegments]);
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        if (Object.keys(serverFieldErrors).length > 0) {
            setLocalErrors(serverFieldErrors);
        }
    }, [serverFieldErrors]);

    const nextOrder = direction === 'Outbound' ? outbound.length + 1 : returns.length + 1;

    const handleFieldChange = (list, setList, index, segmentKey, field, value) => {
        const updatedList = [...list];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setList(updatedList);
        
        const errorKey = getErrorKey(field, segmentKey);
        if (!errorKey) return;
        
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
        const newErrors = {};

        // 1. Validar e trancar a cronologia da IDA (Outbound)
        outbound.forEach((flight, index) => {
            if (!flight.flight_number) newErrors[`out-fn-${index}`] = "Flight number is required";
            if (!flight.departure_airport?.length !== 3) newErrors[`out-dep-${index}`] = "Must be a 3-letter airport code";
            if (!flight.departure_datetime) newErrors[`out-dep-time-${index}`] = "Departure date/time is required";
            if (!flight.arrival_datetime) {
                newErrors[`out-arr-time-${index}`] = "Arrival date/time is required";
            }

            // Validação: Chegada da ida não pode ser antes da partida da ida
            if (flight.departure_datetime && flight.arrival_datetime) {
                if (new Date(flight.arrival_datetime) < new Date(flight.departure_datetime)) {
                    newErrors[`out-arr-time-${index}`] = "Arrival cannot be before departure";
                }
            }
        });

        // 2. Validar e trancar a cronologia da VOLTA (Return)
        returns.forEach((flight, index) => {
            if (!flight.flight_number) newErrors[`ret-fn-${index}`] = "Flight number is required";
            if (!flight.departure_airport?.length !== 3) newErrors[`ret-dep-${index}`] = "Must be a 3-letter airport code";
            if (!flight.departure_datetime) newErrors[`ret-dep-time-${index}`] = "Departure date/time is required";
            if (!flight.arrival_datetime) {
                newErrors[`ret-arr-time-${index}`] = "Arrival date/time is required";
            }

            // Validação 1: Chegada da volta não pode ser antes da partida da volta
            if (flight.departure_datetime && flight.arrival_datetime) {
                if (new Date(flight.arrival_datetime) < new Date(flight.departure_datetime)) {
                    newErrors[`ret-arr-time-${index}`] = "Arrival cannot be before departure";
                }
            }

            // Validação 2 Cruzada: Partida do regresso tem de ser obrigatoriamente após o último voo de ida terminar
            const lastOutboundFlight = outbound[outbound.length - 1];
            if (lastOutboundFlight?.arrival_datetime && flight.departure_datetime) {
                if (new Date(flight.departure_datetime) < new Date(lastOutboundFlight.arrival_datetime)) {
                    newErrors[`ret-dep-time-${index}`] = "Return flight must be after outbound flight connects";
                }
            }
        });

        // 3. Verificação do saco de erros e submissão elástica para a API
        if (Object.keys(newErrors).length > 0) {
            setLocalErrors(newErrors);
            return; // Aborta e mostra as bordas vermelhas
        }

        setLocalErrors({});
        onSave([...outbound, ...returns]); // Envia o lote unificado sem erros de concorrência
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
                                key={flight.id || `${segmentKey}`}
                                flight={flight}
                                index={index}
                                direction={direction}
                                segmentKey={segmentKey}
                                localErrors={localErrors}
                                onFieldChange={(field, val) => handleFieldChange(activeList, setActiveList, index, segmentKey, field, val)}
                                onRemove={() => handleRemoveSegment(index, direction)}
                                tripMinDate={tripMinDate}
                                tripMaxDate={tripMaxDate}
                            />
                            );
                        })
                    )}
                </div>

                <button type="button" className="btn-dashed-add" onClick={handleAddSegment}>
                    <FaPlus size={12} /> Add {direction} Flight (Segment #{nextOrder})
                </button>

                {/* RODAPÉ */}
                <div className="flight-form-actions-wrapper">
                    {apiError && <div className="auth-form-error api-error-banner"> {apiError}</div>}
                    <div className="flight-form-actions">
                        {/* SUBMIT BUTTON REUTILIZÁVEL */}
                        <SubmitButton 
                            isPending={isPending} 
                            hasChanges={hasChanges} 
                            label="Save Flights"
                            pendingLabel="Saving..."
                        />
                        <button type="button" className="btn-base" onClick={onCancel} disabled={isPending}>Cancel</button>
                    </div>
                </div>
            </form>
        </DashboardCard>
    );
}