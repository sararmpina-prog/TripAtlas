import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReserve, deleteReserve } from '../../api';
import { getStoredToken } from '../../auth/authStorage';
import ReserveView from './ReserveView';
import ReserveForm from './ReserveForm';

export default function ReserveCard({ reserve }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    const updateMutation = useMutation({
        mutationFn: (updatedData) => updateReserve(reserve.id, updatedData, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            setIsEditing(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteReserve(reserve.id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            setIsEditing(false);
        }
    });

    const handleDeleteTrigger = () => {
        if (window.confirm(`Are you sure you want to cancel the reservation at "${reserve.accommodation_name}"?`)) {
            deleteMutation.mutate();
        }
    };

    if (isEditing) {
        return (
            <ReserveForm 
                reserve={reserve}
                isPending={updateMutation.isPending || deleteMutation.isPending}
                onSave={(data) => updateMutation.mutate(data)}
                onDelete={handleDeleteTrigger}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return <ReserveView reserve={reserve} onEditClick={() => setIsEditing(true)} />;
}
