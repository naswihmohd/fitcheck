import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchBrands } from '../redux/brandSlice';
import AddBrandButton from './components/AddBrandButton';
import BrandCard from './components/BrandCard';
import BrandTable from './components/BrandTable';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import type { BrandProps } from '../data/brandTypes';

type ViewMode = 'card' | 'table';

function BrandManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
  
  // Initialize view mode from URL query params, default to 'card'
  const getViewModeFromUrl = (params: URLSearchParams): ViewMode => {
    const viewParam = params.get('view');
    return (viewParam === 'card' || viewParam === 'table') ? viewParam : 'card';
  };
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewModeFromUrl(searchParams));
  const { brands, loading, error, hasMore } = useSelector((state: RootState) => state.brands);
  const dispatch: AppDispatch = useDispatch();

  // Sync view mode from URL on mount and when URL changes
  useEffect(() => {
    const urlViewMode = getViewModeFromUrl(searchParams);
    if (urlViewMode !== viewMode) {
      setViewMode(urlViewMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  // Debounce search query by 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      const formattedSearchQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
      setDebouncedSearchQuery(formattedSearchQuery || null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch brands when search query changes
  useEffect(() => {
    dispatch(fetchBrands({ params: { searchQuery: debouncedSearchQuery } }));
  }, [debouncedSearchQuery, dispatch]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(fetchBrands({ params: { searchQuery: debouncedSearchQuery } }));
  };

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Brand Management</h1>
        <div className="flex items-center gap-3">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('card')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'card'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card View"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
          <AddBrandButton />
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="relative flex-1 max-w-md"
      >
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search brands by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </motion.div>

      {/* Brands Display */}
      {brands.length > 0 ? (
        viewMode === 'card' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {brands.map((brand: BrandProps, index: number) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <BrandCard
                  data={brand}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <BrandTable brands={brands} />
          </motion.div>
        )
      ) : !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center"
        >
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No brands found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or add a new brand</p>
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && <ThreeDotLoading />}

      {/* Load More Button */}
      {hasMore && !loading && brands.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
          >
            Load More
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default BrandManagement;
