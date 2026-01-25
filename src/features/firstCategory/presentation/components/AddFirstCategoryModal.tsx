import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { addDoc, doc, setDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { FirstCategoryProps } from '../../data/firstCategoryTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addFirstCategory, updateFirstCategory } from '../../redux/firstCategorySlice';

interface AddFirstCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    firstCategoryData?: FirstCategoryProps | null; // For edit mode
}

interface FirstCategoryFormData {
    categoryName: string;
    imageUrl: string | null;
}

const AddFirstCategoryModal: React.FC<AddFirstCategoryModalProps> = ({ isOpen, onClose, firstCategoryData }) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!firstCategoryData;
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<FirstCategoryFormData>({
        defaultValues: {
            categoryName: '',
            imageUrl: null,
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && firstCategoryData) {
            // Populate form with existing firstCategory data for edit mode
            reset({
                categoryName: firstCategoryData.categoryName,
                imageUrl: firstCategoryData.imageUrl,
            });
        } else if (isOpen && !firstCategoryData) {
            // Reset form for add mode
            reset({
                categoryName: '',
                imageUrl: null,
            });
        }
    }, [isOpen, firstCategoryData, reset]);

    const onSubmit = async (data: FirstCategoryFormData) => {
        try {
            setIsSubmitting(true);

            const firstCategoriesCollectionRef = collection(db, 'firstCategories');

            // Build keywords from category name only
            const keywords = keywordsBuilder(data.categoryName);

            // Handle imageUrl - set to null if empty
            const imageUrl = data.imageUrl?.trim() || null;

            if (isEditMode && firstCategoryData) {
                // Update existing firstCategory
                const firstCategoryDocRef = doc(firstCategoriesCollectionRef, firstCategoryData.id);
                const updatedAt = Timestamp.now();
                const updatedFirstCategoryData = {
                    id: firstCategoryData.id,
                    categoryName: data.categoryName.trim(),
                    imageUrl: imageUrl,
                    keywords: keywords,
                    createdAt: firstCategoryData.createdAt, // Preserve original creation date
                    updatedAt: updatedAt,
                    positionAt: firstCategoryData.positionAt, // Preserve original position
                };
                
                await setDoc(firstCategoryDocRef, {
                    ...updatedFirstCategoryData,
                    updatedAt: serverTimestamp(), // Use serverTimestamp for Firestore
                }, { merge: true });

                // Update Redux store
                dispatch(updateFirstCategory({ firstCategory: updatedFirstCategoryData as FirstCategoryProps }));

                toast.success('Category updated successfully!');
            } else {
                // Create new firstCategory with Firebase auto-generated ID
                const createdAt = Timestamp.now(); // Use current timestamp for Redux
                const updatedAt = Timestamp.now();
                const positionAt = Timestamp.now();
                
                // Save to Firestore with serverTimestamp (will be replaced by Firestore)
                const docRef = await addDoc(firstCategoriesCollectionRef, {
                    categoryName: data.categoryName.trim(),
                    imageUrl: imageUrl,
                    keywords: keywords,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    positionAt: serverTimestamp(),
                });

                // Get the auto-generated ID
                const newFirstCategoryData = {
                    id: docRef.id,
                    categoryName: data.categoryName.trim(),
                    imageUrl: imageUrl,
                    keywords: keywords,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                    positionAt: positionAt,
                };

                // Update Redux store with current timestamp
                dispatch(addFirstCategory({ firstCategory: newFirstCategoryData as FirstCategoryProps }));

                toast.success('Category added successfully!');
            }
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Background Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="z-40 w-full m-2 bg-white lg:m-0 max-w-[500px] flex flex-col min-h-[400px] max-h-[90vh] rounded-[14px] p-5 overflow-y-auto"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {isEditMode ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <HiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
                            {/* Category Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('categoryName', {
                                        required: 'Category name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Category name must be at least 2 characters',
                                        },
                                    })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                    placeholder="Enter category name"
                                />
                                {errors.categoryName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.categoryName.message}</p>
                                )}
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL <span className="text-gray-400 text-xs">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('imageUrl', {
                                        required: false,
                                        validate: (value) => {
                                            if (!value || value.trim() === '') {
                                                return true; // Empty is allowed
                                            }
                                            return /^https?:\/\/.+/.test(value) || 'Please enter a valid URL';
                                        },
                                    })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                    placeholder="https://example.com/image.jpg (optional)"
                                />
                                {errors.imageUrl && (
                                    <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>
                                )}
                                {watch('imageUrl') && watch('imageUrl')?.trim() && (
                                    <div className="mt-2">
                                        <img
                                            src={watch('imageUrl')?.trim() || ''}
                                            alt="Category preview"
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end mt-auto pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Category' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AddFirstCategoryModal;
