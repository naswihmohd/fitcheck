import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';
import { FiFilter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import { fetchBranchShift } from '../../../shifts/redux/shiftSlice';
import type { Shift } from '../../../shifts/data/shiftTypes';
import ThreeDotLoading from '../../../../../general/components/ThreeDotLoading';

interface ShiftFilterDropdownProps {
    setSelectedShiftId: (shiftId: string | null) => void;
    selectedShiftId?: string | null;
}

const ShiftFilterDropdown: React.FC<ShiftFilterDropdownProps> = ({
    setSelectedShiftId,
    selectedShiftId = null,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { branchShifts, loading } = useSelector((state: RootState) => state.branchShifts);
    const { branchId } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    // Convert shifts Record to array for easier mapping
    const currentBranchShifts = branchId && branchShifts[branchId]?.shifts 
        ? Object.values(branchShifts[branchId].shifts) 
        : [];

    // Fetch shifts when dropdown opens
    useEffect(() => {
        if (isOpen && branchId) {
            const branchData = branchShifts[branchId];
            // Only fetch if we don't have shifts
            if (!branchData?.shifts || Object.keys(branchData.shifts).length === 0) {
                dispatch(fetchBranchShift({ branchId }));
            }
        }
    }, [isOpen, branchId, dispatch, branchShifts]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleShiftSelect = (shift: Shift | null) => {
        setSelectedShiftId(shift ? shift.id : null);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const selectedShift = selectedShiftId
        ? currentBranchShifts.find(shift => shift.id === selectedShiftId)
        : null;

    const displayText = selectedShift ? selectedShift.shiftName : 'All Shifts';

    return (
        <div ref={containerRef} className="relative">
            {/* Header Button */}
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-between px-4 py-3 bg-[#EBF1FC] hover:bg-primary/5 transition-colors cursor-pointer rounded-lg border border-gray-200 max-w-[250px] min-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
            >
                <div className="flex items-center gap-2">
                    <FiFilter className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-black whitespace-nowrap">
                        {displayText.length > 20 ? displayText.slice(0, 20) + '...' : displayText}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <IoIosArrowDown className="text-gray-400" size={18} />
                </motion.div>
            </button>

            {/* Dropdown Options */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto max-h-[500px] flex flex-col"
                    >
                        <div className="overflow-y-auto flex-1">
                            {/* All Shifts Option */}
                            <motion.label
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.15,
                                    ease: 'easeOut',
                                }}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    !selectedShiftId ? 'bg-primary/5' : ''
                                }`}
                                onClick={() => handleShiftSelect(null)}
                            >
                                <div className="relative flex items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                            !selectedShiftId
                                                ? 'border-secondary bg-secondary'
                                                : 'border-gray-300 bg-white'
                                        }`}
                                    >
                                        {!selectedShiftId && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="w-2 h-2 rounded-full bg-white"
                                            />
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`text-sm font-medium ${
                                        !selectedShiftId ? 'text-secondary' : 'text-gray-700'
                                    }`}
                                >
                                    All Shifts
                                </span>
                            </motion.label>

                            {/* Shift Options */}
                            {currentBranchShifts.length > 0 ? (
                                currentBranchShifts.map((shift: Shift, index: number) => (
                                    <motion.label
                                        key={shift.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.15,
                                            delay: (index + 1) * 0.05,
                                            ease: 'easeOut',
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            selectedShiftId === shift.id ? 'bg-primary/5' : ''
                                        }`}
                                        onClick={() => handleShiftSelect(shift)}
                                    >
                                        <div className="relative flex items-center">
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    selectedShiftId === shift.id
                                                        ? 'border-secondary bg-secondary'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            >
                                                {selectedShiftId === shift.id && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="w-2 h-2 rounded-full bg-white"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${
                                                selectedShiftId === shift.id ? 'text-secondary' : 'text-gray-700'
                                            }`}
                                        >
                                            {shift.shiftName}
                                        </span>
                                    </motion.label>
                                ))
                            ) : !loading && (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm text-gray-500">No shifts found.</p>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && currentBranchShifts.length === 0 && (
                                <div className="px-4 py-6">
                                    <ThreeDotLoading />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShiftFilterDropdown;
