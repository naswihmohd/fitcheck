import { Timestamp } from "firebase/firestore";

export interface KeywordProps {
    id: string;
    keywordName: string;
    keywords: string[];
    createdAt: Timestamp;
}