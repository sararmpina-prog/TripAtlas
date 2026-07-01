import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrip, updateTrip, deleteTrip } from '../../api';
import { getStoredToken, getStoredUser } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';
import { useConfirm } from '../../context/ConfirmContext';

import TripSidePanelView from './TripSidePanelView';
import TripSidePanelForm from './TripSidePanelForm';
import '../../styles/TripSidePanel.css';

export default function TripSidePanel({ selectedTrip, trips = [], onTripChange }) {
    const token = getStoredToken();
    const user = getStoredUser();
    const queryClient = useQueryClient();
    const confirm = useConfirm();

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({}); // Novo estado para erros por input
    const [search, setSearch] = useState('');

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) =>
            `${trip.title} ${trip.destination}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [trips, search]);

    const allowedFields = ['title', 'destination', 'start_date', 'end_date', 'description'];

    // MUTATION: Criar Viagem
    const createTripMutation = useMutation({
        mutationFn: (newTripData) => createTrip(newTripData, token),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'trips'] });
            setIsCreating(false);
            setFormError('');
            setFieldErrors({});
            const newId = response?.data?.id || response?.id;
            if (newId) onTripChange(String(newId));
        },
        onError: (err) => {
            const result = mapApiServerError(err, allowedFields, 'Failed to create trip.');
            setFormError(result.formError);
            setFieldErrors(result.fieldErrors); // erros nos inputs
        }
    });

    // MUTATION: Atualizar Viagem
    const updateTripMutation = useMutation({
        mutationFn: (updatedData) => updateTrip(selectedTrip.id, updatedData, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'trips'] });
            setIsEditing(false);
            setFormError('');
            setFieldErrors({});
        },
        onError: (err) => {
            const result = mapApiServerError(err, allowedFields, 'Failed to update trip.');
            setFormError(result.formError);
            setFieldErrors(result.fieldErrors); // erros nos inputs
        }
    });

    // MUTATION: Apagar Viagem
    const deleteTripMutation = useMutation({
        mutationFn: (tripId) => deleteTrip(tripId, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'trips'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'flights'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            onTripChange(null);
            setIsEditing(false);
            setFormError('');
            setFieldErrors({});
        },
        onError: (err) => {
            const result = mapApiServerError(err, [], 'Failed to delete trip.');
            setFormError(result.formError);
        }
    });

    const handleSave = (formData) => {
        if (!user?.id) {
            setFormError("User session not found. Please log in again.");
            return;
        }

        const payload = {
            user_id: Number(user.id),
            ...formData
        };

        if (isCreating) {
            createTripMutation.mutate(payload);
        } else if (isEditing) {
            updateTripMutation.mutate(payload);
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setIsEditing(false);
        setFormError('');
        setFieldErrors({});
    };

    const handleDelete = async () => {
        if (!selectedTrip?.id) return;

        const confirmed = await confirm(
            'Delete Trip?',
            `Do you want to delete ${selectedTrip.title || 'this trip'}? This action cannot be undone.`
        );

        if (confirmed) {
            deleteTripMutation.mutate(selectedTrip.id);
        }
    };

    if (isCreating || isEditing) {
        return (
            <TripSidePanelForm 
                selectedTrip={isEditing ? selectedTrip : null}
                isPending={createTripMutation.isPending || updateTripMutation.isPending || deleteTripMutation.isPending}
                apiError={formError}
                serverFieldErrors={fieldErrors} // Passa os erros do servidor
                onSave={handleSave}
                onDelete={isEditing ? handleDelete : null}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <TripSidePanelView 
            selectedTrip={selectedTrip}
            trips={trips}
            filteredTrips={filteredTrips}
            search={search}
            onSearchChange={setSearch}
            onSelectTrip={onTripChange}
            onStartCreate={() => setIsCreating(true)}
            onStartEdit={() => setIsEditing(true)}
        />
    );
}
