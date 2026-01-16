import { Timestamp } from "firebase/firestore";

export const formatDate = (dateValue: Timestamp | string | null | undefined): string => {
    if (!dateValue) return 'N/A';
    try {
        let date: Date;
        if (dateValue instanceof Timestamp || (dateValue && typeof (dateValue as any).toDate === 'function')) {
            date = (dateValue as Timestamp).toDate();
        } else if (typeof dateValue === 'string') {
            // Handle empty string
            if (dateValue.trim() === '') {
                return 'N/A';
            }
            date = new Date(dateValue);
        } else {
            return 'N/A';
        }
        
        // Check if date is valid
        if (!date || isNaN(date.getTime())) {
            return 'N/A';
        }
        
        // Try with en-IN locale, fallback to en-US if it fails
        try {
            const formatted = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            // Check if formatting returned a valid string
            if (formatted && typeof formatted === 'string' && formatted !== 'Invalid Date') {
                return formatted;
            }
        } catch (localeError) {
            // Fallback to en-US if en-IN fails
        }
        
        // Fallback to en-US locale
        try {
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (formatted && typeof formatted === 'string' && formatted !== 'Invalid Date') {
                return formatted;
            }
        } catch (fallbackError) {
            // If both fail, use manual formatting
        }
        
        // Manual fallback formatting
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    } catch (error) {
        return 'N/A';
    }
};