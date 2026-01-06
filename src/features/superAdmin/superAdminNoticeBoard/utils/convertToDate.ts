import type { Timestamp } from "firebase/firestore";

// Helper function to safely convert createdAt to Date
export const convertToDate = (createdAt: Timestamp | Date | any): Date => {
    if (!createdAt) {
        return new Date();
    }

    // If it's already a Date object
    if (createdAt instanceof Date) {
        return createdAt;
    }

    // If it has toDate method (Firestore Timestamp)
    if (typeof createdAt.toDate === 'function') {
        return createdAt.toDate();
    }

    // If it's a serialized Timestamp object with seconds property
    if (createdAt.seconds !== undefined) {
        return new Date(createdAt.seconds * 1000 + (createdAt.nanoseconds || 0) / 1000000);
    }

    // If it's a number (timestamp)
    if (typeof createdAt === 'number') {
        // Check if it's in seconds or milliseconds
        return new Date(createdAt > 1000000000000 ? createdAt : createdAt * 1000);
    }

    // If it's a string, try to parse it
    if (typeof createdAt === 'string') {
        const parsed = new Date(createdAt);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    // Fallback to current date
    return new Date();
};