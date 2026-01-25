import { Timestamp } from "firebase/firestore";

export interface UnitProps {
    id: string;
    name: string;
    keywords: string[];
    createdAt: Timestamp;
}
