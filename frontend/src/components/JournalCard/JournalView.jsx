import { MdOutlineEdit } from 'react-icons/md';
import DashboardCard from '../DashboardCard';
import '../../styles/JournalCard.css';

export default function JournalView({ suggestions = [], loading, error, onEditClick }) {
    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onEditClick}>
                    <MdOutlineEdit size={18}/>
                </button>
            }
        >
            <div className="journal-view-container">
                {/* 1. Estados visuais */}
                {loading && <p className="p-muted">Loading AI insights...</p>}
                {error && <p className="auth-form-error">{error}</p>}

                {/* 2. Listagem real das sugestões mapeadas */}
                {!loading && !error && suggestions.map((s) => (
                    <div key={s.id || s.title} className="journal-suggestion-item">
                        <h4>{s.title}</h4>
                        <p>{s.content}</p>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}
