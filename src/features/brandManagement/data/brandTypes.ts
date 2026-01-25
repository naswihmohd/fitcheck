import { Timestamp } from "firebase/firestore";

export interface BrandProps {
    id: string; 
    brandName: string;
    imageUrl: string | null;
    keywords: string[];
    createdAt: Timestamp;
}
