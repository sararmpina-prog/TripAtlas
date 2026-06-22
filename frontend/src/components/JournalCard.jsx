import { useState } from 'react';
import { MdOutlineEdit, MdCheck, MdClose } from 'react-icons/md';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../../utils/dateHelpers';
import '../../styles/JournalCard.css';

export default function JournalCard({ journal, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(journal?.content || '');

    const handleSave = () => {
        if (onSave) {
            onSave({
                ...journal,
                content: text
            });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setText(journal?.content || '');
        setIsEditing(false);
    };

    return (
        <article
            className={`journal-card-wrapper ${isEditing ? 'editing' : ''}`}
            onClick={() => {
                if (!isEditing) setIsEditing(true);
            }}
        >
            {/* BOTÕES NO HOVER / EDIÇÃO */}
            <div className="journal-card-actions" onClick={(e) => e.stopPropagation()}>
                {!isEditing ? (
                    <button
                        type="button"
                        className="btn-edit-card"
                        onClick={() => setIsEditing(true)}
                    >
                        <MdOutlineEdit size={18} />
                    </button>
                ) : (
                    <div className="journal-edit-actions">
                        <button
                            type="button"
                            className="btn-save-card"
                            onClick={handleSave}
                        >
                            <MdCheck size={18} />
                        </button>

                        <button
                            type="button"
                            className="btn-cancel-card"
                            onClick={handleCancel}
                        >
                            <MdClose size={18} />
                        </button>
                    </div>
                )}
            </div>

            <div className="journal-card-body">
                {/* efeito visual de caderno */}
                <div className="journal-card-rings">
                    <span />
                    <span />
                    <span />
                </div>

                <div className="journal-card-eyebrow">Travel Journal</div>
                <h5 className="journal-card-title">
                    {journal?.title || 'Untitled note'}
                </h5>

                {journal?.date && (
                    <p className="journal-card-date">
                        <FaRegCalendarAlt /> {formatDate(journal.date)}
                    </p>
                )}

                <div className="journal-card-divider" />

                {!isEditing ? (
                    <div className="journal-card-content preview">
                        {text?.trim() ? (
                            <p>{text}</p>
                        ) : (
                            <p className="journal-card-placeholder">
                                Click to write your journal entry...
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="journal-card-content editing-area" onClick={(e) => e.stopPropagation()}>
                        <textarea
                            className="journal-card-textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write about your day, your experience, thoughts, memories..."
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </article>
    );
}