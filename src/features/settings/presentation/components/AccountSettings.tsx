import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdEdit, MdBusiness, MdEmail, MdPhone, MdReceipt, MdPublic, MdAttachMoney, MdLocationOn } from 'react-icons/md';
import EditAccountInfoModal from './EditAccountInfoModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchApplicationData } from '../../redux/generalSlice';
import type { RootState, AppDispatch } from '../../../../general/redux/store';

interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    delay?: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-black/90 uppercase tracking-wide mb-1">
                        {label}
                    </p>
                    <p className="text-base font-semibold text-black/50 truncate">
                        {value || <span className="text-black/50 italic">Not set</span>}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const AccountSettings: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { applicationData, error } = useSelector((state: RootState) => state.general);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (applicationData) return;
        dispatch(fetchApplicationData());
    }, []);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        dispatch(fetchApplicationData()); // Refresh data after modal closes
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header Card */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-1">Company Information</h2>
                    <p className="text-black/50 text-sm">Manage your company details and preferences</p>
                </div>
                <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:shadow-md"
                >
                    <MdEdit className="w-5 h-5" />
                    Edit Details
                </button>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                    icon={<MdBusiness className="w-6 h-6" />}
                    label="Company Name"
                    value={applicationData?.companyInfo?.companyName || ''}
                    delay={0.1}
                />
                <InfoCard
                    icon={<MdEmail className="w-6 h-6" />}
                    label="Email Address"
                    value={applicationData?.companyInfo?.email || ''}
                    delay={0.15}
                />
                <InfoCard
                    icon={<MdPhone className="w-6 h-6" />}
                    label="Phone Number"
                    value={`+${applicationData?.companyInfo?.phoneNumber}` || ''}
                    delay={0.2}
                />
                <InfoCard
                    icon={<MdReceipt className="w-6 h-6" />}
                    label="Tax Number (VAT/GST)"
                    value={applicationData?.companyInfo?.taxNumber || ''}
                    delay={0.25}
                />
                <InfoCard
                    icon={<MdPublic className="w-6 h-6" />}
                    label="Country"
                    value={applicationData?.companyInfo?.country || ''}
                    delay={0.3}
                />
                <InfoCard
                    icon={<MdAttachMoney className="w-6 h-6" />}
                    label="Currency"
                    value={applicationData?.companyInfo?.currency || ''}
                    delay={0.35}
                />
            </div>

            {/* Address Card - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5"
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MdLocationOn className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-1">
                            Address
                        </p>
                        <p className="text-base font-semibold text-black/50 truncate">
                            {applicationData?.companyInfo?.address || <span className="text-black/50 italic">Not set</span>}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Edit Modal */}
            <EditAccountInfoModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                accountData={applicationData}
            />
        </motion.div>
    );
};

export default AccountSettings;
