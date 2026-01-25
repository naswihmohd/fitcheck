import { Timestamp } from "firebase/firestore";

export interface ColorProps {
    id: string;
    name: string;
    hexCode: string;
    keywords: string[];
    createdAt: Timestamp;
}
