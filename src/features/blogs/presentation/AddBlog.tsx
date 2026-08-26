// import React, { useEffect, useState, useRef } from 'react';
// import { useForm } from 'react-hook-form';
// import { doc, setDoc, collection, serverTimestamp, Timestamp, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
// import { db } from '../../../firebaseConfig';
// import type { BlogProps } from '../data/blogTypes';
// import toast from 'react-hot-toast';
// import { HiPlus, HiChevronLeft } from 'react-icons/hi';
// import { useDispatch } from 'react-redux';
// import type { AppDispatch } from '../../../general/redux/store';
// import { addBlog, updateBlog } from '../redux/blogSlice';
// import Quill from 'quill';
// import 'quill/dist/quill.snow.css';
// import { useNavigate, useParams } from 'react-router';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '../../../firebaseConfig';
// import imageCompression from 'browser-image-compression';
// import keywordsBuilder from '../../../general/utils/keywordsBuilder';
// import LoadImage from '../../../general/components/LoadImage';


// interface BlogFormData {
//     title: string;
//     uniqueUrlId: string;
//     shortDescription: string;
//     coverImageUrl: string;
//     isActive: boolean;
//     image: FileList;
// }

// const AddBlog: React.FC = () => {
//     const { blogId } = useParams<{ blogId?: string }>();
//     const navigate = useNavigate();
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isLoading, setIsLoading] = useState(!!blogId);
//     const [blogData, setBlogData] = useState<BlogProps | null>(null);
//     const isEditMode = !!blogId;
//     const dispatch: AppDispatch = useDispatch();
//     const quillRef = useRef<HTMLDivElement>(null);
//     const quillInstance = useRef<Quill | null>(null);
//     const [previewImage, setPreviewImage] = useState<string | null>(null);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);


//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//         watch,
//         setValue,
//         reset,
//     } = useForm<BlogFormData>({
//         defaultValues: {
//             title: '',
//             uniqueUrlId: '',
//             shortDescription: '',
//             coverImageUrl: '',
//             isActive: true,
//             image: undefined as any,
//         },
//         mode: 'onTouched',
//     });

//     // Load blog data if in edit mode
//     useEffect(() => {
//         const fetchBlogData = async () => {
//             if (!blogId) return;
//             setIsLoading(true);
//             try {
//                 const docRef = doc(db, 'blogs', blogId);
//                 const docSnap = await getDoc(docRef);
//                 if (docSnap.exists()) {
//                     const data = { id: docSnap.id, ...docSnap.data() } as BlogProps;
//                     setBlogData(data);
//                     reset({
//                         title: data.title,
//                         uniqueUrlId: data.uniqueUrlId,
//                         shortDescription: data.shortDescription,
//                         coverImageUrl: data.coverImageUrl,
//                         isActive: data.isActive,
//                         image: undefined as any,
//                     });
//                     setPreviewImage(data.coverImageUrl);
//                     if (quillInstance.current) {
//                         quillInstance.current.root.innerHTML = data.content;
//                     }
//                 } else {
//                     toast.error('Blog not found');
//                     navigate('/blogs');
//                 }
//             } catch (error) {
//                 console.error('Error fetching blog:', error);
//                 toast.error('Failed to load blog data');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchBlogData();
//     }, [blogId, reset, navigate]);

//     // Initialize Quill
//     useEffect(() => {
//         if (isLoading) return;

//         if (quillRef.current && !quillInstance.current) {
//             // Check if already initialized on this DOM element to avoid duplicates
//             if (quillRef.current.classList.contains('ql-container')) return;

//             quillInstance.current = new Quill(quillRef.current, {
//                 theme: 'snow',
//                 modules: {
//                     toolbar: [
//                         [{ 'header': [1, 2, 3, false] }],
//                         ['bold', 'italic', 'underline', 'strike'],
//                         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//                         [{ 'align': [] }],
//                         ['link'],
//                         ['clean']
//                     ]
//                 }
//             });

