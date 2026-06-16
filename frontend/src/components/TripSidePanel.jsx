import { formatDate } from '../utils/dateHelpers';

export default function TripSidePanel({ selectedTrip, trips, onTripChange }) {
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
