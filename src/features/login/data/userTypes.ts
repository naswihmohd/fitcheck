import type { Timestamp } from "firebase/firestore";


export interface UserProps {
    id: string;
    name: string;
    companyId: string;
    email: string;
    createdAt: Timestamp;
    role: "admin" | "manager" | "user";
    keywords: string[];
    isActive: boolean;
}
