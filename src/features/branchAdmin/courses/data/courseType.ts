import type { Timestamp } from "firebase/firestore";

export interface CourseProps {
    id: string;
    courseName: string;
    courseDuration: string;
    courseFee: number;
    createdAt: Timestamp;
    branchId: string;
    keywords: string[];
}