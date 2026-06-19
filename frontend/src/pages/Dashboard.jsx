import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router";

import Header from '../components/Header';
import FlightCard from '../components/FlightCard';
import ReserveCard from '../components/ReserveCard';
import AIChatCard from '../components/AIChatCard';
import TripSidePanel from '../components/TripSidePanel';

import { getFlights, getReserves, getTrips } from '../api';
import { getStoredToken } from '../auth/authStorage';

import '../styles/Dashboard.css';

function DashboardSection({ title, count, children }) {
    return (
        <section className="dashboard-section">
            <div className="dashboard-section-header">
                <div>
                    <h2>{title}</h2>
                    <p>{count} item{count === 1 ? '' : 's'}</p>
                </div>
            </div>
            <div className="dashboard-section-content">{children}</div>
        </section>
    );
}

export default function Dashboard() {
    const token = getStoredToken();
    const navigate = useNavigate();
    
    // DECLARAÇÃO DOS ESTADOS
    const [selectedTripId, setSelectedTripId] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Chamadas da API do TanStack Query
    const tripsQuery = useQuery({ queryKey: ['dashboard', 'trips'], queryFn: () => getTrips(token), enabled: Boolean(token) });
    const flightsQuery = useQuery({ queryKey: ['dashboard', 'flights'], queryFn: () => getFlights(token), enabled: Boolean(token) });
    const reservesQuery = useQuery({ queryKey: ['dashboard', 'reserves'], queryFn: () => getReserves(token), enabled: Boolean(token) });

    const trips = tripsQuery.data?.data ?? [];
    const flights = flightsQuery.data?.data ?? [];
    const reserves = reservesQuery.data?.data ?? [];

    // CÁLCULO DA VIAGEM ATIVA
    //optimizar desempenho, memoriza calculo entre renderizações so recalcula se dependencias alteradas
    const selectedTrip = useMemo(() => {
        if (!trips || !trips.length) {
            return null; 
        }

        if (isInitialized && selectedTripId === '') {
            return null;
        }

        const activeTripId = selectedTripId || String(trips[0].id);
        return trips.find((trip) => String(trip.id) === String(activeTripId)) || trips[0];
    }, [selectedTripId, trips, isInitialized]);

// Atualiza o useEffect com a proteção da flag de inicialização
useEffect(() => {
    // Só entra aqui se o array de viagens carregar e ainda NÃO tiver sido inicializado
    if (trips && trips.length > 0 && !isInitialized) {
        
        // Encontra a viagem com o updated_at mais recente
        const mostRecent = [...trips].sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })[0];
        
        if (mostRecent) {
            setSelectedTripId(String(mostRecent.id));
        }
        
        // Ativa a flag! A partir de agora, o React nunca mais vai forçar uma viagem sozinho
        setIsInitialized(true);
    }
}, [trips, isInitialized]);


    const selectedTripFlights = useMemo(() => {
        if (!selectedTrip) return [];
        const allFlights = flights || []; 
        return allFlights.filter((flight) => Number(flight.trip_id) === Number(selectedTrip.id));
    }, [flights, selectedTrip]);

    const selectedTripAccommodationReserves = useMemo(() => {
        if (!selectedTrip) return [];
        const allReserves = reserves || []; 
        return allReserves.filter((reserve) => Number(reserve.trip_id) === Number(selectedTrip.id));
    }, [reserves, selectedTrip]);

    return (
        <section className="dashboard-page">
            <Header />
            <div className="dashboard-content">
                <TripSidePanel 
                    selectedTrip={selectedTrip} 
                    trips={trips} 
                    onTripChange={setSelectedTripId}
                />

                <div className="dashboard-grid">
                    <div className="dashboard-grid-logistics">
                        
                        {/* SECÇÃO DE VOOS */}
                        <DashboardSection title="Flights" count={selectedTripFlights.length}>
                            {selectedTripFlights.length > 0 ? (
                                selectedTripFlights.map((flight) => (
                                    <FlightCard key={flight.id} flight={flight} />
                                ))
                            ) : (
                                <button 
                                    type="button"
                                    className={`dashboard-placeholder-card ${selectedTrip ? 'card-clickable' : 'card-disabled'}`}
                                    disabled={!selectedTrip}
                                    onClick={() => navigate(`/flights/create?tripId=${selectedTrip.id}`)}
                                >
                                    <h5>No flights yet</h5>
                                    <p>
                                        {selectedTrip 
                                            ? "Click here to add flights to this trip." 
                                            : "Plan a trip first using the sidebar to unlock flight scheduling."}
                                    </p>
                                </button>
                            )}
                        </DashboardSection>

                        {/* SECÇÃO DE ALOJAMENTOS */}
                        <DashboardSection title="Accommodations" count={selectedTripAccommodationReserves.length}>
                            {selectedTripAccommodationReserves.length > 0 ? (
                                selectedTripAccommodationReserves.map((reserve) => (
                                    <ReserveCard key={reserve.id} reserve={reserve} />
                                ))
                            ) : (
                                <button 
                                    type="button"
                                    className={`dashboard-placeholder-card ${selectedTrip ? 'card-clickable' : 'card-disabled'}`}
                                    disabled={!selectedTrip}
                                    onClick={() => navigate(`/accommodations/create?tripId=${selectedTrip.id}`)}
                                >
                                    <h5>No accommodation reserves yet</h5>
                                    <p>
                                        {selectedTrip 
                                            ? "Click here to attach an accommodation reserve." 
                                            : "Plan a trip first using the sidebar to unlock accommodation logging."}
                                    </p>
                                </button>
                            )}
                        </DashboardSection>
                    </div>

                    <AIChatCard selectedTrip={selectedTrip} onTripChange={setSelectedTripId} />

                </div>
            </div>
        </section>
    );
}
