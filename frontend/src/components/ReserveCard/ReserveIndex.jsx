import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReserve, deleteReserve, createReserve, createAccommodation } from '../../api';
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
    const [currentReserve, setCurrentReserve] = useState(null);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const allowedFields = ['accommodation_name', 'accommodation_type', 'check_in_date', 'check_out_date', 'address', 'city', 'country'];

    // MUTATION: Atualizar/Criar Reservas a partir do form de accommodations
    const saveMutation = useMutation({
        mutationFn: async (reservesPayload) => {
            const reservesList = Array.isArray(reservesPayload) ? reservesPayload : [reservesPayload];

            for (const segment of reservesList) {
                const checkIn = segment.check_in_date;
                const checkOut = segment.check_out_date;
                const tripReferenceId = selectedTrip?.id ?? currentReserve?.trip_id ?? tripId;

                if (segment.id) {
                    await updateReserve(segment.id, {
                        accommodation_id: segment.accommodation_id,
                        trip_id: tripReferenceId,
                        check_in_date: checkIn,
                        check_out_date: checkOut,
                    }, token);
                    continue;
                }

                const createdAccommodation = await createAccommodation({
                    name: segment.accommodation_name,
                    address: segment.address,
                    city: segment.city,
                    country: segment.country,
                }, token);

                const accommodationId = createdAccommodation?.data?.id ?? createdAccommodation?.id;

                await createReserve({
                    accommodation_id: accommodationId,
                    trip_id: tripReferenceId,
                    check_in_date: checkIn,
                    check_out_date: checkOut,
                }, token);
            }
        },
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

    const handleCreateTrigger = () => {
        if (!tripId) return;
        window.location.href = `/accommodations/create?tripId=${tripId}`;
    };

    if (isEditing && currentReserve) {
        return (
            <ReserveForm 
                reserve={currentReserve}
                selectedTrip={selectedTrip} // Passa a viagem para trancar as datas
                isPending={saveMutation.isPending || deleteMutation.isPending}
                apiError={formError}
                serverFieldErrors={fieldErrors}
                onSave={(data) => saveMutation.mutate(data)}
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
                onClick={handleCreateTrigger}
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
