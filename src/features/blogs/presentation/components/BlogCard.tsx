// import { useState } from 'react';
// import { useNavigate } from 'react-router';
// import { FiEdit2, FiTrash2, FiMoreVertical, FiCalendar, FiClock } from 'react-icons/fi';
// import type { BlogProps } from '../../data/blogTypes';
// import { useDispatch } from 'react-redux';
// import { removeBlog } from '../../redux/blogSlice';
// import { doc, deleteDoc } from 'firebase/firestore';
// import { db } from '../../../../firebaseConfig';
// import toast from 'react-hot-toast';
// import TimeAgo from 'timeago-react';
// import LoadImage from '../../../../general/components/LoadImage';
// import ConfirmModal from '../../../../general/components/ConfirmModal';
// import deleteImageFromStorageWithUrl from '../../../../general/utils/deleteImageFromStorageWithUrl';

// interface BlogCardProps {
//     data: BlogProps;
// }

// function BlogCard({ data }: BlogCardProps) {
//     const dispatch = useDispatch();
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const navigate = useNavigate();
//     const [showMenu, setShowMenu] = useState(false);

//     const handleDelete = async () => {
//         try {
//             // Delete image from storage if it exists
//             if (data.coverImageUrl) {
//                 try {
//                     await deleteImageFromStorageWithUrl(data.coverImageUrl);
//                 } catch (imgError) {
//                     console.error('Error deleting image from storage:', imgError);
//                     // Continue with record deletion even if image delete fails
//                 }
//             }

//             await deleteDoc(doc(db, 'blogs', data.id));
//             dispatch(removeBlog(data.id));
//             toast.success('Blog deleted successfully');
//         } catch (error) {
//             console.error('Error deleting blog:', error);
//             toast.error('Failed to delete blog');
//         } finally {
//             setShowDeleteModal(false);
//         }
//     };

//     const handleEditClick = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         navigate(`/blogs/edit/${data.id}`);
//         setShowMenu(false);
//     };

//     const handleDeleteClick = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         setShowDeleteModal(true);
//         setShowMenu(false);
//     };

//     const handleMenuClick = (e: React.MouseEvent) => {
//         e.stopPropagation();
//         setShowMenu(!showMenu);
//     };

//     return (
//         <>
//             <div className="bg-[#F6F9FF] group flex flex-col h-full rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden">
//                 {/* Image Section */}
//                 <div className="relative aspect-video overflow-hidden">
//                     {data.coverImageUrl ? (
//                         <LoadImage
//                             src={data.coverImageUrl}
//                             alt={data.title}
//                             index={0}
//                             className="w-full aspect-video h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                         />
//                     ) : (
//                         <div className="w-full h-full bg-gray-100 flex items-center justify-center">
//                             <FiCalendar className="w-12 h-12 text-gray-300" />
//                         </div>
//                     )}

//                     {/* Action Menu */}
//                     <div className="absolute top-2 right-2">
//                         <button
//                             onClick={handleMenuClick}
//                             className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-600 hover:text-primary transition-colors hover:bg-white"
//                         >
//                             <FiMoreVertical className="w-5 h-5" />
//                         </button>

//                         {showMenu && (
//                             <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20">
//                                 <button
//                                     onClick={handleEditClick}
//                                     className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//                                 >
//                                     <FiEdit2 className="w-4 h-4" /> Edit
//                                 </button>
//                                 <button
//                                     onClick={handleDeleteClick}
//                                     className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
//                                 >
//                                     <FiTrash2 className="w-4 h-4" /> Delete
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Content Section */}
//                 <div className="p-4 flex flex-col flex-grow">
//                     <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
//                         {data.title}
//                     </h3>
//                     <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
//                         {data.shortDescription}
//                     </p>

//                     <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
//                         <div className="flex items-center gap-1.5 text-xs text-gray-400">
//                             <FiClock className="w-3.5 h-3.5" />
//                             <TimeAgo datetime={data.createdAt?.toDate()} />
//                         </div>
//                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${data.isActive
//                             ? 'bg-green-100 text-green-700'
//                             : 'bg-red-100 text-red-700'
//                             }`}>
//                             {data.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* Delete Confirmation Modal */}
//             <ConfirmModal
//                 isOpen={showDeleteModal}
//                 onClose={() => setShowDeleteModal(false)}
//                 onConfirm={handleDelete}
//                 message={`Are you sure you want to delete "${data.title}"?`}
//             />

//         </>
//     );
// }

// export default BlogCard;
