import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { auth, db } from '../../../../../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface TermsFormData {
    type: 'terms' | 'privacy';
    sections: {
        header: string;
        description: string;
    }[];
}

const defaultValues: TermsFormData = {
    type: 'privacy',
    sections: [
        {
            header: '',
            description: '',
        },
    ],
};

const PrivacyAndPolicyForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [originalData, setOriginalData] = useState<TermsFormData | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        reset,
    } = useForm<TermsFormData>({
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'sections',
    });

    const selectedType = watch('type');
    const formValues = watch();

    // Fetch existing privacy and policy data on component mount
    useEffect(() => {
        const fetchPrivacyAndPolicy = async () => {
            try {
                setFetching(true);
                const docRef = doc(db, "general", "privacyAndPolicy");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const privacyAndPolicy = data.PrivacyAndPolicy;

                    if (privacyAndPolicy && Array.isArray(privacyAndPolicy) && privacyAndPolicy.length > 0) {
                        const formData = {
                            type: 'privacy' as const,
                            sections: privacyAndPolicy,
                        };
                        // Store original data for comparison
                        setOriginalData(formData);
                        // Reset form with existing data
                        reset(formData);
                    } else {
                        // If no data exists, set original data to default
                        setOriginalData(defaultValues);
                    }
                } else {
                    // If document doesn't exist, set original data to default
                    setOriginalData(defaultValues);
                }
            } catch (error: any) {
                console.error('Error fetching privacy and policy:', error);
                toast.error('Failed to load existing data');
            } finally {
                setFetching(false);
            }
        };

        fetchPrivacyAndPolicy();
    }, [reset]);

    // Check if form has changes compared to original data
    const hasChanges = useMemo(() => {
        if (!originalData) return false;

        // Compare sections array
        if (formValues.sections.length !== originalData.sections.length) {
            return true;
        }

        // Compare each section
        return formValues.sections.some((section, index) => {
            const originalSection = originalData.sections[index];
            if (!originalSection) return true;
            return (
                section.header.trim() !== originalSection.header.trim() ||
                section.description.trim() !== originalSection.description.trim()
            );
        });
    }, [formValues, originalData]);

    const onSubmit = async (data: TermsFormData) => {
        try {
            setLoading(true);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error("User not authenticated");
            }

            // Get reference to the general/privacyAndPolicy document
            const docRef = doc(db, "general", "privacyAndPolicy");

            // Save to Firebase
            await setDoc(docRef, {
                PrivacyAndPolicy: data.sections,
                updatedAt: serverTimestamp(),
                isActive: true,
                id: "privacyAndPolicy",
            }, { merge: true });

            // Update original data after successful save
            setOriginalData({
                type: data.type,
                sections: data.sections,
            });

            toast.success(`${selectedType === 'terms' ? 'Terms & Conditions' : 'Privacy & Policy'} updated successfully!`);
        } catch (error: any) {
            console.error('Error saving:', error);
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnother = () => {
        append({ header: '', description: '' });
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-sm text-gray-600">Loading privacy and policy data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                        {/* Header Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Header
                            </label>
                            <input
                                type="text"
                                {...register(`sections.${index}.header`, {
                                    required: 'Header is required',
                                })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                placeholder="Enter header"
                            />
                            {errors.sections?.[index]?.header && (
                                <p className="text-sm text-red-600">
                                    {errors.sections[index]?.header?.message}
                                </p>
                            )}
                        </div>

                        {/* Description Textarea */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <div className="flex gap-3 items-start">
                                <textarea
                                    {...register(`sections.${index}.description`, {
                                        required: 'Description is required',
                                    })}
                                    rows={6}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all resize-none"
                                    placeholder="Enter description"
                                />
                            </div>
                            {errors.sections?.[index]?.description && (
                                <p className="text-sm text-red-600">
                                    {errors.sections[index]?.description?.message}
                                </p>
                            )}

                            {/* Remove Button - Show if more than one section */}
                            {fields.length > 1 && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {/* Add Another Button - Positioned to the right */}
                            <div className="flex justify-end">
                                {index === fields.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={handleAddAnother}
                                        className="px-4 py-2 bg-[#50B1FF] text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap self-end"
                                    >
                                        Add Another
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Update & Save Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !hasChanges}
                        className={`w-full px-6 py-3 text-white rounded-md transition-colors font-medium text-sm ${loading || !hasChanges
                            ? 'opacity-50 cursor-not-allowed bg-gray-800'
                            : 'cursor-pointer bg-primary hover:bg-primary/90'
                            }`}
                    >
                        {loading ? 'Saving...' : 'Update & Save'}
                    </button>
                </div>
            </form>
        </>
    );
};

export default PrivacyAndPolicyForm;

