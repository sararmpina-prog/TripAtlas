import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuggestions } from '../../api/journal'; 
import { getStoredToken } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';

import JournalView from './JournalView';
import JournalForm from './JournalForm'; 
import DashboardPlaceholderCard from '../DashboardPlaceholderCard';

export default function JournalCard({ selectedTrip, isTripSelected, onTriggerChat }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const [isManaging, setIsManaging] = useState(false);
    const [formError, setFormError] = useState('');

    const tripName = selectedTrip?.destination || selectedTrip?.title || '';

    // SUBSTITUIÇÃO DO EFFECT PELO USEQUERY (Gestão de Caching Inteligente e Controlo de Erros Nativo)
    const { data: suggestionsData, isPending: isLoading, error: apiError } = useQuery({
        queryKey: ['dashboard', 'journal', selectedTrip?.id], // Chave atrelada ao ID da viagem
        queryFn: () => getSuggestions(tripName, token),
        enabled: !!tripName && !!token, // Só dispara se houver uma viagem ativa
    });

    // Garante que lê o formato de dados
    const suggestions = suggestionsData?.data || suggestionsData || [];

    // MUTAÇÃO PRONTA para quando implementarmos os delete manuais
    const journalMutation = useMutation({
        mutationFn: async (updatedNotes) => {
            // Chamada à API para atualizar/gravar as notas
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'journal', selectedTrip?.id] });
            setIsManaging(false);
        },
        onError: (err) => {
            // MAPEAMENTO ATIVADO: Passar o array vazio ou os campos aceitáveis (ex: ['text'])
            const result = mapApiServerError(err, ['text'], 'Failed to update journal.');
            
            // Grava a mensagem tratada no estado local para o formulário exibir
            setFormError(result.formError);
        }
    });

    if (isManaging) {
        return (
            <JournalForm 
                currentEntries={suggestions}
                isPending={journalMutation.isPending}
                apiError={formError}
                onCancel={() => setIsManaging(false)}
                onSave={(data) => journalMutation.mutate(data)}
            />
        );
    }

    const hasSuggestions = suggestions.length > 0;

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
            onEditClick={() => setIsManaging(true)}
        />
    );
}
