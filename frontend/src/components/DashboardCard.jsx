import '../styles/DashboardCard.css';

export default function Card({ children, actions }) {
    return (
        <div className="card-wrapper">
            {actions && (
                <div className="card-actions">
                    {actions}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}
