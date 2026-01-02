export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";

    // Ensure it starts with + and has digits only after that
    const cleaned = phone.replace(/\s+/g, "");

    // Match +91 and the 10-digit number
    const match = cleaned.match(/^(\+\d{2})(\d{4})(\d{3})(\d{3})$/);

    if (!match) {
        // If format not matched, return original safely
        return phone;
    }

    const [, countryCode, part1, part2, part3] = match;

    return `${countryCode} ${part1} ${part2} ${part3}`;
};
