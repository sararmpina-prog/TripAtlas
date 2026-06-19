import { formatDate } from '../utils/dateHelpers';

export default function ReserveCard({ reserve }) {
    // Usa o nome vindo do JOIN do backend, ou usa o ID como plano de contingência se a API ainda não tiver o campo
    const accommodationName = reserve.accommodation_name || `Accommodation #${reserve.accommodation_id}`;

    return (
        <article className="dashboard-info-card">
            <div className="dashboard-info-card-eyebrow">Accommodation reserve</div>
            {/* Substituído o ID da reserva pelo Nome do Alojamento  */}
            <h5>{accommodationName}</h5>
            <div className="dashboard-info-card-meta">
                <p>Check-in: {formatDate(reserve.check_in_date)}</p>
                <p>Check-out: {formatDate(reserve.check_out_date)}</p>
            </div>
        </article>
    );
}
