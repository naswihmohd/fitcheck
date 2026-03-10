import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchSecondCategories } from '../redux/secondCategorySlice';
import AddSecondCategoryButton from './components/AddSecondCategoryButton';
import SecondCategoryCard from './components/SecondCategoryCard';
import SecondCategoryTable from './components/SecondCategoryTable';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import type { SecondCategoryProps } from '../data/secondCategoryTypes';
import type { FirstCategoryProps } from '../../firstCategory/data/firstCategoryTypes';
import type { CategorySettingsProps } from '../../categoryManagement/data/categoryTypes';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import toast from 'react-hot-toast';
import CategoryEnableInfo from '../../categoryManagement/presentation/components/CategoryEnableInfo';

type ViewMode = 'card' | 'table';

function SecondCategory() {
  const { firstCategoryId } = useParams<{ firstCategoryId: string }>();
  const { categorySettings } = useOutletContext<{ categorySettings: CategorySettingsProps }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
  const [firstCategoryData, setFirstCategoryData] = useState<FirstCategoryProps | null>(null);
  const navigate = useNavigate();
  const { firstCategories } = useSelector((state: RootState) => state.firstCategories);
  const firstCategory = firstCategories.find(firstCategory => firstCategory.id === firstCategoryId);

  useEffect(() => {
    if (!firstCategoryId) {
      toast.error('First category ID is required. Please navigate from a first category.');
      navigate('/category-management');
    }
  }, [firstCategoryId]);

  useEffect(() => {
    if (firstCategory) {
      setFirstCategoryData(firstCategory);
      return;
    }

    const fetchStudentData = async () => {
      try {
        if (!firstCategoryId) return;
        const firstCategoryRef = doc(db, "firstCategories", firstCategoryId);
        const firstCategoryDoc = await getDoc(firstCategoryRef);
        if (firstCategoryDoc.exists()) {
          const firstCategoryData = firstCategoryDoc.data() as FirstCategoryProps;
          setFirstCategoryData(firstCategoryData);
        } else {
          console.error('First category not found');
          navigate('/category-management');
        }
      } catch (error) {
        console.error('Error fetching first category data:', error);
        toast.error('Something went wrong. Please try again.');
      }
    };

    fetchStudentData();
  }, [firstCategoryId, firstCategories, navigate]);

  // Initialize view mode from URL query params, default to 'card'
  const getViewModeFromUrl = (params: URLSearchParams): ViewMode => {
    const viewParam = params.get('view');
    return (viewParam === 'card' || viewParam === 'table') ? viewParam : 'card';
  };

  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewModeFromUrl(searchParams));

  const dispatch: AppDispatch = useDispatch();

  // Get secondCategories for the current firstCategoryId
  const secondCategoriesData = useSelector((state: RootState) => {
    if (!firstCategoryId) return null;
    return state.secondCategories.firstCategorySecondCategories[firstCategoryId];
  });

  const secondCategories = secondCategoriesData?.secondCategories || [];
  const loading = useSelector((state: RootState) => state.secondCategories.loading);
  const error = useSelector((state: RootState) => state.secondCategories.error);
  const currentFilter = secondCategoriesData?.currentFilter;
  const hasMore = secondCategoriesData?.hasMore || false;

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

  // Fetch secondCategories when search query changes or firstCategoryId changes
  useEffect(() => {
    if (!firstCategoryId) return;
    if (secondCategories.length > 0 && currentFilter === debouncedSearchQuery) return;
    dispatch(fetchSecondCategories({ params: { firstCategoryId, searchQuery: debouncedSearchQuery } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, firstCategoryId]);

  const handleLoadMore = () => {
    if (!firstCategoryId || loading || !hasMore) return;
    dispatch(fetchSecondCategories({ params: { firstCategoryId, searchQuery: debouncedSearchQuery } }));
  };

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  // Show enable info component if second category is disabled
  if (!categorySettings?.secondCategoryEnabled && !loading) {
    return <CategoryEnableInfo category="Second" />;
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Second Category Management - {`(${firstCategoryData?.categoryName})` || ''}</h1>
        <div className="flex items-center gap-3">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('card')}
              className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'card'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
              title="Card View"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'table'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
              title="Table View"
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
          <AddSecondCategoryButton />
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
          placeholder="Search categories by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </motion.div>

      {/* Categories Display */}
      {secondCategories.length > 0 ? (
        viewMode === 'card' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            {secondCategories.map((secondCategory: SecondCategoryProps, index: number) => (
              <motion.div
                key={secondCategory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <SecondCategoryCard
                  data={secondCategory}
                  categorySettings={categorySettings}
                  isSquaredBorder={true}
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
            <SecondCategoryTable secondCategories={secondCategories} categorySettings={categorySettings} />
          </motion.div>
        )
      ) : !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center"
        >
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or add a new category</p>
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && <ThreeDotLoading />}

      {/* Load More Button */}
      {hasMore && !loading && secondCategories.length > 0 && (
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

export default SecondCategory;
