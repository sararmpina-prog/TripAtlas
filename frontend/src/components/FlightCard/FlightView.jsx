import { FaEdit } from "react-icons/fa";
import { MdOutlineEdit } from 'react-icons/md';
import FlightSegmentView from "./FlightSegmentView";
import '../../styles/FlightCard.css';

export default function FlightView({ outboundSegments = [], returnSegments = [], onEditClick }) {
    const hasReturn = returnSegments.length > 0;

    return (
        <article className="flight-journey-wrapper">
            
            {/* BOTÃO MANAGE DISCRETO NO HOVER */}
            <div className="flight-card-hover-actions">
                <button 
                    type="button" 
                    className="btn-card-action btn-card-edit" 
                    onClick={onEditClick}
                >
                    <MdOutlineEdit size={18}/>
                </button>
            </div>

            {/* CONTAINER DO CARTÃO PRINCIPAL */}
            <div className="flight-card-body">
                    {/* PARTE SUPERIOR: OUTBOUND */}
                    <p className="segment-direction-badge">Outbound</p>
                    <div className="journey-vertical-block">
                      {outboundSegments.map((segment, index) => (
                        <div key={segment.id}>
                          <FlightSegmentView
                            direction="Outbound"
                            flightNumber={segment.flight_number}
                            airline={segment.airline}
                            departure={segment.departure_airport || 'TBD'}
                            arrival={segment.arrival_airport || 'TBD'}
                            depTime={segment.departure_datetime}
                            arrTime={segment.arrival_datetime}
                          />

                          {index < outboundSegments.length - 1 && (
                            <div className="flight-segment-divider" />
                          )}
                        </div>
                      ))}
                    </div>

                    <span className="flight-direction-divider " />

                    {/* PARTE INFERIOR: RETURN */}
                    <p className="segment-direction-badge">Return</p>
                    <div className="journey-vertical-block">
                      {hasReturn ? (
                        returnSegments.map((segment, index) => (
                          <div key={segment.id}>
                            <FlightSegmentView
                              direction="Return"
                              flightNumber={segment.flight_number}
                              airline={segment.airline}
                              departure={segment.departure_airport || 'TBD'}
                              arrival={segment.arrival_airport || 'TBD'}
                              depTime={segment.departure_datetime}
                              arrTime={segment.arrival_datetime}
                          />

                          {index < returnSegments.length - 1 && (
                            <div className="flight-segment-divider" />
                          )}
                        </div>
                        ))
                        ) : (
                            /* MODO FANTASMA (quando o voo de regresso não está marcado) */
                            <div className="flight-segment-pending">
                                <FlightSegmentView 
                                    direction="Return"
                                    flightNumber="FLIGHT TBD"
                                    airline="NO AIRLINE ASSIGNED"
                                    departure={outboundSegments[outboundSegments.length - 1]?.arrival_airport || 'TBD'} 
                                    arrival={outboundSegments[0]?.departure_airport || 'TBD'}
                                    depTime={null}
                                    arrTime={null}
                                />
                            </div>
                        )}
                    </div>

            </div>
        </article>
    );
}
