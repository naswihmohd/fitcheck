import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi'
import TutorCard from './components/TutorCard';
import AddTutorButton from './components/AddTutorButton';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { fetchBranchTutors } from '../redux/tutorSlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

function TutorManagement() {

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const { branchTutors, error, loading } = useSelector((state: RootState) => state.branchTutors);
    const { branchId } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    const currentBranchTutors = branchId && branchTutors[branchId]?.teams ? branchTutors[branchId].teams : [];
    const currentBranchHasMoreTutors = branchId && branchTutors[branchId]?.hasMore ? branchTutors[branchId].hasMore : false;

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

        const branchData = branchTutors[branchId];
        // Only skip if we have teams and the search hasn't changed
        if (branchData?.teams && branchData?.teams.length > 0 && branchData?.currentFilter === debouncedSearchQuery) {
            return;
        }

        dispatch(fetchBranchTutors({ searchQuery: debouncedSearchQuery || null }));
    }, [dispatch, branchId, debouncedSearchQuery]);

    const handleHasMore = () => {
        if (!loading && currentBranchHasMoreTutors) {
            dispatch(fetchBranchTutors({ searchQuery: debouncedSearchQuery || null }));
        }
    }

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return (
        <div className="space-y-6 pb-6">

            <h1 className="text-xl font-bold text-gray-900">
                Tutor Management
            </h1>

            {/* Search and Create Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search By Name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                    />
                </div>

                {/* Filter Dropdown */}
                {/* <div className="relative">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="pl-10 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none appearance-none cursor-pointer"
                    >
                        {courses.map((course) => (
                            <option key={course} value={course}>
                                {course}
                            </option>
                        ))}
                    </select>
                    <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3 4.5L6 7.5L9 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div> */}

                {/* Add New Tutor Button */}
                <AddTutorButton />
            </motion.div>

            {/* Tutor Cards */}
            <div className="space-y-3">
                {currentBranchTutors.length > 0 ? (
                    currentBranchTutors.map((tutor, index) => (
                        <TutorCard key={tutor.id} index={index} tutor={tutor} />
                    ))
                ) : !loading && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'No tutors match your search.' : 'No tutors found.'}
                        </p>
                    </div>
                )}

                {loading && <ThreeDotLoading />}
            </div>

            {!loading && currentBranchHasMoreTutors && (
                <button
                    className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300"
                    onClick={handleHasMore}
                >
                    Load More
                </button>
            )}
        </div>
    );
}

export default TutorManagement;

