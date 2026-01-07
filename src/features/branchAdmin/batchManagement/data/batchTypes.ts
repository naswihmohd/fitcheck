import type { Timestamp } from "firebase/firestore";

export interface BatchFormData {
    batchName: string;
    allowInstallmentPayments: boolean;
    batchStartDate: Timestamp | Date;
    batchEndDate: Timestamp | Date;
    batchPeriodStartTime: Timestamp | Date;
    batchPeriodEndTime: Timestamp | Date;
    tutorId: string;
    courseFee: number;
    registrationFee: string;
}

export interface BatchProps {
    id: string;
    batchName: string;
    allowInstallmentPayments: boolean;
    batchStartDate: Timestamp;
    batchEndDate: Timestamp;
    batchPeriodStartTime: Timestamp;
    batchPeriodEndTime: Timestamp;
    tutorId: string;
    courseFee: number;
    registrationFee: number;
    courseId: string;
    branchId: string;
    createdAt: Timestamp;
    keywords?: string[];
}

