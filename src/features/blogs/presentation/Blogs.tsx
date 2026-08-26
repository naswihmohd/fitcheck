// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { FiSearch, FiGrid, FiList, FiPlus } from 'react-icons/fi';
// import { useDispatch, useSelector } from 'react-redux';
// import { useSearchParams, useNavigate } from 'react-router';
// import type { AppDispatch, RootState } from '../../../general/redux/store';
// import { fetchBlogs, reorderBlogs, persistBlogOrder, clearBlogs } from '../redux/blogSlice';
// import BlogCard from './components/BlogCard';
// import BlogTable from './components/BlogTable';
// import type { BlogProps } from '../data/blogTypes';
// import ThreeDotLoading from '../../../general/components/ThreeDotLoading';
// import toast from 'react-hot-toast';

// type ViewMode = 'card' | 'table';

// function Blogs() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string | null>(null);
//   const navigate = useNavigate();

//   const getViewModeFromUrl = (params: URLSearchParams): ViewMode => {
//     const viewParam = params.get('view');
//     return (viewParam === 'card' || viewParam === 'table') ? viewParam : 'card';
//   };

//   const [viewMode, setViewMode] = useState<ViewMode>(() => getViewModeFromUrl(searchParams));

//   const dispatch: AppDispatch = useDispatch();
//   const { blogs, loading, hasMore, error, currentFilter } = useSelector((state: RootState) => state.blogs);
//   const canReorderBlogs = !debouncedSearchQuery && !hasMore && blogs.length > 0;

//   const handleReorderBlogs = async (newIds: string[]) => {
//     const newBlogs = newIds.map(id => blogs.find(b => b.id === id)).filter(Boolean) as BlogProps[];
//     if (newBlogs.length !== newIds.length) return;
//     dispatch(reorderBlogs(newBlogs));
//     try {
//       await dispatch(persistBlogOrder(newBlogs)).unwrap();
//     } catch {
//       toast.error('Could not save order. Reloading list.');
//       dispatch(clearBlogs());
//       dispatch(fetchBlogs({ searchQuery: debouncedSearchQuery }));
//     }
//   };

//   // Sync view mode from URL
//   useEffect(() => {
//     const urlViewMode = getViewModeFromUrl(searchParams);
//     if (urlViewMode !== viewMode) {
//       setViewMode(urlViewMode);
//     }
//   }, [searchParams, viewMode]);

//   const handleViewModeChange = (mode: ViewMode) => {
//     setViewMode(mode);
//     setSearchParams((prev) => {
//       const newParams = new URLSearchParams(prev);
//       newParams.set('view', mode);
//       return newParams;
//     });
//   };

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchQuery(searchQuery.trim() || null);
//     }, 800);
//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   // Fetch blogs
//   useEffect(() => {
//     if (blogs.length === 0 || currentFilter !== debouncedSearchQuery) {
//       dispatch(fetchBlogs({ searchQuery: debouncedSearchQuery }));
//     }
//   }, [debouncedSearchQuery, dispatch]);

//   const handleLoadMore = () => {
//     if (loading || !hasMore) return;
//     dispatch(fetchBlogs({ searchQuery: debouncedSearchQuery }));
//   };

//   useEffect(() => {
//     if (error) {
//       console.error(error);
//     }
//   }, [error]);

//   return (
//     <div className="space-y-6 pb-12 min-h-screen">
//       {/* Header Section */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
//       >
//         <div>
//           <h1 className="text-xl font-bold text-gray-900">Blog Management</h1>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* View Toggle */}
//           <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
//             <button
//               onClick={() => handleViewModeChange('card')}
//               className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
//               title="Grid View"
//             >
//               <FiGrid className="w-5 h-5" />
//             </button>
//             <button
//               onClick={() => handleViewModeChange('table')}
//               className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
//               title="Table View"
//             >
//               <FiList className="w-5 h-5" />
//             </button>
//           </div>

//           <button
//             onClick={() => navigate('/blogs/add')}
//             className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md font-semibold hover:bg-primary/90 transition-all"
//           >
//             <FiPlus className="w-5 h-5" /> Add Blog
//           </button>
//         </div>
//       </motion.div>

//       {/* Search Bar */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="relative max-w-md"
//       >
//         <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//         <input
//           type="text"
//           placeholder="Search blogs by title"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded outline-none border border-gray-200 transition-all"
//         />
//       </motion.div>

//       <hr className="text-gray-300" />
//       {blogs.length > 0 && (
//         <p className="text-xs text-gray-500">
//           {viewMode === 'table' && canReorderBlogs
//             ? 'Drag table rows to change display order. Order is saved automatically.'
//             : debouncedSearchQuery
//               ? 'Clear search to reorder blogs.'
//               : hasMore
//                 ? 'Load all blogs (Load more) to reorder the full list.'
//                 : null}
//         </p>
//       )}

//       {/* Blogs Display */}
//       {blogs.length > 0 ? (
//         viewMode === 'card' ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {blogs.map((blog: BlogProps, index: number) => (
//               <motion.div
//                 key={blog.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//               >
//                 <BlogCard data={blog} />
//               </motion.div>
//             ))}
//           </div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//           >
//             <BlogTable
//               blogs={blogs}
//               canReorder={canReorderBlogs}
//               onReorder={handleReorderBlogs}
//             />
//           </motion.div>
//         )
//       ) : !loading && (
//         <div className="py-24 text-center">
//           <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
//             <FiSearch className="w-8 h-8 text-gray-300" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-2">No blogs found</h3>
//           <p className="text-sm text-gray-500 max-w-xs mx-auto">
//             {searchQuery ? `We couldn't find any results for "${searchQuery}"` : "You haven't added any blogs yet. Click the 'Add Blog' button to get started."}
//           </p>
//         </div>
//       )}

//       {/* Loading */}
//       {loading && (
//         <div className="py-12">
//           <ThreeDotLoading />
//         </div>
//       )}

//       {/* Load More */}
//       {hasMore && !loading && blogs.length > 0 && (
//         <div className="flex justify-center pt-8">
//           <button
//             onClick={handleLoadMore}
//             className="px-8 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
//           >
//             Load More Articles
//           </button>
//         </div>
//       )}

//     </div>
//   );
// }

// export default Blogs;
