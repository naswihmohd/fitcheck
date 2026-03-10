import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { fetchFourthCategories } from '../redux/fourthCategorySlice';
import AddFourthCategoryButton from './components/AddFourthCategoryButton';
import FourthCategoryCard from './components/FourthCategoryCard';
import FourthCategoryTable from './components/FourthCategoryTable';
import CategoryEnableInfo from '../../categoryManagement/presentation/components/CategoryEnableInfo';
import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
import type { FourthCategoryProps } from '../data/fourthCategoryTypes';
import type { ThirdCategoryProps } from '../../thirdCategory/data/thirdCategoryTypes';
import type { CategorySettingsProps } from '../../categoryManagement/data/categoryTypes';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import toast from 'react-hot-toast';

type ViewMode = 'card' | 'table';

function FourthCategory() {
  const { firstCategoryId, secondCategoryId, thirdCategoryId } = useParams<{ firstCategoryId: string; secondCategoryId: string; thirdCategoryId: string }>();
  const { categorySettings } = useOutletContext<{ categorySettings: CategorySettingsProps }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
  const [thirdCategoryData, setThirdCategoryData] = useState<ThirdCategoryProps | null>(null);
  const navigate = useNavigate();
  const thirdCategoriesState = useSelector((state: RootState) => state.thirdCategories);
  const thirdCategory = thirdCategoriesState.secondCategoryThirdCategories[secondCategoryId || '']?.thirdCategories.find(
    tc => tc.id === thirdCategoryId
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
    if (!thirdCategoryId) {
      toast.error('Third category ID is required. Please navigate from a third category.');
      navigate(`/category-management/${firstCategoryId}/${secondCategoryId}`);
    }
  }, [firstCategoryId, secondCategoryId, thirdCategoryId, navigate]);

  useEffect(() => {
    if (thirdCategory) {
      setThirdCategoryData(thirdCategory);
      return;
    }

    const fetchThirdCategoryData = async () => {
      try {
        if (!firstCategoryId || !secondCategoryId || !thirdCategoryId) return;
        const thirdCategoryRef = doc(db, "firstCategories", firstCategoryId, "secondCategories", secondCategoryId, "thirdCategories", thirdCategoryId);
        const thirdCategoryDoc = await getDoc(thirdCategoryRef);
        if (thirdCategoryDoc.exists()) {
          const thirdCategoryData = thirdCategoryDoc.data() as ThirdCategoryProps;
          setThirdCategoryData(thirdCategoryData);
        } else {
          console.error('Third category not found');
          navigate(`/category-management/${firstCategoryId}/${secondCategoryId}`);
        }
      } catch (error) {
        console.error('Error fetching third category data:', error);
        toast.error('Something went wrong. Please try again.');
      }
    };

    fetchThirdCategoryData();
  }, [firstCategoryId, secondCategoryId, thirdCategoryId, thirdCategory, navigate]);

  // Initialize view mode from URL query params, default to 'card'
  const getViewModeFromUrl = (params: URLSearchParams): ViewMode => {
    const viewParam = params.get('view');
    return (viewParam === 'card' || viewParam === 'table') ? viewParam : 'card';
  };

  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewModeFromUrl(searchParams));

  const dispatch: AppDispatch = useDispatch();

  // Get fourthCategories for the current thirdCategoryId
  const fourthCategoriesData = useSelector((state: RootState) => {
    if (!thirdCategoryId) return null;
    return state.fourthCategories.thirdCategoryFourthCategories[thirdCategoryId];
  });

  const fourthCategories = fourthCategoriesData?.fourthCategories || [];
  const loading = useSelector((state: RootState) => state.fourthCategories.loading);
  const error = useSelector((state: RootState) => state.fourthCategories.error);
  const currentFilter = fourthCategoriesData?.currentFilter;
  const hasMore = fourthCategoriesData?.hasMore || false;

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

  // Fetch fourthCategories when search query changes or thirdCategoryId changes
  useEffect(() => {
    if (!firstCategoryId || !secondCategoryId || !thirdCategoryId) return;
    if (fourthCategories.length > 0 && currentFilter === debouncedSearchQuery) return;
    dispatch(fetchFourthCategories({ params: { firstCategoryId, secondCategoryId, thirdCategoryId, searchQuery: debouncedSearchQuery } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, firstCategoryId, secondCategoryId, thirdCategoryId]);

  const handleLoadMore = () => {
    if (!firstCategoryId || !secondCategoryId || !thirdCategoryId || loading || !hasMore) return;
    dispatch(fetchFourthCategories({ params: { firstCategoryId, secondCategoryId, thirdCategoryId, searchQuery: debouncedSearchQuery } }));
  };

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);


  // Show enable info component if fourth category is disabled
  if (!categorySettings?.fourthCategoryEnabled && !loading) {
    return <CategoryEnableInfo category="Fourth" />;
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
        <h1 className="text-xl font-bold text-gray-900">Fourth Category Management - {`(${thirdCategoryData?.categoryName})` || ''}</h1>
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
          <AddFourthCategoryButton />
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
      {fourthCategories.length > 0 ? (
        viewMode === 'card' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            {fourthCategories.map((fourthCategory: FourthCategoryProps, index: number) => (
              <motion.div
                key={fourthCategory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FourthCategoryCard
                  data={fourthCategory}
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
            <FourthCategoryTable fourthCategories={fourthCategories} />
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
      {hasMore && !loading && fourthCategories.length > 0 && (
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

export default FourthCategory;
