import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../firebaseConfig';
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
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../../general/redux/store';
import { updateBranchUser } from '../../redux/branchUsersSlice';

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

const EditBranchAccessPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const [userData, setUserData] = useState<UserProps | null>(null);

    // Fetch branch data if not provided
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const userRef = doc(db, "users", userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const data = userDoc.data() as UserProps;
                    setUserData(data);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, [userId]);

    const handleToggleAccess = async (accessKey: AccessKey) => {
        if (!userData) return
        const newAccess = { ...userData.access, [accessKey]: !userData.access[accessKey] };
        try {
            const userRef = doc(db, "users", userData.id);
            await updateDoc(userRef, { access: newAccess });
            setUserData({ ...userData, access: newAccess });
            dispatch(updateBranchUser({
                branchId: userData.branchId,
                user: { ...userData, access: newAccess }
            }));
            toast.success("Access updated successfully");
        } catch (error) {
            console.error("Error updating user access:", error);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="mb-6">
                <p className="text-base text-black font-semibold flex items-center gap-2">
                    <span
                        onClick={() => navigate('/branches')}
                        className="cursor-pointer hover:text-black/80 transition-colors"
                    >
                        Edit Access
                    </span>
                </p>
            </div>

            <div className="space-y-6">
                {/* User Details Card */}
                <div className="bg-white rounded-lg p-6 max-w-2xl">

                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                disabled
                                value={userData?.name || ''}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-black"
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                value={userData?.email || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Access Management Card */}
                <div className="bg-white max-w-2xl rounded-lg p-6">

                    <div className="space-y-4">
                        {(Object.keys(accessIcons) as AccessKey[]).map((accessKey) => {
                            const accessItem = accessIcons[accessKey];
                            const isEnabled = userData?.access[accessKey] === true;

                            return (
                                <div
                                    key={accessKey}
                                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={accessItem.icon}
                                            alt={accessItem.label}
                                            className="w-6 h-6"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {accessItem.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-xs font-medium ${isEnabled ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                                            {isEnabled ? 'Enable' : 'Disable'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleAccess(accessKey)}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer disabled:opacity-50 ${isEnabled ? 'bg-[#0A8316]' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBranchAccessPage;

