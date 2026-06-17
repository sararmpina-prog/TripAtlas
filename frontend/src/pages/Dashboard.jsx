import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from "react-router";
import Header from '../components/Header';
import FlightCard from '../components/FlightCard';
import ReserveCard from '../components/ReserveCard';
import AIChatCard from '../components/AIChatCard';
import TripSidePanel from '../components/TripSidePanel';
import { getFlights, getReserves, getTrips } from '../api';
import { getStoredToken, getStoredUser } from '../auth/authStorage';
import '../styles/Dashboard.css';

function DashboardSection({ title, count, children }) {
    return (
        <section className="dashboard-section">
            <div className="dashboard-section__header">
                <div>
                    <h2>{title}</h2>
                    <p>{count} item{count === 1 ? '' : 's'}</p>
                </div>
            </div>
            <div className="dashboard-section__content">{children}</div>
        </section>
    );
}

export default function Dashboard() {
    const token = getStoredToken();
    const user = getStoredUser();
    const location = useLocation();
    const forcePlaceholder = location.state?.forcePlaceholder ?? false; // Permite forçar o placeholder para criar nova viagem do zero

    const [selectedTripId, setSelectedTripId] = useState('');

    const tripsQuery = useQuery({ queryKey: ['dashboard', 'trips'], queryFn: () => getTrips(token), enabled: Boolean(token) });
    const flightsQuery = useQuery({ queryKey: ['dashboard', 'flights'], queryFn: () => getFlights(token), enabled: Boolean(token) });
    const reservesQuery = useQuery({ queryKey: ['dashboard', 'reserves'], queryFn: () => getReserves(token), enabled: Boolean(token) });

    const trips = tripsQuery.data?.data ?? [];
    const flights = flightsQuery.data?.data ?? [];
    const reserves = reservesQuery.data?.data ?? [];

    //optimizar desempenho, memoriza calculo entre renderizações so recalcula se dependencias alteradas
    const selectedTrip = useMemo(() => {
        // Se o botão "Plan a new trip" foi clicado OU se a BD não tiver viagens, mostra placeholders
        if (forcePlaceholder || !trips.length) {
            return null; 
        }

        const activeTripId = selectedTripId || String(trips[0].id);
        
        return (
            trips.find(
                (trip) => String(trip.id) === String(activeTripId)
            ) || trips[0]
        );
    }, [selectedTripId, trips, forcePlaceholder]); // Adicionado forcePlaceholder aqui

    const selectedTripFlights = useMemo(() => {
    if (!selectedTrip) {
        return [];
    }
    const allFlights = flights || []; 
    return allFlights.filter((flight) => Number(flight.trip_id) === Number(selectedTrip.id));
}, [flights, selectedTrip]);

    const selectedTripReserves = useMemo(() => {
        if (!selectedTrip) {
            return [];
        }
        const allReserves = reserves || []; 
        return allReserves.filter((reserve) => Number(reserve.trip_id) === Number(selectedTrip.id));
    }, [reserves, selectedTrip]);


    return (
        <section className="dashboard-page">
            <Header />
        <div className="dashboard-content">
            {/* PAINEL LATERAL ISOLADO */}
            <TripSidePanel 
                selectedTrip={selectedTrip} 
                trips={trips} 
                onTripChange={setSelectedTripId}
            />

            <div className="dashboard-grid">
                {/* COLUNA DA ESQUERDA: Logística Empilhada */}
                <div className="dashboard-grid__logistics">
                    <DashboardSection title="Flights" count={selectedTripFlights.length}>
                        {selectedTripFlights.length > 0 ? (
                            selectedTripFlights.map((flight) => (
                                <FlightCard key={flight.id} flight={flight} />
                            ))
                        ) : (
                            <div className="dashboard-placeholder-card">
                                <h5>No flights yet</h5>
                                <p>Add flights to this trip and they will appear here.</p>
                            </div>
                        )}
                    </DashboardSection>

                    <DashboardSection title="Accommodations" count={selectedTripReserves.length}>
                        {selectedTripReserves.length > 0 ? (
                            selectedTripReserves.map((reserve) => (
                                <ReserveCard key={reserve.id} reserve={reserve} />
                            ))
                        ) : (
                            <div className="dashboard-placeholder-card">
                                <h5>No accommodation reserves yet</h5>
                                <p>When you attach a reserve to this trip, it will show up in this card.</p>
                            </div>
                        )}
                    </DashboardSection>
                </div>

                {/* COLUNA DA DIREITA: AI Chat Isolado */}
                <AIChatCard destination={selectedTrip?.destination} />
            </div>
        </div>
    </section>
    );
}
