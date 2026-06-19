import "../styles/FlightCard.css";
import FlightSegment from "./FlightSegment";
import { useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function FlightCard({ flight }) {
  if (!flight) return null;

  // ESTADOS DECLARADOS: Evita o erro de "ReferenceError" no browser
  const [isEditing, setIsEditing] = useState(false);

  // FUNÇÃO DECLARADA: Evita o erro de "ReferenceError" no clique do caixote do lixo
  const handleDelete = () => {
    alert(`Delete function triggered for flight ID: ${flight.id}`);
  };


  // Segmento de Ida (Dados Reais do Backend)
  const outboundNumber = flight.flight_number;
  const outboundAirline = flight.airline;
  const outboundDep = flight.departure_airport || 'TBD';
  const outboundArr = flight.arrival_airport || 'TBD';
  const outboundDepTime = flight.departure_datetime;
  const outboundArrTime = flight.arrival_datetime;

  // Segmento de Volta (Placeholder ou dados futuros)
  const returnNumber = flight.return_flight_number || null;
  const returnAirline = flight.return_airline || null;
  const returnDep = flight.arrival_airport || 'TBD'; 
  const returnArr = flight.departure_airport || 'TBD';
  const returnDepTime = flight.return_departure_datetime || null;
  const returnArrTime = flight.return_arrival_datetime || null;

    return (
        <div className="logistics-card-wrapper">
            {/* CONTROLOS DISCRETOS: Só aparecem ao passar o rato */}
            <div className="logistics-card-hover-actions">
                <button 
                    type="button" 
                    className="btn-card-action btn-card-edit" 
                    onClick={() => setIsEditing(true)}
                    title="Edit item"
                >
                    <FaEdit />
                </button>
                <button 
                    type="button" 
                    className="btn-card-action btn-card-delete" 
                    onClick={handleDelete}
                    title="Delete item"
                >
                    <MdDelete />
                </button>
            </div>

            <div className="flight-card-body">
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
            </div>
        </div>
    );
}

