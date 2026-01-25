import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { addDoc, doc, setDoc, collection, serverTimestamp, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { KeywordProps } from '../../data/keywordTypes';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import { addKeyword, updateKeyword } from '../../redux/keywordSlice';

interface AddKeywordModalProps {
    isOpen: boolean;
    onClose: () => void;
    keywordData?: KeywordProps | null; // For edit mode
}

interface KeywordFormData {
    keywordName: string;
}

const AddKeywordModal: React.FC<AddKeywordModalProps> = ({ isOpen, onClose, keywordData }) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!keywordData;
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<KeywordFormData>({
        defaultValues: {
            keywordName: '',
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && keywordData) {
            // Populate form with existing keyword data for edit mode
            reset({
                keywordName: keywordData.keywordName,
            });
        } else if (isOpen && !keywordData) {
            // Reset form for add mode
            reset({
                keywordName: '',
            });
        }
    }, [isOpen, keywordData, reset]);

    const checkDuplicateKeywordName = async (keywordName: string, excludeId?: string): Promise<boolean> => {
        const keywordsCollectionRef = collection(db, 'keywords');
        const trimmedName = keywordName.trim();
        
        // Query for keywords with the same name (case-insensitive check)
        const keywordsQuery = query(
            keywordsCollectionRef,
            where('keywordName', '==', trimmedName)
        );
        
        const querySnapshot = await getDocs(keywordsQuery);
        
        // If editing, exclude the current document
        if (excludeId) {
            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        }
        
        // If creating, check if any document exists
        return !querySnapshot.empty;
    };

    const onSubmit = async (data: KeywordFormData) => {
        try {
            setIsSubmitting(true);

            const keywordsCollectionRef = collection(db, 'keywords');
            const trimmedKeywordName = data.keywordName.trim();

            // Check for duplicate keywordName
            const excludeId = isEditMode && keywordData ? keywordData.id : undefined;
            const hasDuplicate = await checkDuplicateKeywordName(trimmedKeywordName, excludeId);
            
            if (hasDuplicate) {
                toast.error('A keyword with this name already exists. Please use a different name.');
                setIsSubmitting(false);
                return;
            }

            // Build keywords from keyword name only
            const keywords = keywordsBuilder(trimmedKeywordName);

            if (isEditMode && keywordData) {
                // Update existing keyword
                const keywordDocRef = doc(keywordsCollectionRef, keywordData.id);
                
                const updatedKeywordData = {
                    id: keywordData.id,
                    keywordName: trimmedKeywordName,
                    keywords: keywords,
                    createdAt: keywordData.createdAt, // Preserve original creation date
                };
                
                await setDoc(keywordDocRef, updatedKeywordData, { merge: true });

                // Update Redux store
                dispatch(updateKeyword({ keyword: updatedKeywordData as KeywordProps }));

                toast.success('Keyword updated successfully!');
            } else {
                // Create new keyword with Firebase auto-generated ID
                const createdAt = Timestamp.now(); // Use current timestamp for Redux
                
                // Save to Firestore with serverTimestamp (will be replaced by Firestore)
                const docRef = await addDoc(keywordsCollectionRef, {
                    keywordName: trimmedKeywordName,
                    keywords: keywords,
                    createdAt: serverTimestamp(),
                });

                // Update the document to include the id field
                await setDoc(docRef, { id: docRef.id }, { merge: true });

                const newKeywordData = {
                    id: docRef.id,
                    keywordName: trimmedKeywordName,
                    keywords: keywords,
                    createdAt: createdAt,
                };

                // Update Redux store with current timestamp
                dispatch(addKeyword({ keyword: newKeywordData as KeywordProps }));

                toast.success('Keyword added successfully!');
            }
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving keyword:', error);
            toast.error('Failed to save keyword. Please try again.');
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
                                {isEditMode ? 'Edit Keyword' : 'Add New Keyword'}
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
                            {/* Keyword Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Keyword Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('keywordName', {
                                        required: 'Keyword name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Keyword name must be at least 2 characters',
                                        },
                                    })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                    placeholder="Enter keyword name"
                                />
                                {errors.keywordName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.keywordName.message}</p>
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
                                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Keyword' : 'Add Keyword'}
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

export default AddKeywordModal;
