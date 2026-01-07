import type { Timestamp } from "firebase/firestore";

export interface TutorProps {
    id: string;
    tutorId: string;
    name: string;
    grade: string;
    email: string;
    phone: string;
    courseId: string;
    isActive: boolean;
    imageUrl?: string;
    branchId: string;
    createdAt: Timestamp;
}