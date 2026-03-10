import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { addDoc, doc, setDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../../../firebaseConfig';
import type { BrandProps } from '../../data/brandTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addBrand, updateBrand } from '../../redux/brandSlice';
import imageCompression from 'browser-image-compression';
import LoadImage from '../../../../general/components/LoadImage';
import FormLoading from '../../../../general/components/FormLoading';
import { checkDuplicateBrandName } from '../../utils/checkDuplicateBrandName';

interface AddBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandData?: BrandProps | null; // For edit mode
}

interface BrandFormData {
    brandName: string;
    image?: FileList;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({ isOpen, onClose, brandData }) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(brandData?.imageUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const isEditMode = !!brandData;
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<BrandFormData>({
        defaultValues: {
            brandName: '',
            image: undefined,
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setPreviewImage(null);
            setSelectedFile(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && brandData) {
            reset({
                brandName: brandData.brandName,
                image: undefined,
            });
            setPreviewImage(brandData.imageUrl || null);
        } else if (isOpen && !brandData) {
            reset({
                brandName: '',
                image: undefined,
            });
            setPreviewImage(null);
            setSelectedFile(null);
        }
    }, [isOpen, brandData, reset]);

    const MAX_IMAGE_SIZE_KB = 30;

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > MAX_IMAGE_SIZE_KB) {
            try {
                const options = {
                    maxSizeMB: MAX_IMAGE_SIZE_KB / 1024, // 30KB
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                const compressedSizeKB = compressedFile.size / 1024;
                if (compressedSizeKB > MAX_IMAGE_SIZE_KB) {
                    toast.error(`Unable to compress image below ${MAX_IMAGE_SIZE_KB}KB.`);
                    return;
                }
                setSelectedFile(compressedFile);
                setPreviewImage(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error('Image compression error:', error);
                toast.error('Failed to compress image.');
            }
        } else {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
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

            let imageUrl: string | null = brandData?.imageUrl || null;

            if (isEditMode && brandData) {
                // Upload image if selected (path = brandId so it replaces on edit)
                if (selectedFile) {
                    const storageRef = ref(storage, `brands/${brandData.id}`);
                    await uploadBytes(storageRef, selectedFile);
                    imageUrl = await getDownloadURL(storageRef);
                }

                const brandDocRef = doc(brandsCollectionRef, brandData.id);
                const updatedBrandData = {
                    id: brandData.id,
                    brandName: trimmedBrandName,
                    imageUrl,
                    keywords,
                    createdAt: brandData.createdAt,
                };

                await setDoc(brandDocRef, updatedBrandData, { merge: true });
                dispatch(updateBrand({ brand: updatedBrandData as BrandProps }));
                toast.success('Brand updated successfully!');
            } else {
                // Create: addDoc first to get id, then upload image with that id as path
                const createdAt = Timestamp.now();
                const docRef = await addDoc(brandsCollectionRef, {
                    brandName: trimmedBrandName,
                    imageUrl: null,
                    keywords,
                    createdAt: serverTimestamp(),
                });

                if (selectedFile) {
                    const storageRef = ref(storage, `brands/${docRef.id}`);
                    await uploadBytes(storageRef, selectedFile);
                    imageUrl = await getDownloadURL(storageRef);
                }

                await setDoc(docRef, { id: docRef.id, imageUrl }, { merge: true });

                const newBrandData = {
                    id: docRef.id,
                    brandName: trimmedBrandName,
                    imageUrl,
                    keywords,
                    createdAt,
                };
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
                        className="z-40 w-full m-2 bg-white lg:m-0 max-w-[500px] flex flex-col min-h-[400px] max-h-[90vh] rounded-[14px] overflow-y-auto"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex bg-secondary rounded-tl-[14px] items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-lg font-semibold text-white">
                                {isEditMode ? 'Edit Brand' : 'Add New Brand'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100  rounded-full transition-colors"
                            >
                                <HiX className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex p-5 flex-col gap-5 flex-1">
                           

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image <span className="text-gray-400 text-xs">(optional, JPG, PNG, max 30KB, recommended 1:1)</span>
                                </label>
                                <label htmlFor="brand-image-upload" className="cursor-pointer block w-full">
                                    <div className="w-full max-w-[200px] overflow-hidden border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-primary transition-colors">
                                        {previewImage ? (
                                            <div className="relative overflow-hidden w-full h-20 flex items-center justify-center">
                                                <LoadImage
                                                    index={0}
                                                    className="object-cover max-h-20 rounded-md"
                                                    src={previewImage}
                                                    alt="Brand preview"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Click to upload image</p>
                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 30KB)</p>
                                                <p className="text-xs text-gray-400">Recommended: 1:1</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="brand-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        {...register('image')}
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

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
                    {isSubmitting && <FormLoading />}
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AddBrandModal;
