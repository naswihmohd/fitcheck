import type { Timestamp } from "firebase/firestore";

export type NotificationType = "student" | "tutor" | "sales-executive" | "placement-executive" | "branches";
export type NotificationSendType = "individual" | "all";

export interface NotificationProps {
    id: string;
    imageUrl?: string | null;
    caption: string;
    description: string;
    createdAt: Timestamp;
    createdBy: string;
    sendType: NotificationSendType;
    type: NotificationType;
    studentId?: string | null;
    branchId?: string | null;
}
