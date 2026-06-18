import { useState } from 'react';
import { formatDate } from '../utils/dateHelpers';

export default function TripSidePanel({ selectedTrip, trips, onTripChange }) {

    // Estado para controlar se estamos a criar uma viagem nova no painel
    const [isCreating, setIsCreating] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState('');
    const [newTripDestination, setNewTripDestination] = useState('');

    const handleSaveTrip = () => {
        // Aqui faria a chamada à API para gravar a viagem na Base de Dados
        console.log("Gravar na BD:", { title: newTripTitle, destination: newTripDestination });
        setIsCreating(false);
    };

    // 💡 MODO FORMULÁRIO (Substitui o painel quando clica em criar)
    if (isCreating) {
        return (
            <div className="dashboard-sidepanel">
                <p className="dashboard-eyebrow">Create New Adventure</p>
                
                <label className="dashboard-trip-picker">
                    <span>Trip Title</span>
                    <input 
                        type="text" 
                        placeholder="e.g., Summer Vacation" 
                        value={newTripTitle}
                        onChange={(e) => setNewTripTitle(e.target.value)}
                    />
                </label>

                <label className="dashboard-trip-picker" style={{ marginTop: '0.5rem' }}>
                    <span>Destination</span>
                    <input 
                        type="text" 
                        placeholder="e.g., Paris, France" 
                        value={newTripDestination}
                        onChange={(e) => setNewTripDestination(e.target.value)}
                    />
                </label>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="button" className="btn-base btn-orange" onClick={handleSaveTrip}>
                        Save Trip
                    </button>
                    <button type="button" className="btn-base" onClick={() => setIsCreating(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // SE NÃO HOUVER VIAGEM: Cria-se um objeto com placeholders para o ecrã não quebrar
    const tripData = selectedTrip || {
        title: "No trips created yet",
        destination: "Your destination",
        start_date: null,
        end_date: null,
        description: "Create your first trip using the success button or the actions panel to unlock your dashboard.",
        id: ""
    };

    const hasTrips = trips && trips.length > 0;

    // MODO VISUALIZAÇÃO PADRÃO
    return (
        <div className="dashboard-sidepanel">
            <div>
                <p className="dashboard-eyebrow">My trip dashboard</p>
                {/* Usa tripData que garante que há sempre texto */}
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

            {/* NOVO BOTÃO CENTRALIZADO: O utilizador pode criar nova uma viagem aqui */}
            <button 
                type="button" 
                className="btn-base btn-orange" 
                style={{ width: '100%', marginBottom: '1rem' }}
                onClick={() => setIsCreating(true)} // Ativa o formulário inline
            >
                Plan a new trip
            </button>

            <label className="dashboard-trip-picker">
                <span>Select trip</span>
                {hasTrips ? (
                    <select
                        value={String(tripData.id)}
                        onChange={(event) => onTripChange(event.target.value)}
                    >
                        {trips.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                                {trip.title} - {trip.destination}
                            </option>
                        ))}
                    </select>
                ) : (
                    /* Se não houver viagens na BD, desativa-se o select com um texto amigável */
                    <select disabled value="">
                        <option value="">No trips available</option>
                    </select>
                )}
            </label>
        </div>
    );
}
