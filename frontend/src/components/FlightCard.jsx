import { useState } from 'react';
import FlightSegment from "./FlightSegment";
import { FaEdit } from "react-icons/fa";
import "../styles/FlightCard.css";

export default function FlightCard({ flight }) {
  if (!flight) return null;

  // Estado para abrir/fechar o formulário unificado de gestão de voos
  const [isEditing, setIsEditing] = useState(false);

  // Estados dos inputs do formulário unificado (Carrega os dados existentes)
  const [outboundNumber, setOutboundNumber] = useState(flight.flight_number || '');
  const [outboundAirline, setOutboundAirline] = useState(flight.airline || '');
  
  // Estados para o voo de volta (Pode começar vazio se o utilizador ainda não o marcou)
  const [returnNumber, setReturnNumber] = useState(flight.return_flight_number || '');
  const [returnAirline, setReturnAirline] = useState(flight.return_airline || '');

  const handleSaveAllFlights = () => {
    // Mutação vai guardar a Ida e a Volta juntas na BD
    console.log("A salvar toda a logística de voos...", {
        outbound: { outboundNumber, outboundAirline },
        return: { returnNumber, returnAirline }
    });
    setIsEditing(false);
  };

  // Verificação para o modo de exibição normal
  const hasReturnFlight = Boolean(flight.return_flight_number);

  // MODO FORMULÁRIO UNIFICADO (Gerir Ida e Volta juntas)
  if (isEditing) {
    return (
      <div className="logistics-card-wrapper edit-mode-box" style={{ background: 'var(--surface-card)', padding: '1.5rem', borderRadius: '16px', border: '2px solid var(--color-orange)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-heading-dark)' }}>Manage Trip Flights</h4>
        
        {/* BLOCO DA IDA */}
        <div className="form-flight-section" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-orange)', textTransform: 'uppercase' }}>✈️ Outbound Flight</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" value={outboundNumber} onChange={(e) => setOutboundNumber(e.target.value)} placeholder="Flight Number (ex: TP123)" style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
            <input type="text" value={outboundAirline} onChange={(e) => setOutboundAirline(e.target.value)} placeholder="Airline (ex: TAP)" style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
          </div>
        </div>

        {/* BLOCO DA VOLTA */}
        <div className="form-flight-section" style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-orange)', textTransform: 'uppercase' }}>🛬 Return Flight</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" value={returnNumber} onChange={(e) => setReturnNumber(e.target.value)} placeholder={hasReturnFlight ? "Flight Number" : "➕ Add Return Flight Number"} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
            <input type="text" value={returnAirline} onChange={(e) => setReturnAirline(e.target.value)} placeholder="Airline" style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
          </div>
        </div>

        {/* ACÇÕES DO FORMULÁRIO */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-base btn-orange" onClick={handleSaveAllFlights} style={{ padding: '0.5rem 1rem' }}>Save Flights</button>
          <button type="button" className="btn-base" onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button type="button" style={{ padding: '0.5rem 1rem', background: '#fff0f0', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} onClick={() => { if(window.confirm("Delete all flights?")) setIsEditing(false); }}>Remove Journey</button>
        </div>
      </div>
    );
  }

  // MODO VISUALIZAÇÃO PADRÃO (Com um único botão discreto no cabeçalho do cartão)
  return (
      <div className="logistics-card-wrapper" style={{ position: 'relative' }}>
          
          {/* BOTÃO ÚNICO NO HOVER DO CABEÇALHO */}
          <div className="logistics-card-hover-actions">
              <button 
                  type="button" 
                  className="btn-card-action btn-card-edit" 
                  onClick={() => setIsEditing(true)}
                  title="Manage all flights for this journey"
              >
                  <FaEdit /> Manage
              </button>
          </div>

          <div className="flight-card-body">
              <div className="flight-card-container">
                <FlightSegment 
                  type="Outbound"
                  flightNumber={flight.flight_number}
                  airline={flight.airline}
                  departure={flight.departure_airport || 'TBD'}
                  arrival={flight.arrival_airport || 'TBD'}
                  depTime={flight.departure_datetime}
                  arrTime={flight.arrival_datetime}
                />
                
                <div className="segments-spacer" />
                
                <FlightSegment 
                  type="Return"
                  flightNumber={flight.return_flight_number || null}
                  airline={flight.return_airline || null}
                  departure={flight.arrival_airport || 'TBD'} 
                  arrival={flight.departure_airport || 'TBD'}
                  depTime={flight.return_departure_datetime || null}
                  arrTime={flight.return_arrival_datetime || null}
                />
              </div>
          </div>
      </div>
  );
}
