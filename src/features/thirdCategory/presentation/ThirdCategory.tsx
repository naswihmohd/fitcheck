import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchThirdCategories } from '../redux/thirdCategorySlice';
import AddThirdCategoryButton from './components/AddThirdCategoryButton';
import ThirdCategoryCard from './components/ThirdCategoryCard';
import ThirdCategoryTable from './components/ThirdCategoryTable';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import type { ThirdCategoryProps } from '../data/thirdCategoryTypes';
import type { SecondCategoryProps } from '../../secondCategory/data/secondCategoryTypes';
import type { CategorySettingsProps } from '../../categoryManagement/data/categoryTypes';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import toast from 'react-hot-toast';
import CategoryEnableInfo from '../../categoryManagement/presentation/components/CategoryEnableInfo';

type ViewMode = 'card' | 'table';

function ThirdCategory() {
  const { firstCategoryId, secondCategoryId } = useParams<{ firstCategoryId: string; secondCategoryId: string }>();
  const { categorySettings } = useOutletContext<{ categorySettings: CategorySettingsProps }>();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
  const [secondCategoryData, setSecondCategoryData] = useState<SecondCategoryProps | null>(null);
  const navigate = useNavigate();
  const secondCategoriesState = useSelector((state: RootState) => state.secondCategories);
  const secondCategory = secondCategoriesState.firstCategorySecondCategories[firstCategoryId || '']?.secondCategories.find(
    sc => sc.id === secondCategoryId
  );

  useEffect(() => {
    if (!firstCategoryId) {
      toast.error('First category ID is required. Please navigate from a first category.');
      navigate('/category-management');
    }
    if (!secondCategoryId) {
      toast.error('Second category ID is required. Please navigate from a second category.');
      navigate(`/category-management/${firstCategoryId}`);
    }
  }, [firstCategoryId, secondCategoryId, navigate]);

  useEffect(() => {
    if (secondCategory) {
      setSecondCategoryData(secondCategory);
      return;
    }

    const fetchSecondCategoryData = async () => {
      try {
        if (!firstCategoryId || !secondCategoryId) return;
        const secondCategoryRef = doc(db, "firstCategories", firstCategoryId, "secondCategories", secondCategoryId);
        const secondCategoryDoc = await getDoc(secondCategoryRef);
        if (secondCategoryDoc.exists()) {
          const secondCategoryData = secondCategoryDoc.data() as SecondCategoryProps;
          setSecondCategoryData(secondCategoryData);
        } else {
          console.error('Second category not found');
          navigate(`/category-management/${firstCategoryId}`);
        }
      } catch (error) {
        console.error('Error fetching second category data:', error);
        toast.error('Something went wrong. Please try again.');
      }
    };

    fetchSecondCategoryData();
  }, [firstCategoryId, secondCategoryId, secondCategory, navigate]);

  // Initialize view mode from URL query params, default to 'card'
  const getViewModeFromUrl = (params: URLSearchParams): ViewMode => {
    const viewParam = params.get('view');
    return (viewParam === 'card' || viewParam === 'table') ? viewParam : 'card';
  };

  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewModeFromUrl(searchParams));

  const dispatch: AppDispatch = useDispatch();

  // Get thirdCategories for the current secondCategoryId
  const thirdCategoriesData = useSelector((state: RootState) => {
    if (!secondCategoryId) return null;
    return state.thirdCategories.secondCategoryThirdCategories[secondCategoryId];
  });

  const thirdCategories = thirdCategoriesData?.thirdCategories || [];
  const loading = useSelector((state: RootState) => state.thirdCategories.loading);
  const error = useSelector((state: RootState) => state.thirdCategories.error);
  const currentFilter = thirdCategoriesData?.currentFilter;
  const hasMore = thirdCategoriesData?.hasMore || false;

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

  // Fetch thirdCategories when search query changes or secondCategoryId changes
  useEffect(() => {
    if (!firstCategoryId || !secondCategoryId) return;
    if (thirdCategories.length > 0 && currentFilter === debouncedSearchQuery) return;
    dispatch(fetchThirdCategories({ params: { firstCategoryId, secondCategoryId, searchQuery: debouncedSearchQuery } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, firstCategoryId, secondCategoryId]);

  const handleLoadMore = () => {
    if (!firstCategoryId || !secondCategoryId || loading || !hasMore) return;
    dispatch(fetchThirdCategories({ params: { firstCategoryId, secondCategoryId, searchQuery: debouncedSearchQuery } }));
  };

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (loading) {
    return <ThreeDotLoading />;
  }

  // Show enable info component if third category is disabled
  if (!categorySettings?.thirdCategoryEnabled && !loading) {
    return <CategoryEnableInfo category="Third" />;
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
        <h1 className="text-xl font-bold text-gray-900">Third Category Management - {`(${secondCategoryData?.categoryName})` || ''}</h1>
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
          <AddThirdCategoryButton />
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
      {thirdCategories.length > 0 ? (
        viewMode === 'card' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            {thirdCategories.map((thirdCategory: ThirdCategoryProps, index: number) => (
              <motion.div
                key={thirdCategory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ThirdCategoryCard
                  data={thirdCategory}
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
            <ThirdCategoryTable thirdCategories={thirdCategories} categorySettings={categorySettings} />
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
      {hasMore && !loading && thirdCategories.length > 0 && (
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

export default ThirdCategory;
