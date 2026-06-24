import { MdOutlineEdit } from 'react-icons/md';
import DashboardCard from '../DashboardCard';
import '../../styles/JournalCard.css';

export default function JournalView({ onEditClick }) {
    return (
        <DashboardCard
            actions={
                <button type="button" className="btn-edit-card" onClick={onEditClick}>
                    <MdOutlineEdit size={18}/>
                </button>
            }
        >
            <div className="journal-view-container">
                {/* O conteúdo das sugestões da AI lidas em modo Read-Only entra aqui */}
                <p>AI Suggestions for this trip will be displayed here.</p>
            </div>
        </DashboardCard>
    );
}
