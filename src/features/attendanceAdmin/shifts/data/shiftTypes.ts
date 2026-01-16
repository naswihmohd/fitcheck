import type { Timestamp } from "firebase/firestore";

export interface ShiftsProps {
    branchId: string;
    companyId: string;
    id: string; // This is the shift document id
    createdAt: Timestamp;
    shifts: Record<string, Shift>; // each key is a shiftId mapping to a Shift object
}

export interface Shift {
    id: string;
    shiftName: string;
    latePunchInTime: number;
    createdAt: Timestamp;
    shiftDays: Record<string, ShiftDay>; // keys are day values (fri, mon, etc.)
}

export interface ShiftDay {
    id: string;
    enabled: boolean;
    isOccasional: boolean;
    occasionalDays: number[]; // Array of week numbers (1-4) for occasional shifts (e.g., [2] means 2nd week of the month)
    startTime: Timestamp;
    endTime: Timestamp;
    breakTimes: BreakTime[] | null;
    isFixedBreakTime: boolean;
    breakTimeMinutes: number | null;
}

export interface BreakTime {
    startTime: Timestamp; // Break start time
    endTime: Timestamp;   // Break end time
}

export interface ShiftFormData {
    shiftName: string;
    latePunchInTime: number;
    shiftDays: {
        [key: string]: {
            enabled: boolean;
            startTime: Date | null;
            endTime: Date | null;
            isOccasional: boolean;
            occasionalDays: number[];
            breakTimes: Array<{
                startTime: Date | null;
                endTime: Date | null;
            }>;
            isFixedBreakTime: boolean;
            breakTimeMinutes: number | null;
        };
    };
}