export const ALLOWED_EMAILS: readonly string[] = [
    'shafishazz580@gmail.com',
    'ajmalalungal78@gmail.com',
    'onrevvtechnology@gmail.com',
];

export const isAllowedEmail = (email?: string | null): boolean => {
    if (!email) return false;
    return ALLOWED_EMAILS.includes(email.trim().toLowerCase());
};

