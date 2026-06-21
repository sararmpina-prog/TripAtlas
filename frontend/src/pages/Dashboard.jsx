import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router";

import Header from '../components/Header';
import FlightCard from '../components/FlightCard';
import ReserveCard from '../components/ReserveCard';
import AccommodationCarousel from '../components/ReserveCard/AccommodationCarousel';
import AIChatWidget from '../components/AIChatWidget';
import TripSidePanel from '../components/TripSidePanel';

import { getFlights, getReserves, getTrips } from '../api';
import { getStoredToken } from '../auth/authStorage';

import { IoChatbubbleEllipses, IoClose } from "react-icons/io5";

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
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Chamadas da API do TanStack Query
    const tripsQuery = useQuery({ queryKey: ['dashboard', 'trips'], queryFn: () => getTrips(token), enabled: Boolean(token) });
    const flightsQuery = useQuery({ queryKey: ['dashboard', 'flights'], queryFn: () => getFlights(token), enabled: Boolean(token) });
    const reservesQuery = useQuery({ queryKey: ['dashboard', 'reserves'], queryFn: () => getReserves(token), enabled: Boolean(token) });

    // Extração segura de dados
    const trips = tripsQuery.data?.data ?? [];
    const flights = flightsQuery.data?.data ?? [];
    const reserves = reservesQuery.data?.data ?? [];

    // CÁLCULO DA VIAGEM ATIVA
    const selectedTrip = useMemo(() => {
    if (!trips.length || selectedTripId === null) {
        return null;
    }

    return (
        trips.find(
            (trip) => String(trip.id) === String(selectedTripId)
        ) || null
    );
}, [trips, selectedTripId]);

    useEffect(() => {
        if (!trips.length) return;

        if (selectedTripId === null) {
            const mostRecent = [...trips].sort(
                (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime()
            )[0];

            if (mostRecent) {
                setSelectedTripId(String(mostRecent.id));
            }
        }
    }, [trips, selectedTripId]);

    //FILTRAGEM E SEPARAÇÃO DOS VOOS (JORNADA DINÂMICA)
    const selectedTripFlights = useMemo(() => {
        if (!selectedTrip) return [];
        return flights.filter((flight) => Number(flight.trip_id) === Number(selectedTrip.id));
    }, [flights, selectedTrip]);

        // Segmentos de Ida ordenados por fuso horário/data cronológica
        const outboundSegments = useMemo(() => {
            return selectedTripFlights
                .filter(f => f.direction === 'outbound')
                .sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime));
        }, [selectedTripFlights]);

        // Segmentos de Volta ordenados cronologicamente
        const returnSegments = useMemo(() => {
            return selectedTripFlights
                .filter(f => f.direction === 'return')
                .sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime));
        }, [selectedTripFlights]);

    // FILTRAGEM E ORDENAÇÃO DOS ALOJAMENTOS
    const selectedTripAccommodationReserves = useMemo(() => {
        if (!selectedTrip) return [];
        // Filtra as reservas pertencentes a esta viagem e ordena pela data mais próxima de check-in
        return reserves
            .filter((reserve) => Number(reserve.trip_id) === Number(selectedTrip.id))
            .sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date));
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
                                // JOURNEY: Passamos os trechos separados para um único cartão de gestão
                                <FlightCard 
                                    outboundSegments={outboundSegments} 
                                    returnSegments={returnSegments} 
                                    tripId={selectedTrip.id}
                                />
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

                        {/* SECÇÃO DE ALOJAMENTOS (AGORA COM CARROSSEL) */}
                        <DashboardSection title="Accommodations" count={selectedTripAccommodationReserves.length}>
                            {selectedTripAccommodationReserves.length > 0 ? (
                                <AccommodationCarousel reserves={selectedTripAccommodationReserves} />
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
                </div>
            </div>

            {/* BOTÃO FLUTUANTE FIXO NO CANTO INFERIOR */}
            <button 
                type="button" 
                className="ai-floating-trigger-btn"
                onClick={() => setIsChatOpen((prev) => !prev)}
                style={{ background: isChatOpen ? 'var(--color-medium-azure)' : 'var(--color-orange)' }}
            >
                {isChatOpen ? <IoClose /> : <IoChatbubbleEllipses />}
            </button>

            {isChatOpen && (
                <div className="ai-chat-floating-panel">
                    <AIChatWidget />
                </div>
            )}
        </section>
    );
}
