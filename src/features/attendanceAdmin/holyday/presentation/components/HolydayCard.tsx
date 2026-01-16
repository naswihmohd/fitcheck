import { motion } from 'framer-motion';
import { FiCalendar, FiEdit2 } from 'react-icons/fi';
import { FaUmbrellaBeach } from 'react-icons/fa';
import type { HolidayItem, HolidaysProps } from '../../data/holydayTypes';
import { useState } from 'react';
import AddHolydayModal from './AddHolydayModal';
import HolydayDeleteButton from './HolydayDeleteButton';

interface HolydayCardProps {
    holiday: HolidayItem;
    holidayData?: HolidaysProps;
}

const HolydayCard: React.FC<HolydayCardProps> = ({ holiday, holidayData }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Helper function to format date from Timestamp
    const formatDate = (timestamp: any): string => {
        if (!timestamp || !timestamp.toDate) return 'N/A';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper function to check if it's a single day or multi-day holiday
    const isMultiDay = (): boolean => {
        if (!holiday.startDate?.toDate || !holiday.endDate?.toDate) return false;
        const start = holiday.startDate.toDate();
        const end = holiday.endDate.toDate();
        return start.getTime() !== end.getTime();
    };

    // Helper function to calculate duration
    const getDuration = (): string => {
        if (!isMultiDay()) return '1 day';
        if (!holiday.startDate?.toDate || !holiday.endDate?.toDate) return 'N/A';
        const start = holiday.startDate.toDate();
        const end = holiday.endDate.toDate();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} days`;
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-primary/10 p-4 hover:shadow-md transition-shadow"
            >
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section - Main Info */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className='bg-primary/10 rounded-lg p-2'>
                            <FaUmbrellaBeach className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex items-center gap-6 flex-1">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">{holiday.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <FiCalendar className="w-4 h-4 text-primary" />
                                        <span>{formatDate(holiday.startDate)}</span>
                                    </div>
                                    {isMultiDay() && (
                                        <>
                                            <span className="text-gray-400">-</span>
                                            <span>{formatDate(holiday.endDate)}</span>
                                        </>
                                    )}
                                    <span className="text-gray-400">•</span>
                                    <span className="text-primary font-medium">{getDuration()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Action Buttons */}
                    <div className='flex gap-2'>
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                        </button>

                        <HolydayDeleteButton
                            holiday={holiday}
                            holidayData={holidayData || null}
                        />
                    </div>
                </div>
            </motion.div>

            {holidayData && (
                <AddHolydayModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    branchId={holidayData.branchId}
                    companyId={holidayData.companyId}
                    isEdit={true}
                    holidayData={holiday}
                />
            )}
        </>
    );
};

export default HolydayCard;
