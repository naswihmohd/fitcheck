import type { ShiftFormData } from "../data/shiftTypes";


export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    success: boolean;
    errors: ValidationError[];
}

// Helper function to compare times (handles next-day scenarios)
const compareTimes = (time1: Date, time2: Date): number => {
    const hours1 = time1.getHours() * 60 + time1.getMinutes();
    const hours2 = time2.getHours() * 60 + time2.getMinutes();
    return hours1 - hours2;
};

// Helper function to check if time is within range (handles next-day scenarios)
const isTimeInRange = (time: Date, start: Date, end: Date): boolean => {
    const timeMinutes = time.getHours() * 60 + time.getMinutes();
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    // Handle next-day scenarios (e.g., night shift ending next day)
    if (endMinutes < startMinutes) {
        // Shift spans midnight
        return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

export const validateShiftForm = (data: ShiftFormData): ValidationResult => {
    const errors: ValidationError[] = [];

    // Validate that at least one day is enabled
    const hasEnabledDay = Object.values(data.shiftDays).some((day) => day.enabled);
    if (!hasEnabledDay) {
        errors.push({
            field: 'shiftDays',
            message: 'At least one day must be enabled',
        });
        return { success: false, errors };
    }

    // Validate enabled days have required fields
    for (const [dayKey, dayData] of Object.entries(data.shiftDays)) {
        if (dayData.enabled) {
            // Validate start time
            if (!dayData.startTime) {
                errors.push({
                    field: `shiftDays.${dayKey}.startTime`,
                    message: 'Start time is required',
                });
                continue;
            }

            // Validate end time
            if (!dayData.endTime) {
                errors.push({
                    field: `shiftDays.${dayKey}.endTime`,
                    message: 'End time is required',
                });
                continue;
            }

            // Validate end time is after start time (or next day for night shifts)
            const startTime = dayData.startTime;
            const endTime = dayData.endTime;
            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
            
            // Allow next-day scenarios (end time can be less than start time for night shifts)
            // But ensure they're not exactly the same
            if (startMinutes === endMinutes) {
                errors.push({
                    field: `shiftDays.${dayKey}.endTime`,
                    message: 'End time must be different from start time',
                });
            }

            // Validate break settings
            if (dayData.isFixedBreakTime) {
                // Scheduled breaks: only validate if break times exist
                if (dayData.breakTimes && dayData.breakTimes.length > 0) {
                    // Validate each break has both start and end times
                    dayData.breakTimes.forEach((breakTime, breakIndex) => {
                        if (!breakTime.startTime) {
                            errors.push({
                                field: `shiftDays.${dayKey}.breakTimes.${breakIndex}.startTime`,
                                message: 'Break start time is required',
                            });
                        }
                        if (!breakTime.endTime) {
                            errors.push({
                                field: `shiftDays.${dayKey}.breakTimes.${breakIndex}.endTime`,
                                message: 'Break end time is required',
                            });
                        }
                        
                        // Validate break times are valid
                        if (breakTime.startTime && breakTime.endTime) {
                            const breakStartMinutes = breakTime.startTime.getHours() * 60 + breakTime.startTime.getMinutes();
                            const breakEndMinutes = breakTime.endTime.getHours() * 60 + breakTime.endTime.getMinutes();
                            
                            // Break end must be after break start
                            if (breakStartMinutes >= breakEndMinutes) {
                                errors.push({
                                    field: `shiftDays.${dayKey}.breakTimes.${breakIndex}.endTime`,
                                    message: 'Break end time must be after start time',
                                });
                            }
                            
                            // Break times must be within shift time range
                            if (!isTimeInRange(breakTime.startTime, startTime, endTime)) {
                                errors.push({
                                    field: `shiftDays.${dayKey}.breakTimes.${breakIndex}.startTime`,
                                    message: 'Break start time must be within shift time range',
                                });
                            }
                            if (!isTimeInRange(breakTime.endTime, startTime, endTime)) {
                                errors.push({
                                    field: `shiftDays.${dayKey}.breakTimes.${breakIndex}.endTime`,
                                    message: 'Break end time must be within shift time range',
                                });
                            }
                        }
                    });
                    
                    // Check for overlapping breaks
                    if (dayData.breakTimes.length > 1) {
                        const sortedBreaks = [...dayData.breakTimes]
                            .filter(bt => bt.startTime && bt.endTime)
                            .sort((a, b) => compareTimes(a.startTime!, b.startTime!));
                        
                        for (let i = 0; i < sortedBreaks.length - 1; i++) {
                            const currentEnd = sortedBreaks[i].endTime!;
                            const nextStart = sortedBreaks[i + 1].startTime!;
                            
                            if (compareTimes(currentEnd, nextStart) > 0) {
                                errors.push({
                                    field: `shiftDays.${dayKey}.breakTimes`,
                                    message: 'Break times cannot overlap',
                                });
                                break;
                            }
                        }
                    }
                }
            } else {
                // Unscheduled breaks: must have breakTimeMinutes (0 is allowed)
                if (dayData.breakTimeMinutes === null || dayData.breakTimeMinutes === undefined) {
                    errors.push({
                        field: `shiftDays.${dayKey}.breakTimeMinutes`,
                        message: 'Break time in minutes is required for unscheduled breaks',
                    });
                } else if (dayData.breakTimeMinutes < 0) {
                    errors.push({
                        field: `shiftDays.${dayKey}.breakTimeMinutes`,
                        message: 'Break time cannot be negative',
                    });
                }
            }

            // Validate occasional days if occasional is enabled
            if (dayData.isOccasional) {
                if (!dayData.occasionalDays || dayData.occasionalDays.length === 0) {
                    errors.push({
                        field: `shiftDays.${dayKey}.occasionalDays`,
                        message: 'Please select at least one week for occasional days',
                    });
                } else {
                    // Validate week numbers are valid (1-4)
                    const invalidWeeks = dayData.occasionalDays.filter(week => week < 1 || week > 4);
                    if (invalidWeeks.length > 0) {
                        errors.push({
                            field: `shiftDays.${dayKey}.occasionalDays`,
                            message: 'Week numbers must be between 1 and 4',
                        });
                    }
                    
                    // Validate no duplicate weeks
                    const uniqueWeeks = new Set(dayData.occasionalDays);
                    if (uniqueWeeks.size !== dayData.occasionalDays.length) {
                        errors.push({
                            field: `shiftDays.${dayKey}.occasionalDays`,
                            message: 'Week numbers must be unique',
                        });
                    }
                }
            }
        }
    }

    return {
        success: errors.length === 0,
        errors,
    };
};
