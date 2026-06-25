import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoredToken } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';

import JournalView from './JournalView';
import JournalForm from './JournalForm'; 
import DashboardPlaceholderCard from '../DashboardPlaceholderCard';

export default function JournalCard({ tripId, isTripSelected, onTriggerChat }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const [isManaging, setIsManaging] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Chamada de API hipotética para carregar as sugestões/notas deste diário
    // const { data: journalData } = useQuery({ ... });

    // Mutação para sincronizar remoções ou alterações
    const journalMutation = useMutation({
        mutationFn: async (updatedSuggestions) => {
            // Lógica assíncrona para apagar/atualizar no servidor
        },
        onSuccess: () => {
            // queryClient.invalidateQueries(...);
            setIsManaging(false);
        },
        onError: (err) => {
            const result = mapApiServerError(err, [], 'Failed to update journal.');
            setApiError(result.formError);
        }
    });

    if (isManaging) {
        return (
            <JournalForm 
                isPending={journalMutation.isPending}
                apiError={apiError}
                onSave={(data) => journalMutation.mutate(data)}
                onCancel={() => {
                    setIsManaging(false);
                    setApiError(null);
                }}
            />
        );
    }

    // Se a viagem não tiver sugestões/notas ainda, expõe o placeholder reutilizável
    const hasSuggestions = false; // Mudar dinamicamente com os dados da API
    if (!hasSuggestions) {
        return (
            <DashboardPlaceholderCard 
                resource="journal"
                hasTrip={isTripSelected}
                onClick={onTriggerChat} 
            />
        );
    }

    return (
        <JournalView 
            onEditClick={() => setIsManaging(true)}
        />
    );
}
