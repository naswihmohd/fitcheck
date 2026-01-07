import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import type { CourseProps } from '../../../courses/data/courseType';
import ThreeDotLoading from '../../../../../general/components/ThreeDotLoading';
import { fetchBranchCourses } from '../../../courses/redux/coursesSlice';

interface SelectCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (course: CourseProps) => void;
}

const SelectCourseModal: React.FC<SelectCourseModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const { branchCourses, loading, error } = useSelector((state: RootState) => state.branchCourses);
    const { branchId } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    const currentBranchCourses = branchId && branchCourses[branchId]?.courses ? branchCourses[branchId].courses : [];
    const currentBranchHasMoreCourses = branchId && branchCourses[branchId]?.hasMore ? branchCourses[branchId].hasMore : false;

    // Debounce search query by 1 second
    useEffect(() => {
        const timer = setTimeout(() => {
            const formattedSearchQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
            setDebouncedSearchQuery(formattedSearchQuery);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch courses when modal opens or search changes
    useEffect(() => {
        if (!isOpen || !branchId) return;

        const branchData = branchCourses[branchId];
        // Only skip if we have courses and the search hasn't changed
        if (branchData?.courses && branchData?.courses.length > 0 && branchData?.currentFilter === debouncedSearchQuery) {
            return;
        }

        dispatch(fetchBranchCourses({ params: { searchQuery: debouncedSearchQuery || null } }));
    }, [dispatch, branchId, debouncedSearchQuery, isOpen]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setDebouncedSearchQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    const handleHasMore = () => {
        if (!loading && currentBranchHasMoreCourses && branchId) {
            dispatch(fetchBranchCourses({ params: { searchQuery: debouncedSearchQuery || null } }));
        }
    };

    const handleCourseSelect = (course: CourseProps) => {
        onSelect(course);
        onClose();
    };

    if (!mounted) return null;

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                className="absolute inset-0 bg-black/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={onClose}
                            />

                            <motion.div
                                className="relative z-40 w-full max-w-md rounded-[18px] bg-white shadow-2xl flex flex-col max-h-[90vh]"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="rounded-t-[18px] bg-primary px-6 py-3 flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-white">
                                        Select Course
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full text-white transition-transform duration-200 hover:scale-105"
                                        aria-label="Close"
                                    >
                                        <IoMdCloseCircleOutline className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="max-h-[80vh] h-full min-h-[500px] overflow-y-auto">
                                    {/* Search Bar */}
                                    <div className="px-6 pt-4 pb-3 border-b border-gray-200">
                                        <div className="relative">
                                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Search by course name"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            />
                                        </div>
                                    </div>

                                    {/* Courses List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-3 rounded-b-[18px]">
                                        {currentBranchCourses.length > 0 ? (
                                            <>
                                                {currentBranchCourses.map((course: CourseProps, index: number) => (
                                                    <motion.div
                                                        key={course.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{
                                                            duration: 0.3,
                                                            delay: index * 0.05
                                                        }}
                                                        onClick={() => handleCourseSelect(course)}
                                                        className="bg-white rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border border-gray-200 hover:border-secondary"
                                                        style={{
                                                            boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                                                        }}
                                                    >
                                                        {/* Course Icon/Indicator */}
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <span className="text-primary font-semibold text-lg">
                                                                    {course.courseName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Course Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                {course.courseName}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Duration: {course.courseDuration}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Fee: ₹{course.courseFee.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}

                                                {loading && <ThreeDotLoading />}

                                                {!loading && currentBranchHasMoreCourses && (
                                                    <button
                                                        onClick={handleHasMore}
                                                        className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 mt-4"
                                                    >
                                                        Load More
                                                    </button>
                                                )}
                                            </>
                                        ) : !loading && (
                                            <div className="flex items-center justify-center py-12">
                                                <p className="text-sm text-gray-500">
                                                    {searchQuery ? 'No courses match your search.' : 'No courses found.'}
                                                </p>
                                            </div>
                                        )}

                                        {loading && currentBranchCourses.length === 0 && <ThreeDotLoading />}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default SelectCourseModal;

