import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuggestions, deleteSuggestion } from '../../api/journal'; 
import { getStoredToken } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

import JournalView from './JournalView';
import DashboardPlaceholderCard from '../DashboardPlaceholderCard';

export default function JournalCard({ selectedTrip, isTripSelected, onTriggerChat }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const confirm = useConfirm();
    const toast = useToast();

    const tripReference = selectedTrip?.title || '';
    console.log("estou no JournalCard e tripReference é", tripReference)

    // FETCH: Carrega as sugestões com Caching do TanStack Query
    const { data: suggestionsData, isPending: isLoading, error: apiError } = useQuery({
        queryKey: ['dashboard', 'journal', selectedTrip?.id],
        queryFn: () => getSuggestions(tripReference, token),
        enabled: !!tripReference && !!token,
    });

    const suggestions = suggestionsData?.data || suggestionsData || [];

    console.log("suggestions no triAtlas", suggestionsData)

    // MUTATION: Apagar uma sugestão específica e atualizar o ecrã instantaneamente
    const deleteSuggestionMutation = useMutation({
        mutationFn: (suggestionId) => deleteSuggestion(suggestionId, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'journal', selectedTrip?.id] });
            
            // TOAST INFORMATIVO DE SUCESSO AO APAGAR RECOMENDAÇÃO
            toast('AI suggestion removed from your travel journal.', 'info');
        },
        onError: (err) => {
            const result = mapApiServerError(err, [], 'Failed to delete suggestion.');
            
            // TOAST DE ERRO
            toast(result.formError || 'Unable to delete suggestion.', 'error');
        }
    });

    const handleDeleteTrigger = async (suggestionId, suggestionTitle) => {
        const confirmed = await confirm(
            "Remove AI Suggestion?",
            `Do you want to remove "${suggestionTitle || 'this suggestion'}" from your travel journal? This action can't be undone.`
        );
        
        if (confirmed) {
            deleteSuggestionMutation.mutate(suggestionId);
        }
    };

    const hasSuggestions = suggestions.length > 0;

    // Se não há dados, renderiza o placeholder inteligente com o botão de saltar para o chat
    if (!hasSuggestions && !isLoading) {
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
            suggestions={suggestions}
            loading={isLoading}
            error={apiError?.message || null}
            onDeleteSuggestion={handleDeleteTrigger} 
        />
    );
}
