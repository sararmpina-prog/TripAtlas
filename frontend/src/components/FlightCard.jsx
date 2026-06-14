import "../styles/FlightCard.css";
import { FaPlane } from "react-icons/fa";

function FlightCard() {
  const flightDeparture = {
    airline: "Ryanair",
    type: "Direct Flight",
    departureTime: "08:00",
    departureAirport: "OPO",
    arrivalAirport: "CDG",
  };

    const flightArrival = {
    airline: "EasyJet",
    type: "Direct Flight",
    departureTime: "20:00",
    departureAirport: "CDG",
    arrivalAirport: "OPO",
  };


  return (
    <div className="flight-card">
      <div className="flight-info">
        <h4>{flightDeparture.type}</h4>
        <p>Premium segment</p>

        <h4>{flightDeparture.airline}</h4>
      </div>

      <div className="flight-divider" />

      <div className="flight-time">
        <FaPlane className="plane-icon" />

        <span>Departure</span>

        <strong>{flightDeparture.departureTime}</strong>
      </div>

         <div className="flight-info">
        <h4>{flightArrival.type}</h4>
        <p>Premium segment</p>

        <h4>{flightArrival.airline}</h4>
      </div>

      <div className="flight-divider" />

      <div className="flight-time">
        <FaPlane className="plane-icon" />

        <span>Arrival</span>

        <strong>{flightArrival.departureTime}</strong>
      </div>
    </div>
  );
}

export default FlightCard;