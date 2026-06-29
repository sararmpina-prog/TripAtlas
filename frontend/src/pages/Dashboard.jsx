import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import Header from '../components/Header';
import FlightCard from '../components/FlightCard/FlightIndex';
import ReserveCard from '../components/ReserveCard/ReserveIndex';
import AIChatWidget from '../components/AIChatWidget';
import TripSidePanel from '../components/TripSidePanel/TripIndex';
import JournalCard from '../components/JournalCard/JournalIndex';

import { ImAirplane } from "react-icons/im";
import { FaHome } from "react-icons/fa";
import { FaBook } from "react-icons/fa";

import { getFlights, getReserves, getTrips } from '../api'; 
import { getStoredToken } from '../utils/authStorage';

import { IoChatbubbleEllipses, IoClose } from "react-icons/io5";
import '../styles/Dashboard.css';

function DashboardSection({ title, count, icon, children }) {
    return (
        <section className="dashboard-section">
            <div className="dashboard-section-header">
                
                    {icon && <div className="section-icon-container">{icon}</div>}

                <div>
                    <h2>{title}</h2>
                    <p>{count} item{count === 1 ? '' : 's'}</p>
                </div>
            </div>
            <div className="dashboard-section-content">
                {children}
            </div>
        </section>
    );
}

export default function Dashboard() {
    const token = getStoredToken();
    const navigate = useNavigate(); 
    
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Chamadas da API otimizadas do TanStack Query 
    const { data: tripsData } = useQuery({ queryKey: ['dashboard', 'trips'], queryFn: () => getTrips(token), enabled: !!token });
    const { data: flightsData } = useQuery({ queryKey: ['dashboard', 'flights'], queryFn: () => getFlights(token), enabled: !!token });
    const { data: reservesData } = useQuery({ queryKey: ['dashboard', 'reserves'], queryFn: () => getReserves(token), enabled: !!token });

    const trips = useMemo(() => tripsData?.data ?? [], [tripsData?.data]);
    const flights = useMemo(() => flightsData?.data ?? [], [flightsData?.data]);
    const reserves = useMemo(() => reservesData?.data ?? [], [reservesData?.data]);

    // Cálculo rápido e seguro da viagem ativa
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

    // Filtros diretos por Trip ID para se passar aos componentes elásticos
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

                {/* LAYOUT VERTICAL CENTRALIZADO */}
                <div className="dashboard-logistics">
                        {/* SECÇÃO DE VOOS */}
                        <DashboardSection title="Flights" count={currentFlights.length} icon={<ImAirplane size={30} />}>
                            <FlightCard 
                                key={`flights-${selectedTrip?.id || 'none'}`} 
                                flights={currentFlights} 
                                tripId={selectedTrip?.id} 
                                isTripSelected={!!selectedTrip}
                                trips={trips} 
                            />
                        </DashboardSection>

                        {/* SECÇÃO DE ALOJAMENTOS */}
                        <DashboardSection title="Accommodations" count={currentReserves.length} icon={<FaHome size={30} />}>
                            <ReserveCard
                                key={`reserves-${selectedTrip?.id || 'none'}`} 
                                reserves={currentReserves}
                                tripId={selectedTrip?.id}
                                selectedTrip={selectedTrip}
                            />
                        </DashboardSection>

                        {/* SECÇÃO DO JOURNAL / SUGESTÕES AI */}
                        <DashboardSection title="AI Travel Journal" count={0} icon={<FaBook size={30} />}>
                            <JournalCard 
                                key={`journal-${selectedTrip?.id || 'none'}`} 
                                selectedTrip={selectedTrip} 
                                isTripSelected={!!selectedTrip}
                                onTriggerChat={() => setIsChatOpen(true)} 
                            />
                        </DashboardSection>
                </div>

            </div>

            {/* CHAT BUTTON (Corrigido o tamanho dos ícones) */}
            <button
                type="button"
                className="ai-floating-trigger-btn"
                onClick={() => setIsChatOpen((prev) => !prev)}
                style={{
                    background: isChatOpen
                        ? 'var(--color-medium-azure)'
                        : 'var(--color-orange)'
                }}
            >
                {isChatOpen ? <IoClose size={24} /> : <IoChatbubbleEllipses size={24} />}
            </button>

            {isChatOpen && (
                <div className="ai-chat-floating-panel">
                    <AIChatWidget />
                </div>
            )}
        </section>
    );
}
