import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
import { TbPlaylistAdd } from "react-icons/tb";
import HolydayCard from './components/HolydayCard';
import type { HolidaysProps } from '../data/holydayTypes';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { useEffect, useState } from 'react';
import AddHolydayModal from './components/AddHolydayModal';
import { fetchBranchHoliday } from '../redux/holydaySlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

const HolydayManagement = () => {
    const { companyId, branchId } = useSelector((state: RootState) => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const { branchHolidays, error, loading } = useSelector((state: RootState) => state.branchHolidays);

    const holidayDoc = branchId ? branchHolidays[branchId] as HolidaysProps : null;

    useEffect(() => {
        if (!branchId) return;
        if (branchHolidays[branchId]) return;
        dispatch(fetchBranchHoliday({ branchId }));
    }, [dispatch, branchId, branchHolidays]);

    useEffect(() => {
        if (error) {
            console.log(error);
        }
    }, [error]);

    return (
        <>
            <div className="space-y-6 pb-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <h1 className="text-base font-semibold text-gray-900">Holiday Management</h1>
                </motion.div>

                <div className="flex items-center justify-end">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-tertiary text-white rounded-lg hover:bg-tertiary/90 transition duration-300"
                    >
                        <TbPlaylistAdd  className="w-5 h-5" />
                        <span className="font-medium text-sm">Add New Holiday</span>
                    </button>
                </div>

                {/* Holidays List - One per row */}
                {!holidayDoc || Object.keys(holidayDoc.holidays).length === 0 ? !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-12 text-center"
                    >
                        <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Holidays Found</h3>
                        <p className="text-sm text-gray-600">Create your first holiday to get started</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {Object.values(holidayDoc.holidays)
                            .sort((a, b) => {
                                const aTime = a.startDate?.toMillis?.() || 0;
                                const bTime = b.startDate?.toMillis?.() || 0;
                                return aTime - bTime; // Ascending order (earliest first)
                            })
                            .map((holiday) => (
                                <HolydayCard
                                    key={holiday.id}
                                    holiday={holiday}
                                    holidayData={holidayDoc}
                                />
                            ))}
                    </div>
                )}

                {loading && <ThreeDotLoading />}
            </div>

            {branchId && companyId && (
                <AddHolydayModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    branchId={branchId}
                    companyId={companyId}
                    isEdit={false}
                    holidayData={null}
                />
            )}
        </>
    );
};

export default HolydayManagement;
