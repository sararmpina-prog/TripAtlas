import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrip, updateTrip } from '../api';
import { getStoredToken, getStoredUser } from '../auth/authStorage';
import { formatDate } from '../utils/dateHelpers';
import { MdOutlineEdit } from 'react-icons/md';
import { IoIosSearch } from "react-icons/io";
import '../styles/TripSidePanel.css';

export default function TripSidePanel({ selectedTrip, trips, onTripChange }) {
    const token = getStoredToken();
    const user = getStoredUser();
    const queryClient = useQueryClient();

    // Estados para controlo de fluxo de ecrãs
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formError, setFormError] = useState('');

    // Estados partilhados pelos formulários (Criação e Edição)
    const [tripTitle, setTripTitle] = useState('');
    const [tripDestination, setTripDestination] = useState('');
    const [tripStartDate, setTripStartDate] = useState('');
    const [tripEndDate, setTripEndDate] = useState('');
    const [tripDescription, setTripDescription] = useState('');
    const [search, setSearch] = useState('');

    const filteredTrips = trips.filter((trip) =>
    `${trip.title} ${trip.destination}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // Efeito para carregar os dados nos inputs sempre que o utilizador clica em "Editar"
    useEffect(() => {
    if (isEditing && selectedTrip) {
        setTripTitle(selectedTrip.title || '');
        setTripDestination(selectedTrip.destination || '');
        setTripDescription(selectedTrip.description || '');
        setTripStartDate(selectedTrip.start_date ? selectedTrip.start_date.split('T')[0] : ''); // Remove tudo o que está após a letra 'T' de forma limpa e segura
        setTripEndDate(selectedTrip.end_date ? selectedTrip.end_date.split('T')[0] : '');
    }
}, [isEditing, selectedTrip]);

    // MUTATION: Criar Viagem
    const createTripMutation = useMutation({
        mutationFn: (newTripData) => createTrip(newTripData, token),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'trips'] });
            setIsCreating(false);
            setFormError('');
            const newId = response?.data?.id || response?.id;
            if (newId) onTripChange(String(newId));
        },
        onError: (error) => setFormError(error.message || 'Failed to create trip.')
    });

    // MUTATION: Atualizar Viagem (PATCH)
    const updateTripMutation = useMutation({
        mutationFn: (updatedData) => updateTrip(selectedTrip.id, updatedData, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'trips'] });
            setIsEditing(false); // Fecha o formulário automaticamente no sucesso
            setFormError('');
        },
        onError: (error) => {
            setFormError(error.message || 'Failed to update trip.');
        }
    });

    const handleSaveTrip = () => {
        if (!tripTitle || !tripDestination || !tripStartDate || !tripEndDate) {
            setFormError("Title, Destination, Start Date, and End Date are required.");
            return;
        }

        if (!user?.id) {
            setFormError("User session not found. Please log in again.");
            return;
        }

        setFormError('');

        const payload = {
            user_id: Number(user.id),
            title: tripTitle,
            destination: tripDestination,
            start_date: tripStartDate,
            end_date: tripEndDate,
            description: tripDescription || null
        };

        // Decide dinamicamente qual a mutação a disparar
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
    };

    // ****** MODO FORMULÁRIO (Criar OU Editar) ******

    if (isCreating || isEditing) {
        const isPending = createTripMutation.isPending || updateTripMutation.isPending;
        
        return (
            <div className="dashboard-sidepanel">
                <p className="dashboard-eyebrow">{isCreating ? 'Create New Adventure' : 'Edit Trip Details'}</p>

                <label className="dashboard-trip-picker">
                    <span>Trip Title *</span>
                    <input type="text" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} disabled={isPending} />
                </label>

                <label className="dashboard-trip-picker">
                    <span>Destination *</span>
                    <input type="text" value={tripDestination} onChange={(e) => setTripDestination(e.target.value)} disabled={isPending} />
                </label>

                <label className="dashboard-trip-picker">
                    <span>Start Date *</span>
                    <input type="date" value={tripStartDate} onChange={(e) => setTripStartDate(e.target.value)} disabled={isPending} />
                </label>

                <label className="dashboard-trip-picker">
                    <span>End Date *</span>
                    <input type="date" value={tripEndDate} onChange={(e) => setTripEndDate(e.target.value)} disabled={isPending} min={tripStartDate} />
                </label>

                <label className="dashboard-trip-picker">
                    <span>Description (Optional)</span>
                    <textarea value={tripDescription} onChange={(e) => setTripDescription(e.target.value)} disabled={isPending} />
                </label>

                {/* Erro posicionado de forma limpa acima dos botões */}
                {formError && <p className="dashboard-trip-picker-error"> {formError}</p>}

                <div className="dashboard-sidepanel-buttons"> 
                    <button type="button" className="btn-base btn-orange" onClick={handleSaveTrip} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-base" onClick={handleCancel} disabled={isPending}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // ****** MODO VISUALIZAÇÃO PADRÃO ******

    const tripData = selectedTrip || {
        title: "No trip created yet",
        destination: "Your destination",
        start_date: null,
        end_date: null,
        description: "Create your first trip using the action panel below to unlock your logistics dashboard.",
        id: ""
    };

    const hasTrips = trips && trips.length > 0;

    return (
        <div className="dashboard-sidepanel">
            <div>
                <div className="dashboard-sidepanel-header">
                    <p className="dashboard-eyebrow">My trip dashboard</p>
                    
                    {selectedTrip && (
                        <button type="button" className="btn-edit-card" onClick={() => setIsEditing(true)}>
                            <MdOutlineEdit size={18}/>
                        </button>
                    )}
                </div>

                <h1>{tripData.title}</h1>
                
                <p className="dashboard-trip_summary">
                    {tripData.start_date || tripData.end_date ? (
                        `${tripData.destination} from ${formatDate(tripData.start_date)} to ${formatDate(tripData.end_date)}`
                    ) : (
                        `${tripData.destination} - Dates pending`
                    )}
                </p>

                {tripData.description && (
                    <p className="dashboard-trip_description">{tripData.description}</p>
                )}
            </div>

            <button 
                type="button" 
                className="btn-base btn-orange" 
                onClick={() => { setIsCreating(true); setTripTitle(''); setTripDestination(''); setTripStartDate(''); setTripEndDate(''); setTripDescription(''); }}
            >
                Plan a new trip
            </button>

            {/* Escolher outras viagens: */}
           <div className="search-container">
                <IoIosSearch className="search-icon" />

                <input
                    type="text"
                    placeholder="Search trips..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="trip-search"
                />
            </div>

            <div className="trip-list">
                {filteredTrips.map((trip) => (
                    <button
                        key={trip.id}
                        className={
                            Number(trip.id) === Number(tripData.id)
                                ? "trip-button active"
                                : "trip-button"
                        }
                        onClick={() => onTripChange(String(trip.id))}
                    >
                        {trip.title} - {trip.destination}
                    </button>
                ))}
            </div>
        </div>
    );
}
