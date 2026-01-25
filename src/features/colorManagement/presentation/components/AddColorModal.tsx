import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { addDoc, doc, setDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { ColorProps } from '../../data/colorTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addColor, updateColor } from '../../redux/colorSlice';

interface AddColorModalProps {
    isOpen: boolean;
    onClose: () => void;
    colorData?: ColorProps | null; // For edit mode
}

interface ColorFormData {
    name: string;
    hexCode: string;
}

const AddColorModal: React.FC<AddColorModalProps> = ({ isOpen, onClose, colorData }) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!colorData;
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<ColorFormData>({
        defaultValues: {
            name: '',
            hexCode: '#000000',
        },
        mode: 'onTouched',
    });

    const hexCodeValue = watch('hexCode');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && colorData) {
            // Populate form with existing color data for edit mode
            reset({
                name: colorData.name,
                hexCode: colorData.hexCode,
            });
        } else if (isOpen && !colorData) {
            // Reset form for add mode
            reset({
                name: '',
                hexCode: '#000000',
            });
        }
    }, [isOpen, colorData, reset]);

    const onSubmit = async (data: ColorFormData) => {
        try {
            setIsSubmitting(true);

            const colorsCollectionRef = collection(db, 'colors');

            // Build keywords from color name only
            const keywords = keywordsBuilder(data.name.trim());

            if (isEditMode && colorData) {
                // Update existing color
                const colorDocRef = doc(colorsCollectionRef, colorData.id);
                
                const updatedColorData = {
                    id: colorData.id,
                    name: data.name.trim(), // Keep original case, no lowercase conversion
                    hexCode: data.hexCode.trim(),
                    keywords: keywords,
                    createdAt: colorData.createdAt, // Preserve original creation date
                };
                
                await setDoc(colorDocRef, updatedColorData, { merge: true });

                // Update Redux store
                dispatch(updateColor({ color: updatedColorData as ColorProps }));

                toast.success('Color updated successfully!');
            } else {
                // Create new color with Firebase auto-generated ID
                const createdAt = Timestamp.now(); // Use current timestamp for Redux
                
                // Save to Firestore with serverTimestamp (will be replaced by Firestore)
                const docRef = await addDoc(colorsCollectionRef, {
                    name: data.name.trim(), // Keep original case, no lowercase conversion
                    hexCode: data.hexCode.trim(),
                    keywords: keywords,
                    createdAt: serverTimestamp(),
                });

                // Get the auto-generated ID
                const newColorData = {
                    id: docRef.id,
                    name: data.name.trim(),
                    hexCode: data.hexCode.trim(),
                    keywords: keywords,
                    createdAt: createdAt,
                };

                // Update Redux store with current timestamp
                dispatch(addColor({ color: newColorData as ColorProps }));

                toast.success('Color added successfully!');
            }
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving color:', error);
            toast.error('Failed to save color. Please try again.');
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
                                {isEditMode ? 'Edit Color' : 'Add New Color'}
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
                            {/* Color Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: 'Color name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Color name must be at least 2 characters',
                                        },
                                    })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                    placeholder="Enter color name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Hex Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hex Code <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={hexCodeValue || '#000000'}
                                        onChange={(e) => setValue('hexCode', e.target.value)}
                                        className="w-20 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        {...register('hexCode', {
                                            required: 'Hex code is required',
                                            pattern: {
                                                value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                                                message: 'Please enter a valid hex code (e.g., #FF5733)',
                                            },
                                        })}
                                        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                        placeholder="#FF5733"
                                    />
                                </div>
                                {errors.hexCode && (
                                    <p className="mt-1 text-xs text-red-500">{errors.hexCode.message}</p>
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
                                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Color' : 'Add Color'}
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

export default AddColorModal;
