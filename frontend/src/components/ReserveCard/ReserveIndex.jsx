import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReserve, deleteReserve, createReserve } from '../../api';
import { getStoredToken } from '../../utils/authStorage';
import { mapApiServerError } from '../../validators/apiValidator';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

import ReserveCarousel from './ReserveCarousel';
import ReserveForm from './ReserveForm';
import DashboardPlaceholderCard from '../DashboardPlaceholderCard';

import '../../styles/ReserveCard.css';

export default function ReserveCard({ reserves = [], tripId, selectedTrip }) {
    const token = getStoredToken();
    const queryClient = useQueryClient();
    const confirm = useConfirm();
    const toast = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const allowedFields = ['name', 'address', 'city', 'country', 'check_in_date', 'check_out_date', 'check_in_time', 'check_out_time'];

    const handleClose = () => {
        setIsEditing(false);
        setIsCreating(false);
        setFormError('');
        setFieldErrors({});
    };

    // Se o utilizador muda de viagem ativa, fecha automaticamente o formulário de edição/criação
    useEffect(() => {
        handleClose(); 
    }, [selectedTrip?.id]); 

    // MUTAÇÃO UNIFICADA: Grava o lote completo enviado pelo formulário
    const saveMutation = useMutation({
        mutationFn: async (reservesList) => {
            const promises = reservesList.map(reserve => {
                // BASE DO PAYLOAD COM AS CHAVES NATIVAS DO TEU SQL
                const apiPayload = {
                    trip_id: Number(selectedTrip?.id || tripId),
                    name: reserve.accommodation_name || reserve.name, // Garante que lê a string correta
                    address: reserve.address || reserve.accommodation_address,
                    city: reserve.city || null,
                    country: reserve.country || null,
                    check_in_date: reserve.check_in_date,
                    check_out_date: reserve.check_out_date,
                    check_in_time: reserve.check_in_time || null,
                    check_out_time: reserve.check_out_time || null
                };

                // PROTEÇÃO CONTRA NaN: Se o registo já tem um ID numérico válido no SQL, atualiza (PUT)
                if (reserve.id && !isNaN(Number(reserve.id))) {
                    apiPayload.id = Number(reserve.id);
                    apiPayload.accommodation_id = Number(reserve.accommodation_id || reserve.id);
                    
                    return updateReserve(reserve.id, apiPayload, token);
                }

                // SE FOR NOVO: Não envia IDs nulos ou vazios de todo! O SQL gera o auto-increment sozinho (POST)
                return createReserve(apiPayload, token);
            });
            
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            toast('Accommodation logistics saved successfully!', 'success');
            handleClose();
        },
        onError: (err) => {
            const result = mapApiServerError(err, allowedFields, 'Failed to save accommodation logistics.');
            setFormError(result.formError);
            setFieldErrors(result.fieldErrors);
        }
    });

    // MUTAÇÃO: Apagar Reserva Individual
    const deleteMutation = useMutation({
        mutationFn: (reserveId) => deleteReserve(reserveId, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            toast('Accommodation log removed permanently.', 'info');
            handleClose();
        },
        onError: (err) => {
            const result = mapApiServerError(err, [], 'Failed to delete accommodation.');
            setFormError(result.formError);
        }
    });

    const handleDeleteTrigger = async (reserveId, name) => {
        const confirmed = await confirm(
            'Delete Accommodation?',
            `Are you sure you want to delete ${name || 'this accommodation'}? Changes are final.`
        );
        if (confirmed) {
            deleteMutation.mutate(reserveId);
        }
    };

    if (isCreating || isEditing) {
        return (
            <ReserveForm 
                initialReserves={isEditing ? reserves : []}
                selectedTrip={selectedTrip}
                isPending={saveMutation.isPending || deleteMutation.isPending}
                apiError={formError}
                serverFieldErrors={fieldErrors}
                onSave={(data) => saveMutation.mutate(data)}
                onDelete={handleDeleteTrigger}
                onCancel={handleClose}
            />
        );
    }

    if (reserves.length === 0) {
        return (
            <DashboardPlaceholderCard 
                resource="accommodation"
                hasTrip={!!selectedTrip}
                onClick={() => setIsCreating(true)} 
            />
        );
    }

    return (
        <ReserveCarousel 
            reserves={reserves} 
            onEditClick={() => setIsEditing(true)} 
        />
    );
}
