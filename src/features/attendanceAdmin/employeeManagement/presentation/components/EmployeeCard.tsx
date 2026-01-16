import { motion } from 'framer-motion';
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { Timestamp } from 'firebase/firestore';
import ProfileAvatar from '../../../../../general/components/ProfileAvatar';
import type { EmployeeProps } from '../../data/employeeType';
import EmployeeActiveButton from './EmployeeActiveButton';

interface EmployeeCardProps {
    employee: EmployeeProps;
    index: number;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, index }) => {
    const navigate = useNavigate();

    // Format date from Timestamp or string
    const formatDate = (dateValue: Timestamp | string | null): string => {
        if (!dateValue) return 'N/A';
        try {
            let date: Date;
            // If it's a Firestore Timestamp, convert to Date
            if (dateValue instanceof Timestamp || (dateValue && typeof (dateValue as any).toDate === 'function')) {
                date = (dateValue as Timestamp).toDate();
            } else if (typeof dateValue === 'string') {
                date = new Date(dateValue);
            } else {
                return 'N/A';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    // Format employment type
    const formatEmploymentType = (type: string): string => {
        return type === 'fullTime' ? 'Full Time' : type === 'partTime' ? 'Part Time' : 'Intern';
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                    navigate(`/attendance/employee-management/${employee.id}`);
                }}
                transition={{
                    duration: 0.5,
                    delay: index * 0.1
                }}
                style={{
                    boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                }}
                className="bg-white rounded-lg p-6 flex items-start gap-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                    <ProfileAvatar
                        name={employee.basicDetails.fullName}
                        imageUrl={null}
                        size="xl"
                        bgColor="bg-primary"
                    />
                </div>

                {/* Employee Details */}
                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex text-sm">
                        <span className="w-32 font-normal text-gray-500">Name</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{employee.basicDetails.fullName}</span>
                    </div>

                    <div className="flex text-sm">
                        <span className="w-32 font-normal text-gray-500">Employee ID</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{employee.id}</span>
                    </div>

                    <div className="flex text-sm">
                        <span className="w-32 font-normal text-gray-500">Email</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{employee.basicDetails.email}</span>
                    </div>

                    <div className="flex text-sm">
                        <span className="w-32 font-normal text-gray-500">Phone</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{employee.basicDetails.phoneNumber}</span>
                    </div>

                    <div className="flex text-sm">
                        <span className="w-32 font-normal text-gray-500">Employment Type</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{formatEmploymentType(employee.branchDetails.employmentType)}</span>
                    </div>

                    <div className="flex text-sm">
                        <span className="w-32 font-normal text-gray-500">Joining Date</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{formatDate(employee.basicDetails.companyJoiningDate)}</span>
                    </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex-shrink-0 flex items-center gap-3">
                    {/* Active Toggle */}
                    <EmployeeActiveButton employee={employee} />

                    {/* Edit Icon */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/attendance/employee-management/add-new-employee/${employee.id}`);
                        }}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                        title="Edit Employee"
                    >
                        <FiEdit2 className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default EmployeeCard;
