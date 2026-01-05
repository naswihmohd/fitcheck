import type { Timestamp } from "firebase/firestore";


export interface BranchProps {
    id: string;
    branchName: string;
    phoneNumber: string;
    address: string;

    contactName: string;
    alternativeNumber?: string;

    bankDetails: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        qrCodeUrl: string | null; // uploaded QR
    };
    createdAt: Timestamp;
    keywords: string[];
    isActive: boolean;
    updatedAt?: Timestamp;
}
