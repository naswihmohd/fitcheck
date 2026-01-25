import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { addDoc, doc, setDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { UnitProps } from '../../data/unitTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addUnit, updateUnit } from '../../redux/unitSlice';

interface AddUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    unitData?: UnitProps | null; // For edit mode
}

interface UnitFormData {
    name: string;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose, unitData }) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!unitData;
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UnitFormData>({
        defaultValues: {
            name: '',
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && unitData) {
            // Populate form with existing unit data for edit mode
            reset({
                name: unitData.name,
            });
        } else if (isOpen && !unitData) {
            // Reset form for add mode
            reset({
                name: '',
            });
        }
    }, [isOpen, unitData, reset]);

    const onSubmit = async (data: UnitFormData) => {
        try {
            setIsSubmitting(true);

            const unitsCollectionRef = collection(db, 'units');

            // Build keywords from unit name only
            const keywords = keywordsBuilder(data.name.trim());

            if (isEditMode && unitData) {
                // Update existing unit
                const unitDocRef = doc(unitsCollectionRef, unitData.id);
                
                const updatedUnitData = {
                    id: unitData.id,
                    name: data.name.trim(), // Keep original case, no lowercase conversion
                    keywords: keywords,
                    createdAt: unitData.createdAt, // Preserve original creation date
                };
                
                await setDoc(unitDocRef, updatedUnitData, { merge: true });

                // Update Redux store
                dispatch(updateUnit({ unit: updatedUnitData as UnitProps }));

                toast.success('Unit updated successfully!');
            } else {
                // Create new unit with Firebase auto-generated ID
                const createdAt = Timestamp.now(); // Use current timestamp for Redux
                
                // Save to Firestore with serverTimestamp (will be replaced by Firestore)
                const docRef = await addDoc(unitsCollectionRef, {
                    name: data.name.trim(), // Keep original case, no lowercase conversion
                    keywords: keywords,
                    createdAt: serverTimestamp(),
                });

                // Get the auto-generated ID
                const newUnitData = {
                    id: docRef.id,
                    name: data.name.trim(),
                    keywords: keywords,
                    createdAt: createdAt,
                };

                // Update Redux store with current timestamp
                dispatch(addUnit({ unit: newUnitData as UnitProps }));

                toast.success('Unit added successfully!');
            }
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving unit:', error);
            toast.error('Failed to save unit. Please try again.');
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
                                {isEditMode ? 'Edit Unit' : 'Add New Unit'}
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
                            {/* Unit Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: 'Unit name is required',
                                        minLength: {
                                            value: 1,
                                            message: 'Unit name must be at least 1 character',
                                        },
                                    })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                    placeholder="e.g., S, M, L, XL, 50ml, 100g"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                              {/* Unit Explanation */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">What is a Unit?</h3>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                A unit represents the measurement or size specification for products. Units can be:
                            </p>
                            <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
                                <li><strong>Size units:</strong> Small (S), Medium (M), Large (L), Extra Large (XL), etc.</li>
                                <li><strong>Volume units:</strong> 50ml, 100ml, 250ml, 500ml, 1L, etc.</li>
                                <li><strong>Weight units:</strong> 100g, 250g, 500g, 1kg, etc.</li>
                                <li><strong>Count units:</strong> 1 piece, 2 pieces, 10 pieces, etc.</li>
                            </ul>
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
                                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Unit' : 'Add Unit'}
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

export default AddUnitModal;
