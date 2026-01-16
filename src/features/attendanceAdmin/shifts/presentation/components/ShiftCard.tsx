import { motion } from 'framer-motion';
import { FiClock, FiEye, FiArrowRight, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import type { Shift, ShiftsProps } from '../../data/shiftTypes';
import ShiftEditButton from './ShiftEditButton';
import { WiDayCloudy } from "react-icons/wi";
import { calculateBreakMinutes } from '../../utils/calculateBreakMinutes';

interface ShiftCardProps {
    shift: Shift;
    shiftData?: ShiftsProps;
    index?: number;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, index = 0, shiftData }) => {
    const navigate = useNavigate();
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

    const dayAbbreviations: Record<string, string> = {
        'mon': 'Monday',
        'tue': 'Tuesday',
        'wed': 'Wednesday',
        'thu': 'Thursday',
        'fri': 'Friday',
        'sat': 'Saturday',
        'sun': 'Sunday',
    };

    // Get time for a specific day
    const getDayTime = (dayKey: string): { start: string; end: string } => {
        const day = shift.shiftDays[dayKey];
        if (!day) return { start: 'N/A', end: 'N/A' };
        return {
            start: formatTime(day.startTime),
            end: formatTime(day.endTime),
        };
    };

    const handleViewDetails = () => {
        navigate('/attendance/shifts/details', { state: { shift } });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.2,
                delay: index * 0.01,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
            }}
            className="bg-white rounded-lg border border-primary/10 p-6 hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start justify-between gap-4">
                {/* Left Section - Main Info */}
                <div className="flex-1 space-y-3">
                    {/* Shift Name */}
                    <div>
                        <div className='flex justify-between'>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{shift.shiftName}</h3>
                                {/* Badges and Info */}
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 py-1.5 rounded-md text-xs text-gray-700">
                                        <FiClock className="w-3.5 h-3.5" />
                                        <span>Late In Punch Time: <span className="font-semibold">{shift.latePunchInTime} min</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-3 h-fit'>
                                {/* Right Section - View Details Button */}
                                <div className="flex items-start">
                                    <button
                                        onClick={handleViewDetails}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium text-sm"
                                    >
                                        <FiEye className="w-4 h-4" />
                                    </button>
                                </div>

                                {shiftData && (
                                    <ShiftEditButton shift={shift} branchId={shiftData.branchId} companyId={shiftData.companyId} />
                                )}
                            </div>
                        </div>

                        {/* Day Boxes */}
                        {activeDays.length > 0 ? (
                            <div className="grid grid-cols-7 gap-2">
                                {activeDays.map((dayKey) => {
                                    const day = shift.shiftDays[dayKey];
                                    const dayTime = getDayTime(dayKey);
                                    const isOccasional = day?.isOccasional || false;
                                    const breakMinutes = calculateBreakMinutes(day);

                                    return (
                                        <div
                                            key={dayKey}
                                            className={`py-2 px-1 rounded-lg border ${isOccasional
                                                ? 'bg-amber-50 border-amber-200'
                                                : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="text-xs flex items-center gap-1 justify-center font-semibold text-primary">
                                                <WiDayCloudy className="w-5 h-5" />{dayAbbreviations[dayKey] || dayKey}
                                            </div>

                                            <hr className='text-primary/20 mb-2' />
                                            <div className="flex items-center pt-3 pb-2 gap-1.5 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium">{dayTime.start}</span>
                                                    <span className="text-gray-400"><FiArrowRight className="w-3 h-3" /></span>
                                                    <span className="font-medium">{dayTime.end}</span>
                                                </div>
                                            </div>
                                            <hr className='text-gray-200 mb-1' />
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <FiClock className={`w-3 h-3 ${day.isFixedBreakTime ? 'text-blue-600' : 'text-orange-600'}`} />
                                                    <span className={`font-medium ${day.isFixedBreakTime ? 'text-blue-700' : 'text-orange-700'}`}>
                                                        Break: {breakMinutes.readable}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Break Type Hint */}
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                                                <FiInfo className="w-2.5 h-2.5" />
                                                <span className="italic">
                                                    {day.isFixedBreakTime
                                                        ? 'Fixed break times'
                                                        : 'Flexible break duration'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">No days configured</div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ShiftCard;
