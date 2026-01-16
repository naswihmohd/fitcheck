import type { Timestamp } from "firebase/firestore";

export interface CompanyProps {
    id: string;
    userId: string;
    isActive: boolean;
    keywords: string[];
    createdAt: Timestamp;

    branches: Record<string, BranchProps>;
    owner: OwnerInfo;
    companyInfo: CompanyInfo;
}

export interface OwnerInfo {
    ownerName: string;
    mobileNumber: string;
    email: string;
}

export interface CompanyInfo {
    companyName: string;
    companyNumber: string;
    businessType: string;
    gstNumber?: string | null;
    address?: string | null;
    state: string;
}

export interface BranchProps {
    id: string;
    isActive: boolean;
    isInitialBranch?: boolean;
    branchName: string;
    contactInfo: BranchContactInfo;
    location: BranchLocation;
    createdAt: Timestamp;
}

export interface BranchContactInfo {
    email: string | null;
    phoneNumber: string | null;
    whatsappNumber: string | null;
}

export interface BranchLocation {
    deliveryDistance: number | null;
    latitude: number | null;
    longitude: number | null;
}



