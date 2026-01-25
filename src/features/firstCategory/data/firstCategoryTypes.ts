import { Timestamp } from "firebase/firestore";

export interface FirstCategoryProps {
    id: string; // category name converted to lowercase and no spaces
    categoryName: string;
    imageUrl: string | null;
    keywords: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    positionAt: Timestamp;
}