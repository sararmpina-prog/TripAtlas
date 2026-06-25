import { MdOutlineEdit } from 'react-icons/md';
import { IoIosSearch } from "react-icons/io";
import { formatDate } from '../../utils/dateHelpers';
import TripIdentityBadge from '../TripIdentityBadge';
import '../../styles/TripSidePanel.css';

export default function TripSidePanelView({ 
    selectedTrip, 
    trips = [], 
    filteredTrips = [], 
    search, 
    onSearchChange, 
    onSelectTrip, 
    onStartCreate, 
    onStartEdit    
}) {

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
                    <p className="sidepanel-eyebrow">My trip dashboard</p>
                    
                    {selectedTrip && (
                        <button type="button" className="btn-edit-card" onClick={onStartEdit}>
                            <MdOutlineEdit size={18}/>
                        </button>
                    )}
                </div>

                <div>
                    {selectedTrip?.id && (
                        <div className="trip-badge-wrapper">
                            <TripIdentityBadge tripId={selectedTrip.id} />
                        </div>
                    )}

                    <h1>{tripData.title}</h1>
                </div>

                <p className="sidepanel-trip-summary">
                    {tripData.start_date || tripData.end_date ? (
                        `${tripData.destination} from ${formatDate(tripData.start_date)} to ${formatDate(tripData.end_date)}`
                    ) : (
                        `${tripData.destination} - Dates pending`
                    )}
                </p>

                {tripData.description && (
                    <p className="sidepanel-trip-description">{tripData.description}</p>
                )}
            </div>

            {/* BOTÃO PLAN A NEW TRIP */}
            <button 
                type="button" 
                className="btn-base btn-orange" 
                onClick={onStartCreate}
            >
                Plan a new trip
            </button>

            {/* BARRA DE PESQUISA */}
            {hasTrips && (
                <>
                    <div className="search-container">
                        <IoIosSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search trips..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="trip-search"
                        />
                    </div>

                    <div className="sidepanel-trip-selector">
                        <p>Select another trip:</p>
                        <div className="trip-list">
                            {filteredTrips.map((trip) => (
                                <button
                                    key={trip.id}
                                    type="button"
                                    className={
                                        Number(trip.id) === Number(tripData.id)
                                            ? "trip-button active"
                                            : "trip-button"
                                    }
                                    onClick={() => onSelectTrip(String(trip.id))} 
                                >
                                    {trip.title} - {trip.destination}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {!hasTrips && (
                <div className="sidepanel-trip-selector">
                    <p className="sidepanel-trip-selector-empty">
                        No trips available. Create a new trip to get started.
                    </p>
                </div>
            )}
        </div>
    );
}
