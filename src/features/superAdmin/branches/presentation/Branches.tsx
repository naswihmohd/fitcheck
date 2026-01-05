import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import BranchCard from './components/BranchCard';
import AddBranchButton from '../../addBranch/presentation/components/AddBranchButton';
import { fetchBranches } from '../redux/branchesSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';

function Branches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const dispatch: AppDispatch = useDispatch();

  const { branches, error, currentFilter, loading, hasMore } = useSelector((state: RootState) => state.branches);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch branches when search query changes
  useEffect(() => {
    const processedQuery = debouncedSearchQuery.trim() || null;
    const processedFilter = processedQuery
      ? processedQuery.toLowerCase().replace(/\s/g, '')
      : null;

    // Only fetch if filter changed or if we have no branches
    if (processedFilter !== currentFilter || branches.length === 0) {
      dispatch(fetchBranches({ searchQuery: processedQuery }));
    }
  }, [dispatch, debouncedSearchQuery, currentFilter]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleHasMore = () => {
    const processedQuery = debouncedSearchQuery.trim() || null;
    dispatch(fetchBranches({ searchQuery: processedQuery }));
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-between items-center gap-4"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Branches
        </h1>
      </motion.div>

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
            placeholder="Search By Name or phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <AddBranchButton />
      </motion.div>

      {/* Branch Cards */}
      <div className="space-y-4">
        {branches.length > 0 ? (
          branches.map((branch, index) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              index={index}
            />
          ))
        ) : !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500"
          >
            No branches found matching your search.
          </motion.div>
        )}

        {loading && (
          <ThreeDotLoading />
        )}
      </div>

      {!loading && hasMore && (
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

export default Branches;
