import { Timestamp } from "firebase/firestore";

export interface ThirdCategoryProps {
    id: string; // category name converted to lowercase and no spaces
    categoryName: string;
    imageUrl: string | null;
    keywords: string[];
    firstCategoryId: string;
    secondCategoryId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    positionAt: Timestamp;
}
