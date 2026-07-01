import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFlight, updateFlight, deleteFlight } from '../../api';
import { getStoredToken } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';

import DashboardPlaceholderCard from '../DashboardPlaceholderCard';
import FlightView from './FlightView';
import FlightForm from './FlightForm';
import { useToast } from '../../context/ToastContext';

export default function FlightCard({ flights = [], tripId, isTripSelected, trips = [] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formError, setFormError] = useState(null); 
    const [fieldErrors, setFieldErrors] = useState({}); 
    
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const toast = useToast();

    const outboundSegments = useMemo(() => flights.filter(f => f.direction === 'outbound').sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime)), [flights]);
    const returnSegments = useMemo(() => flights.filter(f => f.direction === 'return').sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime)), [flights]);
    const originalFlights = useMemo(() => [...outboundSegments, ...returnSegments], [outboundSegments, returnSegments]);
    const hasFlights = outboundSegments.length > 0 || returnSegments.length > 0;

    // FUNÇÃO DE LIMPEZA CENTRALIZADA: Declara-se primeiro
    const handleClose = () => {
        setIsEditing(false);
        setFormError(null);
        setFieldErrors({});
    };

    // Fecha automaticamente o formulário se o utilizador trocar de viagem no Dashboard
    useEffect(() => {
        handleClose(); 
    }, [tripId]); // Escuta o tripId que este componente recebe de forma real

    const journeyMutation = useMutation({
        mutationFn: async (finalFormFlights) => {
            setFormError(null);
            setFieldErrors({});
            const promises = [];

            finalFormFlights.forEach((flight) => {
                const formattedFlight = {
                    ...flight,
                    departure_datetime: flight.departure_datetime ? new Date(flight.departure_datetime).toISOString() : null,
                    arrival_datetime: flight.arrival_datetime ? new Date(flight.arrival_datetime).toISOString() : null,
                };

                if (!flight.id) {
                    promises.push(createFlight({ ...formattedFlight, trip_id: tripId }, token));
                } else {
                    promises.push(updateFlight(flight.id, formattedFlight, token));
                }
            });

            originalFlights.forEach((origFlight) => {
                const stillExists = finalFormFlights.some(f => String(f.id) === String(origFlight.id));
                if (!stillExists) {
                    promises.push(deleteFlight(origFlight.id, token));
                }
            });

            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'flights'] });
            
            // Dispara o toast de sucesso
            toast('Flight records saved successfully!', 'success');
            
            handleClose();
        },
        onError: (err) => {
            const allowedFields = ['flight_number', 'departure_airport', 'arrival_airport', 'departure_datetime', 'arrival_datetime'];
            const result = mapApiServerError(err, allowedFields, 'Failed to update flight records.');
            setFieldErrors(result.fieldErrors);
            setFormError(result.formError);
        }
    });

    if (isEditing) {
        return (
            <FlightForm
                outboundSegments={outboundSegments}
                returnSegments={returnSegments}
                selectedTrip={trips.find(t => String(t.id) === String(tripId))}
                isPending={journeyMutation.isPending}
                apiError={formError} 
                serverFieldErrors={fieldErrors} 
                onSave={(data) => journeyMutation.mutate(data)}
                onCancel={handleClose} // Usa a handleClose centralizada
            />
        );
    }

    if (!hasFlights) {
        return (
            <DashboardPlaceholderCard
                resource="flights"
                hasTrip={isTripSelected}
                onClick={() => setIsEditing(true)}
            />
        );
    }

    return (
        <FlightView
            outboundSegments={outboundSegments}
            returnSegments={returnSegments}
            onEditClick={() => setIsEditing(true)}
        />
    );
}
