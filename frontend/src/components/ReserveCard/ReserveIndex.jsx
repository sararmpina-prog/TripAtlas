import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReserve, deleteReserve } from '../../api';
import { getStoredToken } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';
import { useConfirm } from '../../context/ConfirmContext';

import ReserveCarousel from './ReserveCarousel';
import ReserveForm from './ReserveForm';
import DashboardPlaceholderCard from '../DashboardPlaceholderCard';

export default function ReserveSection({ reserves = [], tripId, selectedTrip }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const confirm = useConfirm();

    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [currentReserve, setCurrentReserve] = useState(null);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const allowedFields = ['accommodation_name', 'accommodation_type', 'check_in_date', 'check_out_date', 'address'];

    // MUTATION: Atualizar Reserva
    const updateMutation = useMutation({
        mutationFn: (updatedData) => updateReserve(currentReserve.id, updatedData, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            handleClose();
        },
        onError: (err) => {
            const result = mapApiServerError(err, allowedFields, 'Failed to update accommodation.');
            setFormError(result.formError);
            setFieldErrors(result.fieldErrors);
        }
    });

    // MUTATION: Apagar Reserva
    const deleteMutation = useMutation({
        mutationFn: (reserveId) => deleteReserve(reserveId, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            handleClose();
        },
        onError: (err) => {
            const result = mapApiServerError(err, [], 'Failed to delete accommodation.');
            setFormError(result.formError);
        }
    });

    const handleEditTrigger = (reserve) => {
        setCurrentReserve(reserve);
        setIsEditing(true);
    };

    const handleDeleteTrigger = async (reserveId, accommodationName) => {
        const confirmed = await confirm(
            'Delete Accommodation?',
            `Do you want to delete ${accommodationName || 'this accommodation'}? This action can't be undone.`
        );
        if (confirmed) {
            deleteMutation.mutate(reserveId);
        }
    };

    const handleClose = () => {
        setIsEditing(false);
        setCurrentReserve(null);
        setFormError('');
        setFieldErrors({});
    };

    if (isEditing && currentReserve) {
        return (
            <ReserveForm 
                reserve={currentReserve}
                selectedTrip={selectedTrip} // Passa a viagem para trancar as datas
                isPending={updateMutation.isPending || deleteMutation.isPending}
                apiError={formError}
                serverFieldErrors={fieldErrors}
                onSave={(data) => updateMutation.mutate(data)}
                onDelete={() => handleDeleteTrigger(currentReserve.id, currentReserve.accommodation_name)}
                onCancel={handleClose}
            />
        );
    }

    if (reserves.length === 0) {
        return (
            <DashboardPlaceholderCard 
                resource="accommodation"
                hasTrip={!!selectedTrip}
                onClick={() => window.location.href = `/accommodations/create?tripId=${tripId}`}
            />
        );
    }

    return (
        <ReserveCarousel 
            reserves={reserves} 
            onEditClick={handleEditTrigger} 
        />
    );
}
