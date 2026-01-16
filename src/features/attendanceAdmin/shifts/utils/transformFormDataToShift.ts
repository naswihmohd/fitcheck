import { serverTimestamp, Timestamp } from "firebase/firestore";
import type { BreakTime, Shift, ShiftDay, ShiftFormData } from "../data/shiftTypes";

/**
 * Transforms ShiftFormData (with Date objects) to Shift format (with Timestamps)
 */
export const transformFormDataToShift = (
    formData: ShiftFormData,
    shiftId: string
): Shift => {
    const shiftDays: Record<string, ShiftDay> = {};

    // Process each day in the form data
    for (const [dayKey, dayData] of Object.entries(formData.shiftDays)) {
        if (!dayData.enabled) continue;

        // Convert Date to Timestamp for startTime and endTime
        const startTime = dayData.startTime
            ? Timestamp.fromDate(dayData.startTime)
            : Timestamp.now();
        const endTime = dayData.endTime
            ? Timestamp.fromDate(dayData.endTime)
            : Timestamp.now();

        // Process break times
        let breakTimes: BreakTime[] | null = null;
        if (dayData.isFixedBreakTime && dayData.breakTimes && dayData.breakTimes.length > 0) {
            breakTimes = dayData.breakTimes
                .filter(bt => bt.startTime && bt.endTime)
                .map(bt => ({
                    startTime: Timestamp.fromDate(bt.startTime!),
                    endTime: Timestamp.fromDate(bt.endTime!),
                }));
        }

        shiftDays[dayKey] = {
            id: dayKey,
            enabled: dayData.enabled,
            isOccasional: dayData.isOccasional,
            occasionalDays: dayData.occasionalDays || [],
            startTime,
            endTime,
            breakTimes,
            isFixedBreakTime: dayData.isFixedBreakTime,
            breakTimeMinutes: dayData.isFixedBreakTime ? null : (dayData.breakTimeMinutes ?? 0),
        };
    }

    return {
        id: shiftId,
        shiftName: formData.shiftName,
        latePunchInTime: formData.latePunchInTime,
        createdAt: serverTimestamp() as Timestamp,
        shiftDays,
    };
};