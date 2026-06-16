export function formatDate(dateValue) {
    if (!dateValue) return 'Date pending';
    
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
    }).format(new Date(dateValue));
}

export function formatTime(dateTimeValue) {
    if (!dateTimeValue) return '--:--';
    
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateTimeValue));
}