//             if (blogData && quillInstance.current) {
//                 quillInstance.current.root.innerHTML = blogData.content;
//             }
//         }

//         // Cleanup: Don't null the ref if the DOM is still there. 
//         // This prevents double initialization in React Strict Mode.
//         return () => {
//             // If we wanted to properly clean up, we would need to manually remove the toolbar
//             // because Quill doesn't provide a native destroy() method.
//             // But leaving it for the same component life-cycle is usually safer.
//         };
//     }, [blogData, isLoading]);

//     // Handle Image Preview
//     const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         const fileSizeMB = file.size / (1024 * 1024);

//         // If file is larger than 0.5MB, compress it
//         if (fileSizeMB > 0.5) {
//             const loadingToast = toast.loading("Compressing image...");
//             try {
//                 const options = {
//                     maxSizeMB: 0.5, // Target 500KB
//                     maxWidthOrHeight: 1920,
//                     useWebWorker: true,
//                 };

//                 const compressedFile = await imageCompression(file, options);
//                 const compressedSizeMB = compressedFile.size / (1024 * 1024);

//                 if (compressedSizeMB > 0.5) {
//                     // If still above 0.5MB, try harder
//                     const moreAggressiveOptions = {
//                         maxSizeMB: 0.4,
//                         maxWidthOrHeight: 1280,
//                         useWebWorker: true,
//                     };
//                     const twiceCompressedFile = await imageCompression(compressedFile, moreAggressiveOptions);
//                     setSelectedFile(twiceCompressedFile);
//                     setPreviewImage(URL.createObjectURL(twiceCompressedFile));
//                 } else {
//                     setSelectedFile(compressedFile);
//                     setPreviewImage(URL.createObjectURL(compressedFile));
//                 }
//                 toast.dismiss(loadingToast);
//                 console.log(`Image compressed successfully (${(compressedFile.size / 1024).toFixed(0)}KB)`);
//             } catch (error) {
//                 console.error("Image compression error:", error);
//                 toast.dismiss(loadingToast);
//                 toast.error("Failed to compress image. Uploading original.");
//                 setSelectedFile(file);
//                 setPreviewImage(URL.createObjectURL(file));
//             }
//         } else {
//             setSelectedFile(file);
//             setPreviewImage(URL.createObjectURL(file));
//         }
//     };




//     const onSubmit = async (data: BlogFormData) => {
//         const content = quillInstance.current?.root.innerHTML || '';
//         if (!content || content === '<p><br></p>') {
//             toast.error('Blog content is required');
//             return;
//         }

//         setIsSubmitting(true);
//         try {
//             const blogsCollectionRef = collection(db, 'blogs');

//             // Generate/Use blog ID
//             const targetBlogId = isEditMode && blogId ? blogId : doc(blogsCollectionRef).id;

//             // Check if uniqueUrlId already exists
//             const q = query(blogsCollectionRef, where("uniqueUrlId", "==", data.uniqueUrlId));
//             const querySnapshot = await getDocs(q);

//             let isDuplicate = false;
//             querySnapshot.forEach((doc) => {
//                 if (doc.id !== targetBlogId) {
//                     isDuplicate = true;
//                 }
//             });

//             if (isDuplicate) {
//                 toast.error('A blog with this URL ID already exists. Please use a different one.');
//                 setIsSubmitting(false);
//                 return;
//             }

//             let imageUrl = data.coverImageUrl;

//             // Upload Image if selected
//             if (selectedFile) {
//                 const storageRef = ref(storage, `blogs/${targetBlogId}`);
//                 await uploadBytes(storageRef, selectedFile);
//                 imageUrl = await getDownloadURL(storageRef);
//             }

//             if (!imageUrl && !isEditMode) {
//                 toast.error('Cover image is required');
//                 setIsSubmitting(false);
//                 return;
//             }

