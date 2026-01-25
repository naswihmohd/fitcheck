import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { addDoc, doc, setDoc, collection, serverTimestamp, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { BrandProps } from '../../data/brandTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addBrand, updateBrand } from '../../redux/brandSlice';

interface AddBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandData?: BrandProps | null; // For edit mode
}

interface BrandFormData {
    brandName: string;
    imageUrl: string | null;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({ isOpen, onClose, brandData }) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!brandData;
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<BrandFormData>({
        defaultValues: {
            brandName: '',
            imageUrl: null,
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && brandData) {
            // Populate form with existing brand data for edit mode
            reset({
                brandName: brandData.brandName,
                imageUrl: brandData.imageUrl,
            });
        } else if (isOpen && !brandData) {
            // Reset form for add mode
            reset({
                brandName: '',
                imageUrl: null,
            });
        }
    }, [isOpen, brandData, reset]);

    const checkDuplicateBrandName = async (brandName: string, excludeId?: string): Promise<boolean> => {
        const brandsCollectionRef = collection(db, 'brands');
        const trimmedName = brandName.trim();
        
        // Query for brands with the same name (case-insensitive check)
        const brandsQuery = query(
            brandsCollectionRef,
            where('brandName', '==', trimmedName)
        );
        
        const querySnapshot = await getDocs(brandsQuery);
        
        // If editing, exclude the current document
        if (excludeId) {
            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        }
        
        // If creating, check if any document exists
        return !querySnapshot.empty;
    };

    const onSubmit = async (data: BrandFormData) => {
        try {
            setIsSubmitting(true);

            const brandsCollectionRef = collection(db, 'brands');
            const trimmedBrandName = data.brandName.trim();

            // Check for duplicate brandName
            const excludeId = isEditMode && brandData ? brandData.id : undefined;
            const hasDuplicate = await checkDuplicateBrandName(trimmedBrandName, excludeId);
            
            if (hasDuplicate) {
                toast.error('A brand with this name already exists. Please use a different name.');
                setIsSubmitting(false);
                return;
            }

            // Build keywords from brand name only
            const keywords = keywordsBuilder(data.brandName);

            // Handle imageUrl - set to null if empty
            const imageUrl = data.imageUrl?.trim() || null;

            if (isEditMode && brandData) {
                // Update existing brand
                const brandDocRef = doc(brandsCollectionRef, brandData.id);
                
                const updatedBrandData = {
                    id: brandData.id,
                    brandName: trimmedBrandName,
                    imageUrl: imageUrl,
                    keywords: keywords,
                    createdAt: brandData.createdAt, // Preserve original creation date
                };
                
                await setDoc(brandDocRef, updatedBrandData, { merge: true });

                // Update Redux store
                dispatch(updateBrand({ brand: updatedBrandData as BrandProps }));

                toast.success('Brand updated successfully!');
            } else {
                // Create new brand with Firebase auto-generated ID
                const createdAt = Timestamp.now(); // Use current timestamp for Redux
                
                // Save to Firestore with serverTimestamp (will be replaced by Firestore)
                const docRef = await addDoc(brandsCollectionRef, {
                    brandName: trimmedBrandName,
                    imageUrl: imageUrl,
                    keywords: keywords,
                    createdAt: serverTimestamp(),
                });

                // Update the document to include the id field
                await setDoc(docRef, { id: docRef.id }, { merge: true });

                const newBrandData = {
                    id: docRef.id,
                    brandName: trimmedBrandName,
                    imageUrl: imageUrl,
                    keywords: keywords,
                    createdAt: createdAt,
                };

                // Update Redux store with current timestamp
                dispatch(addBrand({ brand: newBrandData as BrandProps }));

                toast.success('Brand added successfully!');
            }
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error('Failed to save brand. Please try again.');
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
                                {isEditMode ? 'Edit Brand' : 'Add New Brand'}
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
                            {/* Brand Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('brandName', {
                                        required: 'Brand name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Brand name must be at least 2 characters',
                                        },
                                    })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                    placeholder="Enter brand name"
                                />
                                {errors.brandName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.brandName.message}</p>
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
                                            alt="Brand preview"
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
                                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Brand' : 'Add Brand'}
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

export default AddBrandModal;
