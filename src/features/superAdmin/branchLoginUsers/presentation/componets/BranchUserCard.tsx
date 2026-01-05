import { motion } from 'framer-motion';
import { FiTrash2, FiEdit } from 'react-icons/fi';
import branchIcon from '../../../../../assets/icons/branch-icon.svg';
import type { UserProps, AccessKey } from '../../../../login/data/userTypes';

// Import icons from sidebar
import dashboardIcon from '../../../../../assets/images/branch-admin-sidebar-icons/dashboard-icon.svg';
import agreementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/agreement-icon.svg';
import appointmentIcon from '../../../../../assets/images/branch-admin-sidebar-icons/appointment-icon.svg';
import batchManagementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/batch-management-icon.svg';
import feeManagementCoinIcon from '../../../../../assets/images/branch-admin-sidebar-icons/fee-management-coin.svg';
import noticeSettingsIcon from '../../../../../assets/images/branch-admin-sidebar-icons/notice-settings-icon.svg';
import placementManagementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/placement-management-icon.svg';
import studentManagementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/student-management-icon.svg';
import testPortalIcon from '../../../../../assets/images/branch-admin-sidebar-icons/test-portal-icon.svg';
import tutorMangementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/tutor-mangement-icon.svg';

// Access icon mapping - matching AccessKey from userTypes.ts
const accessIcons: Record<AccessKey, { icon: string; label: string }> = {
    dashboard: { icon: dashboardIcon, label: 'Dashboard' },
    salesExecutiveManagement: { icon: agreementIcon, label: 'Sales Exe. Management' },
    feeManagement: { icon: feeManagementCoinIcon, label: 'Fee Management' },
    batchManagement: { icon: batchManagementIcon, label: 'Batch Management' },
    tutorManagement: { icon: tutorMangementIcon, label: 'Tutor Management' },
    studentManagement: { icon: studentManagementIcon, label: 'Student Management' },
    placementManagement: { icon: placementManagementIcon, label: 'Placement Management' },
    noticeSettings: { icon: noticeSettingsIcon, label: 'Notice Settings' },
    testPortal: { icon: testPortalIcon, label: 'Test Portal' },
    appointments: { icon: appointmentIcon, label: 'Appointments' },
};

interface BranchUserCardProps {
    user: UserProps;
    index: number;
}

const BranchUserCard = ({ user, index }: BranchUserCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1
            }}
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
            }}
            className="bg-white rounded-lg p-6 flex items-start gap-6"
        >
            {/* Left Icon - Building Icon */}
            <div className="flex-shrink-0 px-5 my-auto">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <img src={branchIcon} alt="branch-icon" className="w-12 h-12" />
                </div>
            </div>

            {/* Middle Section - User Details */}
            <div className="flex-1 space-y-2 min-w-0">
                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Name</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{user.name}</span>
                </div>

                <div className="flex text-sm">
                    <span className="w-32 font-normal text-gray-500">Email</span>
                    <span className="mr-2">:</span>
                    <span className="font-normal text-black">{user.email}</span>
                </div>

                <div className="flex text-sm items-start">
                    <span className="w-32 font-normal text-gray-500 flex-shrink-0">Access</span>
                    <span className="mr-2">:</span>
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        {(Object.keys(accessIcons) as AccessKey[]).map((accessKey) => {
                            const accessItem = accessIcons[accessKey];
                            const isEnabled = user.access[accessKey] === true;
                            
                            return (
                                <div
                                    key={accessKey}
                                    className={`w-6 h-6 flex items-center justify-center transition-opacity ${
                                        isEnabled ? 'opacity-100' : 'opacity-30'
                                    }`}
                                    title={`${accessItem.label} - ${isEnabled ? 'Enabled' : 'Disabled'}`}
                                >
                                    <img 
                                        src={accessItem.icon} 
                                        alt={accessItem.label}
                                        className="w-5 h-5"
                                    />
                                </div>
                            );
                        })}
                        <button
                            className="text-primary text-xs font-medium hover:underline ml-2"
                        >
                            Edit Access
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex-shrink-0 flex items-center my-auto gap-3">

                {/* Delete Icon */}
                <button
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                >
                    <FiTrash2 className="w-5 h-5" />
                </button>

                {/* Edit Icon */}
                <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                >
                    <FiEdit className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default BranchUserCard;