//             const allKeywords = keywordsBuilder(data.title);
//             let nextOrder = 0;
//             if (!isEditMode) {
//                 const orderQuery = query(blogsCollectionRef, orderBy('order', 'desc'), limit(1));
//                 const orderSnap = await getDocs(orderQuery);
//                 if (!orderSnap.empty) {
//                     const maxOrder = orderSnap.docs[0].data().order;
//                     nextOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 0;
//                 }
//             }

//             const blogDataToSave = {
//                 ...data,
//                 coverImageUrl: imageUrl,
//                 content,
//                 keywords: allKeywords,
//                 isActive: data.isActive,
//                 updatedAt: serverTimestamp(),
//             };

//             // Remove 'image' from the data being saved to Firestore
//             delete (blogDataToSave as any).image;

//             if (isEditMode) {
//                 const blogDocRef = doc(db, 'blogs', targetBlogId);
//                 await setDoc(blogDocRef, blogDataToSave, { merge: true });

//                 dispatch(updateBlog({
//                     ...(blogData as BlogProps),
//                     ...blogDataToSave,
//                     updatedAt: Timestamp.now(),
//                 } as BlogProps));
//                 toast.success('Blog updated successfully');
//             } else {
//                 const blogDocRef = doc(db, 'blogs', targetBlogId);
//                 const newBlog = {
//                     ...blogDataToSave,
//                     createdAt: serverTimestamp(),
//                     order: nextOrder,
//                 };

//                 await setDoc(blogDocRef, newBlog);

//                 dispatch(addBlog({
//                     ...newBlog,
//                     id: targetBlogId,
//                     createdAt: Timestamp.now(),
//                     updatedAt: Timestamp.now(),
//                     order: nextOrder,
//                 } as BlogProps));
//                 toast.success('Blog added successfully');
//             }
//             navigate('/blogs');
//         } catch (error) {
//             console.error('Error saving blog:', error);
//             toast.error('Failed to save blog');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-[400px]">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//                     <p className="mt-4 text-sm text-gray-600">Loading blog data...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="pb-10">
//             {/* Header */}
//             <div className="mb-8 flex items-center justify-between">
//                 <div className="flex items-center">
//                     <button
//                         onClick={() => navigate('/blogs')}
//                     >
//                         <HiChevronLeft className="w-8 h-8 text-gray-600" />
//                     </button>
//                     <h1 className="text-xl font-bold text-gray-900">
//                         {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
//                     </h1>
//                 </div>

//                 <div className="flex items-center gap-6">
//                     <div className="flex gap-3">
//                         <button
//                             type="button"
//                             onClick={() => navigate('/blogs')}
//                             className="px-6 py-2.5 rounded-md border text-sm border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
//                             disabled={isSubmitting}
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             form="blog-form"
//                             className="px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
//                             disabled={isSubmitting}
//                         >
//                             {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
//                             {isEditMode ? 'Update Article' : 'Publish Article'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
//                 {/* Left Column - Main Content */}
//                 <div className="lg:col-span-2 space-y-6">
//                     <div className="bg-white rounded-xl p-6">
//                         <form id="blog-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">
//                                     Blog Title <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     {...register('title', { required: 'Title is required' })}
//                                     placeholder="Enter a catchy title"
//                                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
//                                 />
//                                 {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">
//                                     Short Description <span className="text-red-500">*</span>
//                                 </label>
//                                 <textarea
//                                     {...register('shortDescription', { required: 'Short description is required' })}
//                                     rows={4}
//                                     placeholder="Brief summary for search results and social sharing"
//                                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white transition-all resize-none shadow-sm"
//                                 ></textarea>
//                                 {errors.shortDescription && <p className="mt-1 text-xs text-red-500">{errors.shortDescription.message}</p>}
//                             </div>

