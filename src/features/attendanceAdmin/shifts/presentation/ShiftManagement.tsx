import { motion } from 'framer-motion';
import { FiClock, FiPlus } from 'react-icons/fi';
import ShiftCard from './components/ShiftCard';
import type { ShiftsProps } from '../data/shiftTypes';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { useEffect, useState } from 'react';
import AddShiftModal from './components/AddShiftModal';
import { fetchBranchShift } from '../redux/shiftSlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

const ShiftManagement = () => {

    const { companyId, branchId } = useSelector((state: RootState) => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const { branchShifts, error, loading } = useSelector((state: RootState) => state.branchShifts);

    const shiftDoc = branchId ? branchShifts[branchId] as ShiftsProps : null;

    useEffect(() => {
        if (!branchId) return;
        if (branchShifts[branchId]) return;
        dispatch(fetchBranchShift({ branchId }));
    }, [dispatch, branchId]);

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
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Shift Management</h1>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-[0_12px_30px_-12px_rgba(0,81,175,0.65)] hover:brightness-105 transition focus:outline-none focus:ring-4 focus:ring-primary/30"
                    >
                        <FiPlus className="w-5 h-5" />
                        <span className="font-medium">Add New Shift</span>
                    </button>
                </motion.div>

                {/* Shifts List - One per row */}
                {!shiftDoc || Object.keys(shiftDoc.shifts).length === 0 ? !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-12 text-center"
                    >
                        <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shifts Found</h3>
                        <p className="text-sm text-gray-600">Create your first shift to get started</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {Object.values(shiftDoc.shifts)
                            .sort((a, b) => {
                                const aTime = a.createdAt?.toMillis?.() || 0;
                                const bTime = b.createdAt?.toMillis?.() || 0;
                                return bTime - aTime; // Descending order (newest first)
                            })
                            .map((shift, index) => (
                                <ShiftCard
                                    key={shift.id}
                                    shift={shift}
                                    shiftData={shiftDoc}
                                    index={index}
                                />
                            ))}
                    </div>
                )}

                {loading && <ThreeDotLoading />}
            </div>

            {branchId && companyId && (
                <AddShiftModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    branchId={branchId}
                    companyId={companyId}
                    isEdit={false}
                    shiftData={null}
                />
            )}
        </>
    );
};

export default ShiftManagement;
