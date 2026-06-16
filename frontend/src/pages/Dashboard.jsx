import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FlightCard from '../components/FlightCard';
import { getFlights, getReserves, getTrips } from '../api';
import { getStoredToken, getStoredUser } from '../auth/authStorage';
import '../styles/Dashboard.css';

function formatDate(dateValue) {
    if (!dateValue) {
        return 'Date pending';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateValue));
}

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

function ReserveCard({ reserve }) {
    return (
        <article className="dashboard-info-card">
            <div className="dashboard-info-card__eyebrow">Accommodation reserve</div>
            <h5>Reserve #{reserve.id}</h5>
            <p>Accommodation ID: {reserve.accommodation_id}</p>
            <div className="dashboard-info-card__meta">
                <span>Check-in: {formatDate(reserve.check_in_date)}</span>
                <span>Check-out: {formatDate(reserve.check_out_date)}</span>
            </div>
        </article>
    );
}

export default function Dashboard() {
    const token = getStoredToken();
    const user = getStoredUser();
    const [selectedTripId, setSelectedTripId] = useState('');

    const tripsQuery = useQuery({
        queryKey: ['dashboard', 'trips'],
        queryFn: () => getTrips(token),
        enabled: Boolean(token),
    });

    const flightsQuery = useQuery({
        queryKey: ['dashboard', 'flights'],
        queryFn: () => getFlights(token),
        enabled: Boolean(token),
    });

    const reservesQuery = useQuery({
        queryKey: ['dashboard', 'reserves'],
        queryFn: () => getReserves(token),
        enabled: Boolean(token),
    });

    const trips = tripsQuery.data?.data ?? [];
    const flights = flightsQuery.data?.data ?? [];
    const reserves = reservesQuery.data?.data ?? [];

    const selectedTrip = useMemo(() => {
        if (!trips.length) {
            return null;
        }

        const activeTripId = selectedTripId || String(trips[0].id);
        return trips.find((trip) => String(trip.id) === String(activeTripId)) || trips[0];
    }, [selectedTripId, trips]);

    const selectedTripFlights = useMemo(() => {
        if (!selectedTrip) {
            return [];
        }

        return flights.filter((flight) => Number(flight.trip_id) === Number(selectedTrip.id));
    }, [flights, selectedTrip]);

    const selectedTripReserves = useMemo(() => {
        if (!selectedTrip) {
            return [];
        }

        return reserves.filter((reserve) => Number(reserve.trip_id) === Number(selectedTrip.id));
    }, [reserves, selectedTrip]);

    const isLoading = tripsQuery.isLoading || flightsQuery.isLoading || reservesQuery.isLoading;
    const hasError = tripsQuery.error || flightsQuery.error || reservesQuery.error;

    if (!token) {
        return (
            <section className="dashboard-page">
                <div className="dashboard-empty-state">
                    <h5>Dashboard</h5>
                    <p>You need to log in to view your trips.</p>
                </div>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="dashboard-page">
                <div className="dashboard-empty-state">
                    <h5>Loading your dashboard...</h5>
                </div>
            </section>
        );
    }

    if (hasError) {
        return (
            <section className="dashboard-page">
                <div className="dashboard-empty-state">
                    <h5>Dashboard unavailable</h5>
                    <p>{hasError.message}</p>
                </div>
            </section>
        );
    }

    if (!selectedTrip) {
        return (
            <section className="dashboard-page">
                <div className="dashboard-empty-state">
                    <h5>Welcome{user?.first_name ? `, ${user.first_name}` : ''}</h5>
                    <p>Your account is ready. Create your first trip to start seeing flights and accommodations here.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-sidepanel">
                <div>
                    <p className="dashboard-eyebrow">My trip dashboard</p>
                    <h1>{selectedTrip.title}</h1>
                    <p className="dashboard-trip_summary">
                        {selectedTrip.destination} from {formatDate(selectedTrip.start_date)} to {formatDate(selectedTrip.end_date)}
                    </p>
                    {selectedTrip.description && (
                        <p className="dashboard-trip_description">{selectedTrip.description}</p>
                    )}
                </div>

                <label className="dashboard-trip-picker">
                    <span>Select trip</span>
                    <select
                        value={selectedTrip ? String(selectedTrip.id) : ''}
                        onChange={(event) => setSelectedTripId(event.target.value)}
                    >
                        {trips.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                                {trip.title} - {trip.destination}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

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

                {/* COLUNA DA DIREITA: Caixa de Chat Completa para a AI */}
                <div className="ai-chat-container">
                    <div className="ai-chat__header">
                        <h2>AI Assistant</h2>
                        <span className="ai-badge" style={{ margin: 0 }}>Coming Soon</span>
                    </div>
                    
                    <div className="ai-chat__messages">
                        <h5 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)' }}>
                            Ask anything about {selectedTrip.destination}!
                        </h5>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '30ch', margin: 0 }}>
                            Get instant suggestions for sightseeing, local restaurants, or hidden gems.
                        </p>
                    </div>

                    <div className="ai-chat__input-area">
                        <div className="ai-chat__input-placeholder">
                            Ask about...
                        </div>
                        <div className="ai-chat__btn-placeholder"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}