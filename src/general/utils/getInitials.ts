// Utility function to get first two letters of name
export const getInitials = (name: string): string => {
    if (!name) return 'U'; // Default to 'U' for User if no name

    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
};