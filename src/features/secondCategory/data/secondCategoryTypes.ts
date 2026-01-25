import { Timestamp } from "firebase/firestore";

export interface SecondCategoryProps {
    id: string; // category name converted to lowercase and no spaces
    categoryName: string;
    imageUrl: string | null;
    keywords: string[];
    firstCategoryId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    positionAt: Timestamp;
}
