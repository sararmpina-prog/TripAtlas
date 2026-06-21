import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoredToken } from '../../auth/authStorage';
import { createFlight, updateFlight, deleteFlight } from '../../api'; 
import FlightView from './FlightView';
import FlightForm from './FlightForm'; 

export default function FlightCard({ outboundSegments = [], returnSegments = [], tripId }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // MUTATION: Sincronização dos Voos com a Base de Dados
    const journeyMutation = useMutation({
        // Envia o array de voos soltos (com a propriedade direction) para o vosso backend
        mutationFn: (flightsPayload) => updateFlightJourney(tripId, flightsPayload, token),
        onSuccess: () => {
            // Limpa a cache do TanStack Query para redesenhar o Dashboard instantaneamente
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'flights'] });
            setIsEditing(false);
        },
        onError: (err) => {
            alert(err.message || 'Failed to update flight logs. Please try again.');
        }
    });

    //  ALTERNÂNCIA DE MODOS (VISUALIZAÇÃO VS. GESTÃO)
    if (isEditing) {
        return (
            <FlightForm 
                outboundSegments={outboundSegments}
                returnSegments={returnSegments}
                isPending={journeyMutation.isPending}
                onCancel={() => setIsEditing(false)}
                onSave={(data) => journeyMutation.mutate(data)} // Dispara a gravação no MySQL
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
