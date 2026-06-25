import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Header from '../components/Header';
import FlightCard from '../components/FlightCard/FlightIndex';
import ReserveCard from '../components/ReserveCard/ReserveIndex';
import AIChatWidget from '../components/AIChatWidget';
import TripSidePanel from '../components/TripSidePanel/TripIndex';
import JournalCard from '../components/JournalCard/JournalIndex';

import { getFlights, getReserves, getTrips } from '../api';
import { getStoredToken } from '../utils/authStorage';

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
    
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Chamadas da API
    const { data: tripsData } = useQuery({ queryKey: ['dashboard', 'trips'], queryFn: () => getTrips(token), enabled: !!token });
    const { data: flightsData } = useQuery({ queryKey: ['dashboard', 'flights'], queryFn: () => getFlights(token), enabled: !!token });
    const { data: reservesData } = useQuery({ queryKey: ['dashboard', 'reserves'], queryFn: () => getReserves(token), enabled: !!token });

    const trips = useMemo(() => tripsData?.data ?? [], [tripsData?.data]);
    const flights = useMemo(() => flightsData?.data ?? [], [flightsData?.data]);
    const reserves = useMemo(() => reservesData?.data ?? [], [reservesData?.data]);

    const activeTripId = useMemo(() => {
        if (selectedTripId !== null) return String(selectedTripId);
        if (!trips.length) return null;

        const mostRecent = [...trips].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];

        return mostRecent ? String(mostRecent.id) : null;
    }, [selectedTripId, trips]);

    const selectedTrip = useMemo(() => {
        return trips.find(trip => String(trip.id) === String(activeTripId)) || null;
    }, [trips, activeTripId]);

    // Filtros diretos por Trip ID
    const currentFlights = useMemo(() => {
        return selectedTrip ? flights.filter(f => Number(f.trip_id) === Number(selectedTrip.id)) : [];
    }, [flights, selectedTrip]);

    const currentReserves = useMemo(() => {
        return selectedTrip ? reserves.filter(r => Number(r.trip_id) === Number(selectedTrip.id)) : [];
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

                <div className="dashboard-logistics">
                        {/* SECÇÃO DE VOOS */}
                        <DashboardSection title="Flights" count={currentFlights.length}>
                            <FlightCard 
                                key={`flights-${selectedTrip?.id || 'none'}`} // Força a re-renderização quando a trip muda
                                flights={currentFlights} 
                                tripId={selectedTrip?.id} 
                                isTripSelected={!!selectedTrip}
                                trips={trips} 
                            />
                        </DashboardSection>

                        {/* SECÇÃO DE ALOJAMENTOS */}
                        <DashboardSection title="Accommodations" count={currentReserves.length}>
                            <ReserveCard
                                key={`reserves-${selectedTrip?.id || 'none'}`} // Força a re-renderização quando a trip muda
                                reserves={currentReserves}
                                tripId={selectedTrip?.id}
                                selectedTrip={selectedTrip}
                            />
                        </DashboardSection>

                        {/* SECÇÃO DO JOURNAL / SUGESTÕES AI */}
                        <DashboardSection title="Journal" count={0 /* Mudar para o length dos itens */}>
                            <JournalCard 
                                key={`journal-${selectedTrip?.id || 'none'}`} // Força a re-renderização quando a trip muda
                                tripId={selectedTrip?.id}
                                isTripSelected={!!selectedTrip}
                                onTriggerChat={() => setIsChatOpen(true)} // abre o chat flutuante quando o botão do Journal for clicado
                            />
                        </DashboardSection>
                </div>

            </div>

            {/* CHAT FLUTUANTE */}
            <button 
                type="button" 
                className="ai-floating-trigger-btn"
                onClick={() => setIsChatOpen(prev => !prev)}
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
