import { FaPlane, FaArrowRight } from "react-icons/fa";
import { formatTime } from '../utils/dateHelpers';

export default function FlightSegment({ 
  type, // 'Outbound' ou 'Return'
  flightNumber, 
  airline, 
  departure, 
  arrival, 
  depTime,
  arrTime 
}) {
  const isBooked = Boolean(depTime);

  return (
    <div className={`flight-segment ${!isBooked ? 'segment-pending' : ''}`}>
      {/* Informação do Voo (Esquerda) */}
      <div className="flight-info">
        <span className="segment-type-badge">{type}</span>
        <h5>{flightNumber || 'Flight TBD'}</h5>
        <p>{departure} to {arrival}</p>
        <h5>{airline || 'No airline assigned'}</h5>
      </div>

      <div className="flight-divider" />

      {/* Horários de Partida e Chegada Lado a Lado (Direita) */}
      <div className="flight-timeline">
        
        {/* Ícone Avião Indicador de Direção */}
        <div className="timeline-icon-area">
          <FaPlane className={`plane-icon-timeline ${type === 'Return' ? 'plane-return' : ''}`} />
        </div>

        {/* Bloco de Partida */}
        <div className="time-block">
          <span>Departure</span>
          <p className="p-strong">{isBooked ? formatTime(depTime) : '--:--'}</p>
        </div>

        {/* Ícone Seta */}
        <div className="timeline-icon-area">
          <FaArrowRight />
        </div>

        {/* Bloco de Chegada */}
        <div className="time-block">
          <span>Arrival</span>
          <p className="p-strong">
            {isBooked ? (arrTime ? formatTime(arrTime) : '--:--') : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
}
