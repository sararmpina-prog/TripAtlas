import { FaTrash } from 'react-icons/fa';
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
            <div className="journal-view-container" style={{ padding: '0.5rem 0' }}>
                
                {/* Estados visuais integrados da API */}
                {loading && <p className="p-muted">Loading AI travel insights...</p>}
                {error && <p className="auth-form-error">{error}</p>}

                {/* Listagem real das sugestões mapeadas com ação de delete */}
                {!loading && !error && suggestions.map((s) => (
                    <div 
                        key={s.id || s.title} 
                        className="journal-suggestion-item" 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            gap: '1rem',
                            marginBottom: '1.2rem',
                            borderBottom: '1px solid var(--border-light)',
                            paddingBottom: '0.8rem'
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <h4 style={{ color: 'var(--text-heading-dark)', fontSize: '0.98rem', margin: '0 0 0.3rem 0', fontWeight: '700' }}>
                                {s.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                {s.content}
                            </p>
                        </div>

                        {/* Botão de apagar elástico alinhado à direita */}
                        <button 
                            type="button" 
                            className="btn-delete-segment" 
                            onClick={() => onDeleteSuggestion(s.id, s.title)}
                            title="Delete AI suggestion"
                            style={{ position: 'static', padding: '6px' }}
                        >
                            <FaTrash size={12} style={{ color: 'var(--error-color-dark)' }} />
                        </button>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}
