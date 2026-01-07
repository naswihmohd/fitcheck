import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router';
import BatchCard from './components/BatchCard';
import AddBatchModal from './components/AddBatchModal';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import type { BatchProps } from '../data/batchTypes';
import { clearCourseBatches, fetchCourseBatches } from '../redux/batchSlice';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { CourseProps } from '../../courses/data/courseType';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

const BatchManagement = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { courseBatches, error, loading } = useSelector((state: RootState) => state.branchBatches);
    const { branchId } = useSelector((state: RootState) => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchProps | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [courseData, setCourseData] = useState<CourseProps | null>(null);
    const dispatch: AppDispatch = useDispatch();
    const [courseLoading, setCourseLoading] = useState(false);

    const currentCourseBatches = courseId && courseBatches[courseId]?.batches ? courseBatches[courseId].batches : [];
    const currentCourseHasMoreBatches = courseId && courseBatches[courseId]?.hasMore ? courseBatches[courseId].hasMore : false;

    useEffect(() => {
        if (!branchId || !courseId) return;
        const fetchCourse = async () => {
            try {
                setCourseLoading(true);
                if (!branchId) return;
                const courseRef = doc(db, "branches", branchId, "courses", courseId);
                const courseDoc = await getDoc(courseRef);
                if (courseDoc.exists()) {
                    const courseData = courseDoc.data() as CourseProps;
                    setCourseData(courseData);
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
            } finally {
                setCourseLoading(false);
            }
        };
        fetchCourse();
    }, [branchId, courseId]);

    // Redirect if courseId is missing
    useEffect(() => {
        if (!courseId) {
            navigate('/branch/batch-management');
        }
    }, [courseId, navigate]);

    // Debounce search query by 1 second
    useEffect(() => {
        const timer = setTimeout(() => {
            const formattedSearchQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
            setDebouncedSearchQuery(formattedSearchQuery);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!branchId || !courseId) return;
        if (currentCourseBatches && currentCourseBatches.length > 0 && courseBatches[courseId]?.currentFilter === debouncedSearchQuery) {
            return;
        }
        dispatch(clearCourseBatches());
        dispatch(fetchCourseBatches({ params: { courseId, branchId, searchQuery: debouncedSearchQuery } }));
    }, [debouncedSearchQuery, dispatch, branchId, courseId]);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    const handleEdit = (batch: BatchProps) => {
        setSelectedBatch(batch);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (batch: BatchProps) => {
        // TODO: Implement delete functionality
        console.log('Delete batch:', batch.id);
        // You can add confirmation dialog and delete logic here
    };

    const handleToggleEnable = (batch: BatchProps, enabled: boolean) => {
        // TODO: Implement enable/disable functionality
        console.log('Toggle batch enabled:', batch.id, enabled);
        // You can add update logic here to save the enabled state
    };

    const handleAllocateStudent = (batch: BatchProps) => {
        // TODO: Implement allocate student functionality
        console.log('Allocate student to batch:', batch.id);
        // You can navigate to student allocation page or open a modal
    };

    const handleHasMore = () => {
        if (!loading && currentCourseHasMoreBatches && courseId && branchId) {
            dispatch(fetchCourseBatches({ params: { courseId, branchId, searchQuery: debouncedSearchQuery } }));
        }
    };

    const handleCreateNewBatch = () => {
        setSelectedBatch(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedBatch(null);
    };

    if (!courseId) {
        return null;
    }

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
                    <h1 className="text-xl font-bold text-gray-900">Batch Management</h1>
                </div>

                {/* Search and Create Button Row */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search Batch Name....."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm bg-white outline-none border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Create New Batch Button */}
                    <button
                        onClick={handleCreateNewBatch}
                        className="flex items-center gap-2 px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg cursor-pointer text-sm transition-colors font-medium"
                    >
                        <FiPlus size={18} />
                        <span>Create New Batch</span>
                    </button>
                </div>
            </div>

            {/* Batch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCourseBatches.length > 0 ? (
                    currentCourseBatches.map((batch, index) => (
                        <BatchCard
                            key={batch.id}
                            batch={batch}
                            index={index}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleEnable={handleToggleEnable}
                            onAllocateStudent={handleAllocateStudent}
                        />
                    ))
                ) : !loading && (
                    <div className="text-center col-span-full py-12">
                        <p className="text-gray-500 text-base">No batches found matching your search.</p>
                    </div>
                )}

                {(loading || courseLoading) && <ThreeDotLoading />}

                {!loading && currentCourseHasMoreBatches && (
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

            {/* Add/Edit Batch Modal */}
            {courseData && (
                <AddBatchModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    mode={modalMode}
                    batch={selectedBatch}
                    courseId={courseId}
                    courseData={courseData}
                />
            )}
        </motion.div>
    );
};

export default BatchManagement;

