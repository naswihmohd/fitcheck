import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus } from 'react-icons/fi';
import CourseCard from './components/CourseCard';
import AddCourseModal from './components/AddCourseModal';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import type { CourseProps } from '../data/courseType';
import { clearBranchCourses, fetchBranchCourses } from '../redux/coursesSlice';

const Courses = () => {
    const { branchCourses, error, loading } = useSelector((state: RootState) => state.branchCourses);
    const { branchId } = useSelector((state: RootState) => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseProps | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
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

    useEffect(() => {
        if (!branchId) return;
        if (currentBranchCourses && currentBranchCourses.length > 0 && branchCourses[branchId]?.currentFilter === debouncedSearchQuery) {
            return;
        }
        dispatch(clearBranchCourses());
        dispatch(fetchBranchCourses({ params: { searchQuery: debouncedSearchQuery } }));
    }, [debouncedSearchQuery, dispatch, branchId]);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    const handleEdit = (course: CourseProps) => {
        setSelectedCourse(course);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleHasMore = () => {
        if (!loading && currentBranchHasMoreCourses) {
            dispatch(fetchBranchCourses({ params: { searchQuery: debouncedSearchQuery } }));
        }
    };

    const handleCreateNewCourse = () => {
        setSelectedCourse(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            {/* Header Section */}
            <div className="mb-6">
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Course Management</h1>
                </div>

                {/* Search and Create Button Row */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search Course Name....."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm bg-white outline-none border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Create New Course Button */}
                    <button
                        onClick={handleCreateNewCourse}
                        className="flex items-center gap-2 px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg cursor-pointer text-sm transition-colors font-medium"
                    >
                        <FiPlus size={18} />
                        <span>Create New Course</span>
                    </button>
                </div>
            </div>

            {/* Course Fee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentBranchCourses.length > 0 ? (
                    currentBranchCourses.map((course, index) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            index={index}
                            onEdit={handleEdit}
                        />
                    ))
                ) : !loading && (
                    <div className="text-center col-span-full py-12">
                        <p className="text-gray-500 text-base">No courses found matching your search.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex col-span-full items-center justify-center py-12">
                        <span className="three-body">
                            <span className="three-body__dot"></span>
                            <span className="three-body__dot"></span>
                            <span className="three-body__dot"></span>
                        </span>
                    </div>
                )}

                {!loading && currentBranchHasMoreCourses && (
                    <div className="flex col-span-full items-center justify-center mt-7">
                        <button
                            onClick={handleHasMore}
                            className="w-fit mx-auto py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Course Modal */}
            <AddCourseModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                mode={modalMode}
                course={selectedCourse}
            />
        </motion.div>
    );
};

export default Courses;
