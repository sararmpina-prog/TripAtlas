import { formatDate } from '../utils/dateHelpers';

export default function ReserveCard({ reserve }) {
    return (
        <article className="dashboard-info-card">
            <div className="dashboard-info-card__eyebrow">Accommodation reserve</div>
            <h5>Reserve #{reserve.id}</h5>
            <p>Accommodation ID: {reserve.accommodation_id}</p>
            <div className="dashboard-info-card__meta">
                <span>Check-in: {formatDate(reserve.check_in_date)}</span>
                <span>Check-out: {formatDate(reserve.check_out_date)}</span>
            </div>
        </article>
    );
}