//                             {/* Content Editor */}
//                             <div className="space-y-1.5">
//                                 <label className="block text-sm font-semibold text-gray-700">
//                                     Blog Content <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="quill-container border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
//                                     <div ref={quillRef} style={{ minHeight: '400px' }} />
//                                 </div>
//                             </div>
//                         </form>
//                     </div>
//                 </div>

//                 {/* Right Column - Settings & Metadata */}
//                 <div className="space-y-6">
//                     <div className='bg-white rounded-xl p-6'>
//                         <div className="flex justify-between items-center gap-3">
//                             <p className="text-sm font-bold text-gray-700">Activate This Blog</p>
//                             <button
//                                 type="button"
//                                 onClick={() => setValue('isActive', !watch('isActive'))}
//                                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${watch('isActive') ? 'bg-primary shadow-md shadow-primary/20' : 'bg-gray-300'
//                                     }`}
//                             >
//                                 <span
//                                     className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ${watch('isActive') ? 'translate-x-6' : 'translate-x-1'
//                                         }`}
//                                 />
//                             </button>
//                         </div>
//                         <p className="text-xs font-medium text-gray-700 pt-3">Enable this blog to make it visible on the website for all users.</p>
//                     </div>
//                     {/* Cover Image */}
//                     <div className="bg-white rounded-xl p-6">
//                         <div className="flex justify-between items-center mb-4">
//                             <label className="block text-sm font-semibold text-gray-700">
//                                 Cover Image <span className="text-red-500">*</span>
//                             </label>
//                             <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
//                                 Ratio 16:9
//                             </span>
//                         </div>
//                         <div className="space-y-4">
//                             <label
//                                 htmlFor="image-upload"
//                                 className="cursor-pointer block w-full"
//                             >
//                                 <div className="aspect-video w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden relative flex items-center justify-center shadow-inner hover:border-primary transition-colors">
//                                     {previewImage ? (
//                                         <div className="relative w-full h-full">
//                                             <LoadImage
//                                                 index={0}
//                                                 className="w-full h-full object-cover"
//                                                 src={previewImage}
//                                                 alt="Cover preview"
//                                             />
//                                         </div>
//                                     ) : (
//                                         <div className="text-center p-4">
//                                             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
//                                                 <HiPlus className="w-6 h-6" />
//                                             </div>
//                                             <p className="text-xs text-gray-400 font-medium">Click to upload cover image</p>
//                                             <p className="text-[10px] text-gray-400 mt-1">JPG, PNG (Max 500KB) • Ratio: 16:9</p>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <input
//                                     id="image-upload"
//                                     type="file"
//                                     accept="image/*"
//                                     className="hidden"
//                                     {...register("image")}
//                                     onChange={handleImageChange}
//                                 />
//                             </label>

//                             {/* Hidden input for coverImageUrl to maintain form data if needed */}
//                             <input type="hidden" {...register('coverImageUrl')} />
//                         </div>
//                     </div>

//                     {/* SEO & URL */}
//                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//                         <label className="block text-sm font-semibold text-gray-700 mb-4">
//                             URL Configuration
//                         </label>
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-gray-500 mb-1.5 px-1 uppercase tracking-wider">
//                                     Unique URL ID <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     {...register('uniqueUrlId', {
//                                         required: 'URL ID is required',
//                                         pattern: {
//                                             value: /^[a-z0-9-]+$/,
//                                             message: 'Use only lowercase, numbers, and hyphens'
//                                         }
//                                     })}
//                                     placeholder="e.g., how-to-start-coding"
//                                     className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
//                                 />
//                                 {errors.uniqueUrlId && <p className="mt-1 text-xs text-red-500">{errors.uniqueUrlId.message}</p>}
//                                 <p className="mt-1.5 text-[10px] text-gray-400 px-1">
//                                     This will be used for the blog post URL: example.com/blog/<b>{watch('uniqueUrlId') || 'url-id'}</b>
//                                 </p>
//                             </div>


//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddBlog;
