import type { Timestamp } from "firebase/firestore";


export interface UserProps {
    id: string;
    name: string;
    branchId: string | null;
    email: string;
    createdAt: Timestamp;
    role: "admin" | "branchAdmin";
    access: Record<AccessKey, boolean>;
    keywords: string[];
    isActive: boolean;
}

export type AccessKey =
    | "dashboard"
    | "salesExecutiveManagement"
    | "feeManagement"
    | "batchManagement"
    | "tutorManagement"
    | "studentManagement"
    | "placementManagement"
    | "noticeSettings"
    | "testPortal"
    | "appointments";