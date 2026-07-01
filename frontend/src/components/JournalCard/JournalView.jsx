import { FaRegTrashAlt } from "react-icons/fa";
import DashboardCard from '../DashboardCard';
import '../../styles/JournalCard.css';

export default function JournalView({ 
    suggestions = [], 
    loading, 
    error, 
    onDeleteSuggestion 
}) {
    return (
        <DashboardCard actions={null}>
            <div className="journal-view-container">
                
                {/* Estados visuais integrados da API */}
                {loading && <p className="p-muted">Loading AI travel insights...</p>}
                {error && <p className="auth-form-error">{error}</p>}

                {/* Listagem das sugestões mapeadas com ação de delete */}
                {!loading && !error && suggestions.map((s) => (
                    <div 
                        key={s.id || s.title} 
                        className="journal-suggestion-item" 
                    >
                        <div>
                            <h4>
                                {s.title}
                            </h4>
                            <p>
                                {s.content}
                            </p>
                        </div>

                        {/* Botão de apagar elástico alinhado à direita */}
                        <button 
                            type="button" 
                            className="btn-delete-icon" 
                            onClick={() => onDeleteSuggestion(s.id, s.title)}
                            title="Delete AI suggestion"
                        >
                            <FaRegTrashAlt size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}
