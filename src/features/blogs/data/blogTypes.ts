import { Timestamp } from "firebase/firestore";

export interface BlogProps {
    id: string;
    order?: number;
    uniqueUrlId: string;
    title: string;
    shortDescription: string;
    content: string; // HTML string
    coverImageUrl: string;
    keywords: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isActive: boolean;
}
