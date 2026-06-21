import { formatDate } from '../../utils/dateHelpers';
import { FaEdit, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { MdOutlineEdit } from 'react-icons/md';
import { useState } from 'react';
import '../../styles/ReserveCard.css';

export default function ReserveView({ reserve, onEditClick }) {
    const accommodationName = reserve.accommodation_name || `Accommodation #${reserve.accommodation_id}`;
    const propertyAddress = reserve.address || reserve.accommodation_address || 'Address not provided';

    return (
        <article className="reserve-card-wrapper">
            
            {/* BOTÃO MANAGE NO HOVER */}
            <div className="logistics-card-actions">
                <button
                    type="button"
                    className="btn-edit-card"
                    onClick={onEditClick}>
                         <MdOutlineEdit size={18}/>
                    </button>
            </div>

            <div className="reserve-card-body">
                <div className="reserve-card-eyebrow">Accommodation Reserve</div>
                <h5 className="reserve-card-title">{accommodationName}</h5>
                
                {propertyAddress && (
                    <p className="reserve-card-address">
                        <FaMapMarkerAlt /> {propertyAddress}
                    </p>
                )}

                <div className="reserve-card-divider" />

                <div className="reserve-card-meta">
                    <div className="reserve-card-meta-block">
                        <p className="reserve-card-meta-title">Check-in</p>
                        <p className="reserve-card-meta-date">{formatDate(reserve.check_in_date)}</p>
                        {reserve.check_in_time && (
                            <p className="reserve-card-meta-time">
                                <FaClock /> {reserve.check_in_time.slice(0, 5)}
                            </p>
                        )}
                    </div>
                    
                    <div className="reserve-card-meta-block right">
                        <p className="reserve-card-meta-title">Check-out</p>
                        <p className="reserve-card-meta-date">{formatDate(reserve.check_out_date)}</p>
                        {reserve.check_out_time && (
                            <p className="reserve-card-meta-time">
                                <FaClock /> {reserve.check_out_time.slice(0, 5)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
