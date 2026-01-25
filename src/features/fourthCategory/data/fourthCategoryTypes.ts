import { Timestamp } from "firebase/firestore";

export interface FourthCategoryProps {
    id: string; 
    categoryName: string;
    imageUrl: string | null;
    keywords: string[];
    firstCategoryId: string;
    secondCategoryId: string;
    thirdCategoryId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    positionAt: Timestamp;
}
