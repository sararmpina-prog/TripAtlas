export function formatDate(dateValue) {
    if (!dateValue) return 'Date pending';
<<<<<<< HEAD
    
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', 
        month: 'short', 
=======

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
>>>>>>> frontend-limpo
        year: 'numeric',
    }).format(new Date(dateValue));
}

export function formatTime(dateTimeValue) {
    if (!dateTimeValue) return '--:--';
<<<<<<< HEAD
    
=======

>>>>>>> frontend-limpo
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateTimeValue));
<<<<<<< HEAD
=======
}

export function toDateTimeLocalInput(value) {
    if (!value) return '';

    // correto
    if (value.includes('T')) {
        return value.slice(0, 16);
    }

    // só data
    if (value.length === 10) {
        return `${value}T00:00`;
    }

    // formato SQL
    return value.replace(' ', 'T').slice(0, 16);
>>>>>>> frontend-limpo
}