import type { Timestamp } from "firebase/firestore";

export interface HolidayItem {
    id: string;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
    createdAt: Timestamp;
}

export interface HolidaysProps {
    id: string;
    branchId: string;
    companyId: string;
    createdAt: Timestamp;
    holidays: Record<string, HolidayItem>;
}
