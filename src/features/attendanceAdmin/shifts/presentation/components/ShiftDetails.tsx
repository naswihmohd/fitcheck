import { motion } from 'framer-motion';
import { FiClock, FiAlertCircle, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router';
import type { Shift, ShiftDay } from '../../data/shiftTypes';

const ShiftDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const shift = location.state?.shift as Shift | undefined;

    // Navigate back if no shift data
    if (!shift) {
        navigate('/attendance/shifts', { replace: true });
        return null;
    }

    // Helper function to format time from Timestamp
    const formatTime = (timestamp: any): string => {
        if (!timestamp || !timestamp.toDate) return 'N/A';
        const date = timestamp.toDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // Helper to convert time to minutes from midnight
    const timeToMinutes = (timestamp: any): number => {
        if (!timestamp || !timestamp.toDate) return 0;
        const date = timestamp.toDate();
        return date.getHours() * 60 + date.getMinutes();
    };

    // Get active days sorted
    const dayOrder: Record<string, number> = {
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6,
        'sun': 7,
    };

    const activeDays = Object.keys(shift.shiftDays).sort((a, b) => 
        (dayOrder[a] || 99) - (dayOrder[b] || 99)
    );

    const dayNames: Record<string, string> = {
        'mon': 'Monday',
        'tue': 'Tuesday',
        'wed': 'Wednesday',
        'thu': 'Thursday',
        'fri': 'Friday',
        'sat': 'Saturday',
        'sun': 'Sunday',
    };

    // Check if shift has occasional days
    const hasOccasionalDays = Object.values(shift.shiftDays).some(day => day.isOccasional);
    
    // Check if any day is overnight
    const hasOvernight = Object.values(shift.shiftDays).some(day => {
        const startMinutes = timeToMinutes(day.startTime);
        const endMinutes = timeToMinutes(day.endTime);
        return endMinutes < startMinutes;
    });

    // Helper function to format week number as ordinal (1st, 2nd, 3rd, 4th)
    const formatWeekOrdinal = (weekNum: number): string => {
        if (weekNum === 1) return '1st';
        if (weekNum === 2) return '2nd';
        if (weekNum === 3) return '3rd';
        if (weekNum === 4) return '4th';
        return `${weekNum}th`;
    };

    // Calculate timeline segments for a day
    const calculateTimelineSegments = (dayData: ShiftDay) => {
        const startMinutes = timeToMinutes(dayData.startTime);
        let endMinutes = timeToMinutes(dayData.endTime);
        const isOvernight = endMinutes < startMinutes;
        
        // Normalize end time for overnight shifts
        if (isOvernight) {
            endMinutes += 24 * 60;
        }

        const segments: Array<{ type: 'work' | 'break'; start: number; end: number; duration: number }> = [];

        if (dayData.breakTimes && dayData.breakTimes.length > 0) {
            // Sort breaks by start time
            const sortedBreaks = [...dayData.breakTimes].sort((a, b) => 
                timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
            );

            let currentPos = startMinutes;
            sortedBreaks.forEach((breakTime) => {
                let breakStart = timeToMinutes(breakTime.startTime);
                let breakEnd = timeToMinutes(breakTime.endTime);
                
                // Normalize break times for overnight shifts
                if (breakStart < startMinutes) breakStart += 24 * 60;
                if (breakEnd < breakStart) breakEnd += 24 * 60;
                
                // Work segment before break
                if (breakStart > currentPos) {
                    segments.push({
                        type: 'work',
                        start: currentPos,
                        end: breakStart,
                        duration: breakStart - currentPos
                    });
                }
                
                // Break segment
                segments.push({
                    type: 'break',
                    start: breakStart,
                    end: breakEnd,
                    duration: breakEnd - breakStart
                });
                
                currentPos = breakEnd;
            });
            
            // Work segment after last break
            if (currentPos < endMinutes) {
                segments.push({
                    type: 'work',
                    start: currentPos,
                    end: endMinutes,
                    duration: endMinutes - currentPos
                });
            }
        } else {
            // No breaks, single work segment
            segments.push({
                type: 'work',
                start: startMinutes,
                end: endMinutes,
                duration: endMinutes - startMinutes
            });
        }

        return { segments, startMinutes, endMinutes: isOvernight ? timeToMinutes(dayData.endTime) : endMinutes, isOvernight };
    };

    // Calculate position percentage on timeline for a specific day
    const getPositionForDay = (minutes: number, dayStart: number, dayEnd: number, isOvernight: boolean): number => {
        let normalizedMinutes = minutes;
        let normalizedStart = dayStart;
        let normalizedEnd = dayEnd;

        if (isOvernight) {
            // Handle overnight shift
            if (normalizedMinutes < normalizedStart) {
                normalizedMinutes += 24 * 60;
            }
            if (normalizedEnd < normalizedStart) {
                normalizedEnd += 24 * 60;
            }
        }

        const range = normalizedEnd - normalizedStart;
        return ((normalizedMinutes - normalizedStart) / range) * 100;
    };

    const handleGoBack = () => {
        navigate('/attendance/shifts');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-6"
        >
            {/* Back Button */}
            <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors p-2 -ml-2"
                aria-label="Go back"
            >
                <FiArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Shifts</span>
            </button>

            {/* Header Card - Basic Shift Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                }}
                className="bg-white rounded-lg border border-primary/10 p-6"
            >
                <div className="flex flex-col gap-4">
                    {/* Shift Name */}
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{shift.shiftName}</h1>
                        <p className="text-sm text-gray-600">Shift Details & Timeline</p>
                    </div>

                    {/* Key Information */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                            <FiClock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                                <span className="font-medium">Late Punch-in:</span>{' '}
                                <span className="font-semibold text-gray-900">{shift.latePunchInTime} min</span>
                            </span>
                        </div>
                        
                        {hasOccasionalDays && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <FiAlertCircle className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-700">Occasional Days</span>
                            </div>
                        )}
                        
                        {hasOvernight && (
                            <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-sm font-medium text-blue-700">Overnight Shift</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Timeline Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                    boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                }}
                className="bg-white rounded-lg border border-primary/10 p-6"
            >
                <div className="space-y-6">
                    {/* Timeline for each day */}
                    {activeDays.map((dayKey, dayIndex) => {
                        const dayData = shift.shiftDays[dayKey];
                        const { segments, startMinutes, endMinutes, isOvernight } = calculateTimelineSegments(dayData);
                        const isOccasional = dayData.isOccasional;

                        return (
                            <div key={dayKey} className={dayIndex !== activeDays.length - 1 ? "pb-6 border-b border-gray-200" : ""}>
                                <div className="space-y-4">
                                    {/* Day Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FiCalendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-base font-semibold text-gray-900">
                                                {dayNames[dayKey]}
                                            </span>
                                            {isOccasional && (
                                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md border border-purple-200">
                                                    Occasional
                                                </span>
                                            )}
                                            {isOvernight && (
                                                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
                                                    Overnight
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="font-semibold text-gray-900">{formatTime(dayData.startTime)}</span>
                                            <span className="text-gray-400">→</span>
                                            <span className="font-semibold text-gray-900">{formatTime(dayData.endTime)}</span>
                                        </div>
                                    </div>

                                    {/* Timeline Bar */}
                                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        {/* Timeline segments */}
                                        <div className="absolute inset-0">
                                            {segments.map((segment, idx) => {
                                                const left = getPositionForDay(segment.start, startMinutes, endMinutes, isOvernight);
                                                const right = getPositionForDay(segment.end, startMinutes, endMinutes, isOvernight);
                                                const width = Math.max(right - left, 0.5);

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`h-full absolute ${
                                                            segment.type === 'work'
                                                                ? 'bg-gradient-to-r from-primary to-primary/80'
                                                                : 'bg-gradient-to-r from-amber-400 to-amber-500'
                                                        }`}
                                                        style={{
                                                            left: `${left}%`,
                                                            width: `${width}%`,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* Time markers */}
                                        <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="w-0.5 h-4 bg-gray-700 rounded" />
                                                <span className="text-[10px] font-semibold text-gray-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                                                    {formatTime(dayData.startTime)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="w-0.5 h-4 bg-gray-700 rounded" />
                                                <span className="text-[10px] font-semibold text-gray-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                                                    {formatTime(dayData.endTime)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Break labels */}
                                        {dayData.breakTimes && dayData.breakTimes.map((breakTime, idx) => {
                                            let breakStart = timeToMinutes(breakTime.startTime);
                                            let breakEnd = timeToMinutes(breakTime.endTime);
                                            
                                            // Normalize for overnight
                                            if (isOvernight) {
                                                if (breakStart < startMinutes) breakStart += 24 * 60;
                                                if (breakEnd < breakStart) breakEnd += 24 * 60;
                                            }
                                            
                                            const left = getPositionForDay(breakStart, startMinutes, endMinutes, isOvernight);
                                            const right = getPositionForDay(breakEnd, startMinutes, endMinutes, isOvernight);
                                            const breakDuration = breakEnd - breakStart;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none"
                                                    style={{
                                                        left: `${left}%`,
                                                        right: `${100 - right}%`,
                                                    }}
                                                >
                                                    <span className="text-[10px] font-semibold text-white px-2 py-1 bg-amber-600/95 rounded shadow-md">
                                                        Break ({breakDuration}m)
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Additional Information */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        {/* Break time information */}
                                        {dayData.isFixedBreakTime ? (
                                            <span>
                                                <span className="font-medium text-gray-700">Break Time: </span>
                                                {dayData.breakTimeMinutes ? (
                                                    <span>{dayData.breakTimeMinutes} min</span>
                                                ) : (
                                                    <span className="text-gray-500">Not specified</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span>
                                                <span className="font-medium text-gray-700">Break Time: </span>
                                                <span className="text-gray-500">No fixed break time</span>
                                                {dayData.breakTimeMinutes && (
                                                    <span className="ml-1">({dayData.breakTimeMinutes} min)</span>
                                                )}
                                            </span>
                                        )}

                                        {/* Occasional weeks */}
                                        {isOccasional && dayData.occasionalDays.length > 0 && (
                                            <span className="text-purple-700">
                                                <span className="font-medium">Active Weeks: </span>
                                                {dayData.occasionalDays.slice(0, 5).map((weekNum, idx) => (
                                                    <span key={idx}>
                                                        {formatWeekOrdinal(weekNum)}
                                                        {idx < Math.min(4, dayData.occasionalDays.length - 1) && ', '}
                                                    </span>
                                                ))}
                                                {dayData.occasionalDays.length > 5 && (
                                                    <span> +{dayData.occasionalDays.length - 5} more</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-primary to-primary/80 rounded" />
                        <span className="text-gray-700 font-medium">Work Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded" />
                        <span className="text-gray-700 font-medium">Break Time</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ShiftDetails;
