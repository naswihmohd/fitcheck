import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';

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

const TermsAndConditionsForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
    } = useForm<TermsFormData>({
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'sections',
    });

    const selectedType = watch('type');

    const onSubmit = async (data: TermsFormData) => {
        try {
            setLoading(true);
            // TODO: Implement save logic (Firebase/Firestore)
            console.log('Form data:', data);
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

    return (
        <>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                            {/* Add Another Button - Positioned to the right */}
                            <div className="flex justify-end">
                                {index === fields.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={handleAddAnother}
                                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap self-end"
                                    >
                                        Add Another
                                    </button>
                                )}
                            </div>
                        </div>

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
                    </div>
                ))}

                {/* Update & Save Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-6 py-3 text-white rounded-md transition-colors font-medium text-sm ${loading
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

export default TermsAndConditionsForm;

