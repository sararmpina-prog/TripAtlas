import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router";

import Header from '../components/Header';
import FlightCard from '../components/FlightCard';
import ReserveCard from '../components/ReserveCard';
import AIChatWidget from '../components/AIChatWidget';
import TripSidePanel from '../components/TripSidePanel';
import TravelJournal from '../components/TravelJournal';

import { getSuggestions } from "../api/journal";
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

    const tripsQuery = useQuery({
        queryKey: ['dashboard', 'trips'],
        queryFn: () => getTrips(token),
        enabled: Boolean(token)
    });

    const flightsQuery = useQuery({
        queryKey: ['dashboard', 'flights'],
        queryFn: () => getFlights(token),
        enabled: Boolean(token)
    });

    const reservesQuery = useQuery({
        queryKey: ['dashboard', 'reserves'],
        queryFn: () => getReserves(token),
        enabled: Boolean(token)
    });

    const trips = tripsQuery.data?.data ?? [];
    const flights = flightsQuery.data?.data ?? [];
    const reserves = reservesQuery.data?.data ?? [];

    const selectedTrip = useMemo(() => {
        if (!trips.length || selectedTripId === null) return null;

        return trips.find(
            (trip) => String(trip.id) === String(selectedTripId)
        ) || null;
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

    const selectedTripFlights = useMemo(() => {
        if (!selectedTrip) return [];
        return flights.filter(
            (flight) => Number(flight.trip_id) === Number(selectedTrip.id)
        );
    }, [flights, selectedTrip]);

    const selectedTripAccommodationReserves = useMemo(() => {
        if (!selectedTrip) return [];
        return reserves.filter(
            (reserve) => Number(reserve.trip_id) === Number(selectedTrip.id)
        );
    }, [reserves, selectedTrip]);

    console.log("selectedTrip:", selectedTrip);

    //Sugestões
    const [suggestions, setSuggestions] = useState([]);

//      useEffect(() => {
//     console.log("suggestions state:", suggestions);
//     if (!tripName || !token) return;

//     async function loadSuggestions() {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await getSuggestions(tripName, token);
//         console.log("RES:", res);
//         console.log("RES.DATA:", res.data);
//         setSuggestions(res.data || []);
//       } catch (err) {
//         console.error(err);
//         console.error("Suggestions error:", err);
//         setError(err.message || "Failed to load suggestions");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadSuggestions();
//   }, [tripName, token]);

    useEffect(() => {
        async function load() {
            if (!selectedTrip) return;

            const res = await getSuggestions(selectedTrip.title, token);
            setSuggestions(res.data || []);
        }

        load();
        }, [selectedTrip]);

    return (
        <section className="dashboard-page">
            <Header />

            <div className="dashboard-content">
                <TripSidePanel
                    selectedTrip={selectedTrip}
                    trips={trips}
                    onTripChange={setSelectedTripId}
                />

                {/* GRID PRINCIPAL */}
                <div className="dashboard-grid">

                    {/* ESQUERDA */}
                    <div className="dashboard-grid-logistics">

                        {/* FLIGHTS */}
                        <DashboardSection
                            title="Flights"
                            count={selectedTripFlights.length}
                        >
                            {selectedTripFlights.length > 0 ? (
                                selectedTripFlights.map((flight) => (
                                    <FlightCard key={flight.id} flight={flight} />
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className={`dashboard-placeholder-card ${
                                        selectedTrip ? 'card-clickable' : 'card-disabled'
                                    }`}
                                    disabled={!selectedTrip}
                                    onClick={() =>
                                        navigate(`/flights/create?tripId=${selectedTrip.id}`)
                                    }
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

                        {/* ACCOMMODATIONS */}
                        <DashboardSection
                            title="Accommodations"
                            count={selectedTripAccommodationReserves.length}
                        >
                            {selectedTripAccommodationReserves.length > 0 ? (
                                selectedTripAccommodationReserves.map((reserve) => (
                                    <ReserveCard key={reserve.id} reserve={reserve} />
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className={`dashboard-placeholder-card ${
                                        selectedTrip ? 'card-clickable' : 'card-disabled'
                                    }`}
                                    disabled={!selectedTrip}
                                    onClick={() =>
                                        navigate(`/accommodations/create?tripId=${selectedTrip.id}`)
                                    }
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

                    {/* DIREITA - JOURNAL */}
                    <div className="dashboard-grid-journal">
                        <DashboardSection title="Travel Journal" count={suggestions.length}>
                            {selectedTrip && (
                            <TravelJournal
                                tripName={selectedTrip.title}
                                token={token}
                                suggestions={suggestions}
                                setSuggestions={setSuggestions}
                            />
                            )}
                        </DashboardSection>
                    </div>

                </div>
            </div>

            {/* CHAT BUTTON */}
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