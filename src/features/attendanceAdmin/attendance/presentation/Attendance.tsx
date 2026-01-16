import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../general/redux/store';
import { Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import toast from 'react-hot-toast';
import type { EmployeeProps } from '../../employeeManagement/data/employeeType';
import AttendanceCalendar from './components/Calendar';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeeImageUrl?: string | null;
    date: Date;
    punchIn: {
        time: Date;
        location?: {
            latitude: number;
            longitude: number;
        };
        imageUrl?: string | null;
    } | null;
    punchOut: {
        time: Date;
        location?: {
            latitude: number;
            longitude: number;
        };
        imageUrl?: string | null;
    } | null;
    status: 'present' | 'absent' | 'late' | 'halfDay';
    totalHours?: number;
    shiftId?: string;
    shiftName?: string;
}

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState<Value>(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { companyId, branchId } = useSelector((state: RootState) => state.user);
    const { branchEmployees } = useSelector((state: RootState) => state.branchEmployees);
    const currentBranchEmployees = branchId && branchEmployees[branchId]?.teams ? branchEmployees[branchId].teams : [];

    // Convert selected date to Date object for filtering
    const selectedDateObj = useMemo(() => {
        if (!selectedDate) return new Date();
        if (Array.isArray(selectedDate)) {
            return selectedDate[0] || new Date();
        }
        return selectedDate;
    }, [selectedDate]);

    // Format time from Date
    const formatTime = (date: Date | Timestamp | null): string => {
        if (!date) return 'N/A';
        try {
            let dateObj: Date;
            if (date instanceof Timestamp || (date && typeof (date as any).toDate === 'function')) {
                dateObj = (date as Timestamp).toDate();
            } else if (date instanceof Date) {
                dateObj = date;
            } else {
                return 'N/A';
            }
            return dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return 'N/A';
        }
    };

    // Calculate hours between two times
    const calculateHours = (punchIn: Date | null, punchOut: Date | null): string => {
        if (!punchIn || !punchOut) return 'N/A';
        const diffMs = punchOut.getTime() - punchIn.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const hours = Math.floor(diffHours);
        const minutes = Math.floor((diffHours - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    // Fetch attendance records for selected date
    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            if (!companyId || !branchId) return;

            setLoading(true);
            try {
                // Create start and end of day for query
                const startOfDay = new Date(selectedDateObj);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(selectedDateObj);
                endOfDay.setHours(23, 59, 59, 999);

                // TODO: Replace with actual attendance collection path
                // This is a placeholder structure - adjust based on your Firebase structure
                const attendanceRef = collection(db, 'companies', companyId, 'branches', branchId, 'attendance');
                const q = query(
                    attendanceRef,
                    where('date', '>=', Timestamp.fromDate(startOfDay)),
                    where('date', '<=', Timestamp.fromDate(endOfDay)),
                    orderBy('date', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const records: AttendanceRecord[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Transform Firestore data to AttendanceRecord
                    // Adjust this mapping based on your actual data structure
                    records.push({
                        id: doc.id,
                        employeeId: data.employeeId || '',
                        employeeName: data.employeeName || '',
                        employeeEmail: data.employeeEmail || '',
                        employeeImageUrl: data.employeeImageUrl || null,
                        date: data.date?.toDate() || selectedDateObj,
                        punchIn: data.punchIn ? {
                            time: data.punchIn.time?.toDate() || new Date(),
                            location: data.punchIn.location || undefined,
                            imageUrl: data.punchIn.imageUrl || null,
                        } : null,
                        punchOut: data.punchOut ? {
                            time: data.punchOut.time?.toDate() || new Date(),
                            location: data.punchOut.location || undefined,
                            imageUrl: data.punchOut.imageUrl || null,
                        } : null,
                        status: data.status || 'absent',
                        totalHours: data.totalHours || undefined,
                        shiftId: data.shiftId || undefined,
                        shiftName: data.shiftName || undefined,
                    });
                });

                // If no records found, create records for all employees (marked as absent)
                if (records.length === 0 && currentBranchEmployees.length > 0) {
                    const absentRecords: AttendanceRecord[] = currentBranchEmployees
                        .filter((emp: EmployeeProps) => emp.isActive)
                        .map((emp: EmployeeProps) => ({
                            id: `absent-${emp.id}`,
                            employeeId: emp.id,
                            employeeName: emp.basicDetails.fullName,
                            employeeEmail: emp.basicDetails.email,
                            employeeImageUrl: null,
                            date: selectedDateObj,
                            punchIn: null,
                            punchOut: null,
                            status: 'absent' as const,
                        }));
                    setAttendanceRecords(absentRecords);
                } else {
                    setAttendanceRecords(records);
                }
            } catch (error) {
                console.error('Error fetching attendance records:', error);
                toast.error('Failed to load attendance data');
                // Create records from current branch employees as fallback
                const fallbackRecords: AttendanceRecord[] = currentBranchEmployees
                    .filter((emp: EmployeeProps) => emp.isActive)
                    .map((emp: EmployeeProps) => ({
                        id: `fallback-${emp.id}`,
                        employeeId: emp.id,
                        employeeName: emp.basicDetails.fullName,
                        employeeEmail: emp.basicDetails.email,
                        employeeImageUrl: null,
                        date: selectedDateObj,
                        punchIn: null,
                        punchOut: null,
                        status: 'absent' as const,
                    }));
                setAttendanceRecords(fallbackRecords);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceRecords();
    }, []);

    // Filter records based on search query
    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return attendanceRecords;
        const query = searchQuery.toLowerCase().trim();
        return attendanceRecords.filter(
            (record) =>
                record.employeeName.toLowerCase().includes(query) ||
                record.employeeEmail.toLowerCase().includes(query) ||
                record.employeeId.toLowerCase().includes(query)
        );
    }, [attendanceRecords, searchQuery]);

    // Get status badge style
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'halfDay':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'absent':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <FiCheckCircle className="w-4 h-4" />;
            case 'late':
                return <FiAlertCircle className="w-4 h-4" />;
            case 'halfDay':
                return <FiClock className="w-4 h-4" />;
            case 'absent':
                return <FiXCircle className="w-4 h-4" />;
            default:
                return <FiClock className="w-4 h-4" />;
        }
    };

    // Format status text
    const formatStatus = (status: string): string => {
        switch (status) {
            case 'present':
                return 'Present';
            case 'late':
                return 'Late';
            case 'halfDay':
                return 'Half Day';
            case 'absent':
                return 'Absent';
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
                <p className="text-sm text-gray-600 mt-1">
                    View and manage employee attendance records
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-2">
                    <AttendanceCalendar
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />
                </div>

                {/* Attendance Records Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                >
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or employee ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-sm bg-white outline-none border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <ThreeDotLoading />
                            </div>
                        ) : (
                            <>
                                {/* Attendance Records List */}
                                {filteredRecords.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredRecords.map((record, index) => (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                style={{
                                                    boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                                                }}
                                                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Employee Avatar */}
                                                    <div className="flex-shrink-0">
                                                        <ProfileAvatar
                                                            name={record.employeeName}
                                                            imageUrl={record.employeeImageUrl}
                                                            size="lg"
                                                            bgColor="bg-primary"
                                                        />
                                                    </div>

                                                    {/* Employee Info and Attendance Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h3 className="text-base font-semibold text-gray-900">
                                                                    {record.employeeName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {record.employeeEmail}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    ID: {record.employeeId}
                                                                </p>
                                                            </div>
                                                            {/* Status Badge */}
                                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(record.status)}`}>
                                                                {getStatusIcon(record.status)}
                                                                {formatStatus(record.status)}
                                                            </div>
                                                        </div>

                                                        {/* Attendance Times */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                            {/* Punch In */}
                                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                                <FiClock className="w-4 h-4 text-primary flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-gray-500">Punch In</p>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {record.punchIn ? formatTime(record.punchIn.time) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Punch Out */}
                                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                                <FiClock className="w-4 h-4 text-secondary flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-gray-500">Punch Out</p>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {record.punchOut ? formatTime(record.punchOut.time) : 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Total Hours */}
                                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                                <FiClock className="w-4 h-4 text-tertiary flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-gray-500">Total Hours</p>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {record.punchIn && record.punchOut
                                                                            ? calculateHours(record.punchIn.time, record.punchOut.time)
                                                                            : 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Shift Info */}
                                                        {record.shiftName && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <p className="text-xs text-gray-500">
                                                                    Shift: <span className="font-medium text-gray-900">{record.shiftName}</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                            <FiClock className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 font-medium mb-1">No attendance records found</p>
                                        <p className="text-sm text-gray-500">
                                            {searchQuery
                                                ? 'Try adjusting your search query'
                                                : 'No attendance data available for the selected date'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Attendance;
