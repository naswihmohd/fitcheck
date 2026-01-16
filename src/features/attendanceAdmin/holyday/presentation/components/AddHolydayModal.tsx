import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { FiX, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';
import toast from 'react-hot-toast';
import type { HolidayItem } from '../../data/holydayTypes';
import { holidayStoreToDatabase } from '../../utils/holidayStoreToDatabase';
import type { AppDispatch } from '../../../../../general/redux/store';
import { useDispatch } from 'react-redux';

interface AddHolydayModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchId: string;
    companyId: string;
    isEdit?: boolean;
    holidayData?: HolidayItem | null;
}

interface HolidayFormData {
    name: string;
    startDate: Date | null;
    endDate: Date | null;
}

// Custom Date Picker Wrapper Component
interface DatePickerWrapperProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    hasError?: boolean;
}

const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
    value,
    onChange,
    hasError = false,
}) => {
    useEffect(() => {
        // Move date picker popper to body when it appears to escape overflow containers
        const observer = new MutationObserver(() => {
            const poppers = document.querySelectorAll('.react-datepicker-popper');
            poppers.forEach((popper) => {
                if (popper.parentElement && popper.parentElement !== document.body) {
                    // Only move if parent has overflow that might clip
                    const parent = popper.parentElement;
                    const style = window.getComputedStyle(parent);
                    if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
                        document.body.appendChild(popper);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative">
            <div
                className={`
                    flex items-center gap-3 w-full rounded-lg border bg-white transition-all duration-300
                    ${hasError
                        ? 'border-red-500 bg-red-50/50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
                        : 'border-gray-300 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
                    }
                    px-4 py-2.5 text-sm
                    group
                    shadow-sm
                `}
            >
                <FiCalendar
                    className={`w-5 h-5 ${hasError ? 'text-red-500' : 'text-gray-600'} group-hover:text-primary transition-colors flex-shrink-0`}
                />
                <div className="flex-1 relative min-w-0">
                    <DatePicker
                        selected={value}
                        onChange={(date: Date | null) => onChange(date)}
                        dateFormat="MMM dd, yyyy"
                        placeholderText="Select date"
                        className="w-full border-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 cursor-pointer"
                        wrapperClassName="w-full"
                        popperClassName="!z-[9999]"
                    />
                </div>
            </div>
        </div>
    );
};

const AddHolydayModal: React.FC<AddHolydayModalProps> = ({
    isOpen,
    onClose,
    branchId,
    companyId,
    isEdit = false,
    holidayData
}) => {
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const holidayId = holidayData?.id || '';
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setError,
        trigger,
    } = useForm<HolidayFormData>({
        defaultValues: {
            name: '',
            startDate: null,
            endDate: null,
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load holiday data when in edit mode
    useEffect(() => {
        const loadHolidayData = async () => {
            if (isOpen && isEdit && holidayData) {
                setIsLoading(true);
                try {
                    const formData: HolidayFormData = {
                        name: holidayData.name || '',
                        startDate: holidayData.startDate?.toDate() || null,
                        endDate: holidayData.endDate?.toDate() || null,
                    };

                    reset(formData);
                } catch (error) {
                    console.error('Error loading holiday:', error);
                    toast.error('Failed to load holiday data');
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            } else if (!isOpen) {
                reset();
            }
        };

        loadHolidayData();
    }, [isOpen, isEdit, holidayData, reset, onClose]);

    const onFormSubmit = async (data: HolidayFormData) => {
        setIsSubmitting(true);

        try {
            // Validate form
            if (!data.name || data.name.trim().length < 2) {
                setError('name', {
                    type: 'manual',
                    message: 'Holiday name must be at least 2 characters',
                });
                toast.error('Holiday name must be at least 2 characters');
                await trigger();
                setIsSubmitting(false);
                return;
            }

            if (!data.startDate) {
                setError('startDate', {
                    type: 'manual',
                    message: 'Start date is required',
                });
                toast.error('Start date is required');
                await trigger();
                setIsSubmitting(false);
                return;
            }

            if (!data.endDate) {
                setError('endDate', {
                    type: 'manual',
                    message: 'End date is required',
                });
                toast.error('End date is required');
                await trigger();
                setIsSubmitting(false);
                return;
            }

            // Validate that end date is not before start date
            if (data.endDate < data.startDate) {
                setError('endDate', {
                    type: 'manual',
                    message: 'End date cannot be before start date',
                });
                toast.error('End date cannot be before start date');
                await trigger();
                setIsSubmitting(false);
                return;
            }

            // Save to Firebase
            await holidayStoreToDatabase(
                branchId,
                companyId,
                data,
                isEdit ? holidayId : undefined,
                dispatch
            );

            toast.success(isEdit ? 'Holiday updated successfully!' : 'Holiday created successfully!');
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form. Please try again.';
            setError('root', {
                type: 'manual',
                message: errorMessage,
            });
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        className="relative z-40 w-full max-w-2xl bg-white rounded-[14px] shadow-xl max-h-[90vh] flex flex-col overflow-visible"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-1.5 rounded-t-[14px] border-b border-gray-200 bg-primary">
                            <h2 className="text-base font-semibold text-white">
                                {isEdit ? 'Edit Holiday' : 'Add New Holiday'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-white hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Content - Scrollable */}
                        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                                        <p className="text-sm text-gray-600">Loading holiday data...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {/* Holiday Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Holiday Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('name', {
                                                required: 'Holiday name is required',
                                                minLength: {
                                                    value: 2,
                                                    message: 'Holiday name must be at least 2 characters',
                                                },
                                            })}
                                            type="text"
                                            placeholder="e.g., New Year's Day, Christmas"
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${errors.name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                }`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Root Error Message */}
                                    {errors.root && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{errors.root.message}</p>
                                        </div>
                                    )}

                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="startDate"
                                            control={control}
                                            rules={{
                                                required: 'Start date is required',
                                            }}
                                            render={({ field }) => (
                                                <>
                                                    <DatePickerWrapper
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        hasError={!!errors.startDate}
                                                    />
                                                    {errors.startDate && (
                                                        <p className="mt-1 text-xs text-red-600">
                                                            {errors.startDate.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="endDate"
                                            control={control}
                                            rules={{
                                                required: 'End date is required',
                                                validate: (value, formValues) => {
                                                    if (formValues.startDate && value && value < formValues.startDate) {
                                                        return 'End date cannot be before start date';
                                                    }
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => (
                                                <>
                                                    <DatePickerWrapper
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        hasError={!!errors.endDate}
                                                    />
                                                    {errors.endDate && (
                                                        <p className="mt-1 text-xs text-red-600">
                                                            {errors.endDate.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            For single-day holidays, select the same date for both start and end date
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-3 rounded-b-[14px] px-6 py-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                    className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${isSubmitting || isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary/90'
                                        }`}
                                >
                                    {isSubmitting
                                        ? (isEdit ? 'Updating...' : 'Creating...')
                                        : (isEdit ? 'Update Holiday' : 'Create Holiday')
                                    }
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

export default AddHolydayModal;
