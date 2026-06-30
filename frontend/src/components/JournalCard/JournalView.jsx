import { FaRegTrashAlt } from "react-icons/fa";
import DashboardCard from '../DashboardCard';
import '../../styles/JournalCard.css';

export default function JournalView({ 
    suggestions = [], 
    loading, 
    error, 
    onDeleteSuggestion 
}) 

{

console.log("suggestions are",suggestions);
    return (
        <DashboardCard actions={null}>
            <div className="journal-view-container">
                
                {/* Estados visuais integrados da API */}
                {loading && <p className="p-muted">Loading AI travel insights...</p>}
                {error && <p className="auth-form-error">{error}</p>}

                {/* Listagem das sugestões mapeadas com ação de delete */}
                {!loading && !error && suggestions.map((s) => (
                    <div 
                        key={s.id} 
                        className="journal-suggestion-item" 
                    >
                        <div style={{ flex: 1 }}>
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
                            onClick={() => onDeleteSuggestion(s.id)}
                            title="Delete AI suggestion"
                        >
                            <FaRegTrashAlt size={14} />
                        </button>

                        <div
                            style={{
                                width: 30,
                                height: 30,
                                background: "red",
                                marginLeft: 10
                            }}
                        >
                            X
                        </div>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}
