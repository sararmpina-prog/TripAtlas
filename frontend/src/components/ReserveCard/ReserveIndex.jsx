import { useState, useEffect, useMemo } from 'react';
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

    // UNIFORMIZAÇÃO: Memoriza a lista original para conseguirmos detetar exclusões em lote
    const originalReserves = useMemo(() => [...reserves], [reserves]);

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

    // MUTAÇÃO UNIFICADA POR LOTE: Processa adições, edições e remoções de uma só vez
    const saveMutation = useMutation({
        mutationFn: async (finalFormReserves) => {
            setFormError('');
            setFieldErrors({});
            const promises = [];

            // Processa as Criações (POST) e Atualizações (PUT)
            finalFormReserves.forEach((reserve) => {
                const apiPayload = {
                    trip_id: Number(selectedTrip?.id || tripId),
                    name: reserve.accommodation_name || reserve.name, 
                    address: reserve.address || reserve.accommodation_address,
                    city: reserve.city || null,
                    country: reserve.country || null,
                    check_in_date: reserve.check_in_date,
                    check_out_date: reserve.check_out_date,
                    check_in_time: reserve.check_in_time || null,
                    check_out_time: reserve.check_out_time || null
                };

                if (reserve.id && !isNaN(Number(reserve.id))) {
                    apiPayload.id = Number(reserve.id);
                    apiPayload.accommodation_id = Number(reserve.accommodation_id || reserve.id);
                    promises.push(updateReserve(reserve.id, apiPayload, token));
                } else {
                    promises.push(createReserve(apiPayload, token));
                }
            });

            // Compara a lista final com a original e processa as Remoções (DELETE) em lote
            originalReserves.forEach((origReserve) => {
                const stillExists = finalFormReserves.some(r => String(r.id) === String(origReserve.id));
                if (!stillExists) {
                    promises.push(deleteReserve(origReserve.id, token));
                }
            });

            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'reserves'] });
            
            // Toast de sucesso no final do lote
            toast('Accommodation logistics saved successfully!', 'success');
            
            handleClose();
        },
        onError: (err) => {
            const result = mapApiServerError(err, allowedFields, 'Failed to save accommodation logistics.');
            setFormError(result.formError);
            setFieldErrors(result.fieldErrors);
        }
    });

    // INTERCEÇÃO LOCAL: O botão de apagar do formulário apenas valida o clique do utilizador.
    // O formulário remove do ecrã e a destruição real no SQL aguarda pela submissão do lote.
    const handleDeleteTrigger = async (reserveId, name) => {
        const confirmed = await confirm(
            'Delete Accommodation Reservation?',
            `Are you sure you want to remove "${name || 'this accommodation'}"? Changes will only be applied after saving.`
        );
        return confirmed; // Retorna true ou false para o teu ReserveForm gerir o array localmente
    };

    if (isCreating || isEditing) {
        return (
            <ReserveForm 
                initialReserves={isEditing ? reserves : []}
                selectedTrip={selectedTrip}
                isPending={saveMutation.isPending}
                apiError={formError}
                serverFieldErrors={fieldErrors}
                onSave={(data) => saveMutation.mutate(data)}
                onDelete={handleDeleteTrigger} // Passa o validador síncrono
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
