import "../styles/FlightCard.css";
import FlightSegment from "./FlightSegment";

export default function FlightCard({ flight }) {
  if (!flight) return null;

  // Segmento de Ida (Dados Reais do Backend)
  const outboundNumber = flight.flight_number;
  const outboundAirline = flight.airline;
  const outboundDep = flight.departure_airport || 'TBD';
  const outboundArr = flight.arrival_airport || 'TBD';
  const outboundDepTime = flight.departure_datetime;
  const outboundArrTime = flight.arrival_datetime; // 💡 Adicionado

  // Segmento de Volta (Placeholder ou dados futuros)
  const returnNumber = flight.return_flight_number || null;
  const returnAirline = flight.return_airline || null;
  const returnDep = flight.arrival_airport || 'TBD'; 
  const returnArr = flight.departure_airport || 'TBD';
  const returnDepTime = flight.return_departure_datetime || null;
  const returnArrTime = flight.return_arrival_datetime || null;

  return (
    <div className="flight-card-container">
      {/* 1. Segmento de Ida */}
      <FlightSegment 
        type="Outbound"
        flightNumber={outboundNumber}
        airline={outboundAirline}
        departure={outboundDep}
        arrival={outboundArr}
        depTime={outboundDepTime}
        arrTime={outboundArrTime}
      />

      <div className="segments-spacer" />

      {/* 2. Segmento de Volta */}
      <FlightSegment 
        type="Return"
        flightNumber={returnNumber}
        airline={returnAirline}
        departure={returnDep}
        arrival={returnArr}
        depTime={returnDepTime}
        arrTime={returnArrTime}
      />
    </div>
  );
}
