
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export type AttendanceStatus = 'present' | 'absent' | 'halfday' | 'leave' | 'weekoff';

interface DayAttendance {
    date: string; // YYYY-MM-DD format
    status: AttendanceStatus;
}

interface CalendarProps {
    selectedDate: Value;
    onDateChange: (value: Value) => void;
    attendanceData?: DayAttendance[];
}

// Generate dummy data for the current month
const generateDummyData = (): DayAttendance[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: DayAttendance[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Determine status based on day
        let status: AttendanceStatus;
        
        // Weekends (Saturday = 6, Sunday = 0) are typically weekoff
        if (date.getDay() === 0 || date.getDay() === 6) {
            status = 'weekoff';
        } else if (day % 7 === 0) {
            // Every 7th day is leave
            status = 'leave';
        } else if (day % 5 === 0) {
            // Every 5th day is halfday
            status = 'halfday';
        } else if (day % 9 === 0) {
            // Every 9th day is absent
            status = 'absent';
        } else {
            // Rest are present
            status = 'present';
        }

        data.push({ date: dateStr, status });
    }

    return data;
};

const AttendanceCalendar = ({ selectedDate, onDateChange, attendanceData }: CalendarProps) => {
    // Use dummy data if no attendance data provided
    const dummyData = useMemo(() => generateDummyData(), []);
    const data = attendanceData || dummyData;

    // Convert selected date to Date object for display
    const selectedDateObj = selectedDate
        ? Array.isArray(selectedDate)
            ? selectedDate[0] || new Date()
            : selectedDate
        : new Date();

    // Calculate counts for current month
    const counts = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const monthData = data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        });

        return {
            present: monthData.filter(d => d.status === 'present').length,
            absent: monthData.filter(d => d.status === 'absent').length,
            halfday: monthData.filter(d => d.status === 'halfday').length,
            leave: monthData.filter(d => d.status === 'leave').length,
            weekoff: monthData.filter(d => d.status === 'weekoff').length,
        };
    }, [data]);

    // Get attendance status for a specific date
    const getAttendanceStatus = (date: Date): AttendanceStatus | null => {
        const dateStr = date.toISOString().split('T')[0];
        const attendance = data.find(d => d.date === dateStr);
        return attendance?.status || null;
    };

    // Get tile class name based on attendance status
    const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return '';

        const dateStr = date.toISOString().split('T')[0];
        const selectedStr = selectedDateObj.toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];
        
        const status = getAttendanceStatus(date);
        
        let classes = '';

        // Add status-based class
        if (status) {
            classes += ` attendance-${status}`;
        }

        // Selected date styling (highest priority)
        if (dateStr === selectedStr) {
            classes += ' selected-date';
        }
        // Today styling (when not selected)
        else if (dateStr === todayStr) {
            classes += ' today-date';
        }

        return classes.trim();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
            {/* Summary Stats */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Present */}
                    <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 rounded-full bg-green-500 mb-2"></div>
                        <span className="text-xs font-medium text-gray-600">Present</span>
                        <span className="text-lg font-bold text-green-700">{counts.present}</span>
                    </div>

                    {/* Absent */}
                    <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="w-3 h-3 rounded-full bg-red-500 mb-2"></div>
                        <span className="text-xs font-medium text-gray-600">Absent</span>
                        <span className="text-lg font-bold text-red-700">{counts.absent}</span>
                    </div>

                    {/* Half Day */}
                    <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mb-2"></div>
                        <span className="text-xs font-medium text-gray-600">Half Day</span>
                        <span className="text-lg font-bold text-orange-700">{counts.halfday}</span>
                    </div>

                    {/* Leave */}
                    <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mb-2"></div>
                        <span className="text-xs font-medium text-gray-600">Leave</span>
                        <span className="text-lg font-bold text-purple-700">{counts.leave}</span>
                    </div>

                    {/* Week Off */}
                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mb-2"></div>
                        <span className="text-xs font-medium text-gray-600">Week Off</span>
                        <span className="text-lg font-bold text-blue-700">{counts.weekoff}</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="p-5 w-full">
                <Calendar
                    onChange={onDateChange}
                    value={selectedDate}
                    className="custom-calendar w-full"
                    tileClassName={getTileClassName}
                    prevLabel={<FiChevronLeft className="w-5 h-5" />}
                    nextLabel={<FiChevronRight className="w-5 h-5" />}
                    prev2Label={null}
                    next2Label={null}
                />
            </div>
        </motion.div>
    );
};

export default AttendanceCalendar;
