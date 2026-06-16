import "../styles/FlightCard.css";
import { FaPlane } from "react-icons/fa";

function formatTime(dateTimeValue) {
  if (!dateTimeValue) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateTimeValue));
}

function FlightCard({ flight }) {
  if (!flight) {
    return null;
  }

  const airline = flight.airline || 'Airline not defined';
  const flightNumber = flight.flight_number || 'Flight number pending';
  const departureAirport = flight.departure_airport || 'TBD';
  const arrivalAirport = flight.arrival_airport || 'TBD';


  return (
    <div className="flight-card">
      <div className="flight-info">
        <h5>{flightNumber}</h5>
        <p>{departureAirport} to {arrivalAirport}</p>

        <h5>{airline}</h5>
      </div>

      <div className="flight-divider" />

      <div className="flight-time">
        <FaPlane className="plane-icon" />

        <span>Departure</span>

        <strong>{formatTime(flight.departure_datetime)}</strong>
      </div>

      <div className="flight-info">
        <h5>Arrival</h5>
        <p>{arrivalAirport}</p>

        <h5>{airline}</h5>
      </div>

      <div className="flight-divider" />

      <div className="flight-time">
        <FaPlane className="plane-icon" />

        <span>Arrival</span>

        <strong>{formatTime(flight.arrival_datetime)}</strong>
      </div>
    </div>
  );
}

export default FlightCard;