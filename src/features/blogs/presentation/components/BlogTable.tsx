// import { useState } from 'react';
// import { useNavigate } from 'react-router';
// import { FiEdit2, FiTrash2, FiFileText, FiMove } from 'react-icons/fi';
// import type { BlogProps } from '../../data/blogTypes';
// import { useDispatch } from 'react-redux';
// import { removeBlog } from '../../redux/blogSlice';
// import { doc, deleteDoc } from 'firebase/firestore';
// import { db } from '../../../../firebaseConfig';
// import toast from 'react-hot-toast';
// import ProfileAvatar from '../../../../general/components/ProfileAvatar';
// import ConfirmModal from '../../../../general/components/ConfirmModal';
// import { Reorder } from 'framer-motion';

// interface BlogTableProps {
//     blogs: BlogProps[];
//     canReorder?: boolean;
//     onReorder?: (ids: string[]) => void;
// }

// function BlogTable({ blogs, canReorder = false, onReorder }: BlogTableProps) {
//     const dispatch = useDispatch();
//     const [showDeleteModalId, setShowDeleteModalId] = useState<string | null>(null);
//     const navigate = useNavigate();

//     const selectedBlog = blogs.find(blog => blog.id === showDeleteModalId);
//     const tableValues = blogs.map(blog => blog.id);

//     const handleDelete = async () => {
//         if (!showDeleteModalId) return;
//         try {
//             await deleteDoc(doc(db, 'blogs', showDeleteModalId));
//             dispatch(removeBlog(showDeleteModalId));
//             toast.success('Blog deleted successfully');
//         } catch (error) {
//             console.error('Error deleting blog:', error);
//             toast.error('Failed to delete blog');
//         } finally {
//             setShowDeleteModalId(null);
//         }
//     };

//     return (
//         <>
//             <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
//                 <table className="w-full">
//                     <thead className="bg-[#FAF9F6] border-b border-gray-200">
//                         <tr>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 No
//                             </th>
//                             <th className="px-2 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Move
//                             </th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Cover
//                             </th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Blog Title
//                             </th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Status
//                             </th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Created Date
//                             </th>
//                             <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Actions
//                             </th>
//                         </tr>
//                     </thead>
//                     {canReorder && onReorder ? (
//                         <Reorder.Group
//                             as="tbody"
//                             axis="y"
//                             values={tableValues}
//                             onReorder={onReorder}
//                             className="bg-white divide-y divide-gray-100"
//                         >
//                             {blogs.map((blog, index) => (
//                                 <Reorder.Item
//                                     as="tr"
//                                     key={blog.id}
//                                     value={blog.id}
//                                     className="hover:bg-[#FAF9F6]/50 transition-colors duration-150 cursor-grab active:cursor-grabbing"
//                                 >
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
//                                         {String(index + 1).padStart(2, '0')}
//                                     </td>
//                                     <td className="px-2 py-4 whitespace-nowrap text-gray-400">
//                                         <FiMove className="w-4 h-4" />
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         {blog.coverImageUrl ? (
//                                             <ProfileAvatar
//                                                 name={blog.title}
//                                                 imageUrl={blog.coverImageUrl}
//                                                 size="md"
//                                                 className="border-2 border-white shadow-sm"
//                                             />
//                                         ) : (
//                                             <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200">
//                                                 <FiFileText className="w-5 h-5 text-gray-400" />
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
//                                             {blog.title}
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${blog.isActive
//                                             ? 'bg-green-100 text-green-700'
//                                             : 'bg-red-100 text-red-700'
//                                             }`}>
//                                             {blog.isActive ? 'Active' : 'Inactive'}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
//                                         {blog.createdAt ? (
//                                             new Date(blog.createdAt.toMillis()).toLocaleDateString('en-GB', {
//                                                 day: '2-digit',
//                                                 month: 'short',
//                                                 year: 'numeric'
//                                             })
//                                         ) : (
//                                             <span className="text-gray-300">Not set</span>
//                                         )}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                         <div className="flex items-center justify-end gap-2">
//                                             <button
//                                                 onClick={() => navigate(`/blogs/edit/${blog.id}`)}
//                                                 className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200"
//                                                 title="Edit Blog"
//                                             >
//                                                 <FiEdit2 className="w-4.5 h-4.5" />
//                                             </button>
//                                             <button
//                                                 onClick={() => setShowDeleteModalId(blog.id)}
//                                                 className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
//                                                 title="Delete Blog"
//                                             >
//                                                 <FiTrash2 className="w-4.5 h-4.5" />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </Reorder.Item>
//                             ))}
//                         </Reorder.Group>
//                     ) : (
//                         <tbody className="bg-white divide-y divide-gray-100">
//                             {blogs.map((blog, index) => (
//                                 <tr
//                                     key={blog.id}
//                                     className="hover:bg-[#FAF9F6]/50 transition-colors duration-150"
//                                 >
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
//                                         {String(index + 1).padStart(2, '0')}
//                                     </td>
//                                     <td className="px-2 py-4 whitespace-nowrap text-gray-300">
//                                         <FiMove className="w-4 h-4" />
//                                     </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     {blog.coverImageUrl ? (
//                                         <ProfileAvatar
//                                             name={blog.title}
//                                             imageUrl={blog.coverImageUrl}
//                                             size="md"
//                                             className="border-2 border-white shadow-sm"
//                                         />
//                                     ) : (
//                                         <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200">
//                                             <FiFileText className="w-5 h-5 text-gray-400" />
//                                         </div>
//                                     )}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
//                                         {blog.title}
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${blog.isActive
//                                         ? 'bg-green-100 text-green-700'
//                                         : 'bg-red-100 text-red-700'
//                                         }`}>
//                                         {blog.isActive ? 'Active' : 'Inactive'}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
//                                     {blog.createdAt ? (
//                                         new Date(blog.createdAt.toMillis()).toLocaleDateString('en-GB', {
//                                             day: '2-digit',
//                                             month: 'short',
//                                             year: 'numeric'
//                                         })
//                                     ) : (
//                                         <span className="text-gray-300">Not set</span>
//                                     )}
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                     <div className="flex items-center justify-end gap-2">
//                                         <button
//                                             onClick={() => navigate(`/blogs/edit/${blog.id}`)}
//                                             className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200"
//                                             title="Edit Blog"
//                                         >
//                                             <FiEdit2 className="w-4.5 h-4.5" />
//                                         </button>
//                                         <button
//                                             onClick={() => setShowDeleteModalId(blog.id)}
//                                             className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
//                                             title="Delete Blog"
//                                         >
//                                             <FiTrash2 className="w-4.5 h-4.5" />
//                                         </button>
//                                     </div>
//                                 </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     )}
//                 </table>
//                 {blogs.length === 0 && (
//                     <div className="py-12 flex flex-col items-center justify-center text-gray-400">
//                         <FiFileText className="w-12 h-12 mb-2" />
//                         <p>No blogs found</p>
//                     </div>
//                 )}
//             </div>

//             {/* Delete Confirmation Modal */}
//             {selectedBlog && showDeleteModalId && (
//                 <ConfirmModal
//                     isOpen={true}
//                     onClose={() => setShowDeleteModalId(null)}
//                     onConfirm={handleDelete}
//                     message={`Are you sure you want to delete "${selectedBlog.title}"?`}
//                 />
//             )}

//         </>
//     );
// }

// export default BlogTable;
