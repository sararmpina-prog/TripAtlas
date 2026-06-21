import { FaPlane, FaArrowRight } from "react-icons/fa";
import { MdFlightTakeoff, MdFlightLand } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { formatTime } from '../../utils/dateHelpers';

export default function FlightSegmentView({
  direction, // 'Outbound' or 'Return'
  flightNumber,
  airline,
  departure,
  arrival,
  depTime,
  arrTime
}) {
  const isBooked = Boolean(depTime);

  return (
    <div className={`flight-segment ${!isBooked ? 'flight-segment-pending' : ''}`}>
      {/* Informação do Voo (Esquerda) */}
      <div className="flight-info">
        <h5>{flightNumber || 'Flight TBD'}</h5>
        <p>{departure} to {arrival}</p>
        <h5>{airline || 'No airline assigned'}</h5>
      </div>

      {/* Ícone Avião Indicador de Direção */}
        <div className={`plane-icon-timeline ${direction === 'Outbound' ? '' : 'plane-return'}`}>
          <FaPlane />
        </div>

      {/* Horários de Partida e Chegada Lado a Lado (Direita) */}
      <div className="flight-timeline">

        {/* Bloco de Partida */}
        <div className="time-block">
          <div className="time-block-departure">
            <span><MdFlightTakeoff className="flight-icon" /></span>
            <p>Departure</p>
          </div>
          <p className="p-strong">
            {isBooked ? formatTime(depTime) : '--:--'}</p>
        </div>

        {/* Ícone Seta */}
        <div className="timeline-icon-arrow">
          <IoIosArrowForward />
        </div>

        {/* Bloco de Chegada */}
        <div className="time-block">
          <div className="time-block-arrival">
            <span><MdFlightLand className="flight-icon" /></span>
            <p>Arrival</p>
          </div>
          <p className="p-strong">
            {isBooked ? (arrTime ? formatTime(arrTime) : '--:--') : 'Pending'}
          </p>
        </div>

      </div>
    </div>
  );
}
