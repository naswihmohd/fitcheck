export interface ApplicationProps {
    companyInfo: CompanyInfo;
    socialMedia?: SocialMedia;
}

export interface CompanyInfo {
    companyName: string;
    email: string;
    phoneNumber: string;
    taxNumber: string;
    country: string;
    currency: string;
    address: string;
}

export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    x?: string;
    telegram?: string;
    whatsapp?: string;
    discord?: string;
    reddit?: string;
    pinterest?: string;
}