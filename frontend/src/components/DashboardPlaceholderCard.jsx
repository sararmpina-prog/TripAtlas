import '../styles/DashboardPlaceholderCard.css';
import Card from './DashboardCard';

export default function PlaceholderCard({ resource, hasTrip, onClick }) {
    // Inicializa o resourceName com o valor padrão do recurso para nunca vir undefined
    let resourceName = resource;
    let description = "";

    if (resource === 'reserves') {
        resourceName = 'accommodation reserves';
        description = hasTrip 
            ? "Click here to attach an accommodation reserve." 
            : "Plan a trip first using the sidebar to unlock accommodation logging.";
    } else if (resource === 'flights') {
        resourceName = 'flights'; // Garante que a string fica preenchida
        description = hasTrip 
            ? "Click here to add flights to this trip." 
            : "Plan a trip first using the sidebar to unlock flight scheduling.";
    }

    // LOGÍSTICA EXCLUSIVA PARA O JOURNAL
    if (resource === 'journal') {
        return (
            <Card actions={null}>
                <div className="dashboard-placeholder-card text-center">
                    <h5>No travel journal entries yet</h5>
                    <p>
                        {hasTrip 
                            ? "Open the AI Travel Assistant below to start generating suggestions for your travel journal." 
                            : "Plan a trip first using the sidebar to unlock your travel journal."}
                    </p>
                    
                    {hasTrip && onClick && (
                        <div className='journal-clickable'>
                            <button 
                                type="button" 
                                className="btn-base btn-orange" 
                                onClick={onClick}
                            >
                                Chat with AI Travel Assistant
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        );
    }

    // Retorno padrão seguro para os outros cartões (Voos e Reservas)
    return (
        <Card actions={null}>
            <button
                type="button"
                className={`dashboard-placeholder-btn ${hasTrip ? 'card-clickable' : 'card-disabled'}`}
                onClick={onClick}
                disabled={!hasTrip || !onClick}
            >
                <h5>No {resourceName} yet</h5>
                <p>{description}</p>
            </button>
        </Card>
    );
}
