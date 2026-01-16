import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { FiX, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import toast from 'react-hot-toast';
import { validateShiftForm } from '../../utils/formValidation';
import type { Shift, ShiftFormData } from '../../data/shiftTypes';
import { shiftStoreToDatabase } from '../../utils/shiftStoreToDatabase';
import type { AppDispatch } from '../../../../../general/redux/store';
import { useDispatch } from 'react-redux';

interface AddShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchId: string;
    companyId: string;
    isEdit?: boolean;
    shiftData?: Shift | null;
}

const dayOptions = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' },
];

const weekOptions = [
    { value: 1, label: '1st Week' },
    { value: 2, label: '2nd Week' },
    { value: 3, label: '3rd Week' },
    { value: 4, label: '4th Week' },
];

// Utility function to normalize date to year 2000 (keeping time unique)
const normalizeDateToYear2000 = (date: Date | null): Date | null => {
    if (!date) return null;
    const normalized = new Date(date);
    normalized.setFullYear(2000, 0, 1); // Set to January 1, 2000
    return normalized;
};

// Custom Time Picker Wrapper Component
interface TimePickerWrapperProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    hasError?: boolean;
    size?: 'default' | 'small';
}

const TimePickerWrapper: React.FC<TimePickerWrapperProps> = ({
    value,
    onChange,
    hasError = false,
    size = 'default',
}) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const sizeClasses = size === 'small' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
    const iconSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';

    const handleChange = (newValue: Date | null) => {
        // Normalize date to year 2000 to keep it unique
        const normalized = normalizeDateToYear2000(newValue);
        onChange(normalized);
    };

    // Normalize the value for display
    const normalizedValue = normalizeDateToYear2000(value);

    const handleClockIconClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Find and click the clock button inside the DateTimePicker
        const clockButton = wrapperRef.current?.querySelector('.react-datetime-picker__button') as HTMLElement;
        if (clockButton) {
            clockButton.click();
        }
    };

    return (
        <div className="relative">
            <div
                ref={wrapperRef}
                className={`
                    flex items-center gap-3 w-full rounded-lg border bg-white transition-all duration-300
                    ${hasError
                        ? 'border-red-500 bg-red-50/50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
                        : 'border-gray-300 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
                    }
                    ${sizeClasses}
                    group
                    shadow-sm
                `}
            >
                <FiClock
                    className={`${iconSize} ${hasError ? 'text-red-500' : 'text-gray-600'} group-hover:text-primary transition-colors flex-shrink-0 cursor-pointer`}
                    onClick={handleClockIconClick}
                />
                <div className="flex-1 relative min-w-0 overflow-hidden">
                    <DateTimePicker
                        value={normalizedValue}
                        onChange={handleChange}
                        format="h:mm a"
                        disableCalendar={true}
                        clearIcon={null}
                        className="custom-time-picker"
                    />
                </div>
            </div>
        </div>
    );
};

const AddShiftModal: React.FC<AddShiftModalProps> = ({
    isOpen,
    onClose,
    branchId,
    companyId,
    isEdit = false,
    shiftData
}) => {
    const [mounted, setMounted] = useState(false);
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const shiftId = shiftData?.id || '';
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        setError,
        trigger,
        setValue,
    } = useForm<ShiftFormData>({
        defaultValues: {
            shiftName: '',
            latePunchInTime: 15,
            shiftDays: {
                mon: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
                tue: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
                wed: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
                thu: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
                fri: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
                sat: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
                sun: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    isOccasional: false,
                    occasionalDays: [],
                    breakTimes: [],
                    isFixedBreakTime: false,
                    breakTimeMinutes: 0,
                },
            },
        },
        mode: 'onTouched',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load shift data when in edit mode
    useEffect(() => {
        const loadShiftData = async () => {
            if (isOpen && isEdit && shiftData) {
                setIsLoading(true);
                try {
                    // Convert shift data to form format
                    const formData: ShiftFormData = {
                        shiftName: shiftData.shiftName || '',
                        latePunchInTime: shiftData.latePunchInTime || 15,
                        shiftDays: {
                            mon: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                            tue: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                            wed: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                            thu: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                            fri: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                            sat: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                            sun: {
                                enabled: false,
                                startTime: null,
                                endTime: null,
                                isOccasional: false,
                                occasionalDays: [],
                                breakTimes: [],
                                isFixedBreakTime: false,
                                breakTimeMinutes: 0,
                            },
                        },
                    };

                    // Populate shift days data
                    Object.entries(shiftData.shiftDays || {}).forEach(([dayKey, dayData]) => {
                        if (formData.shiftDays[dayKey]) {
                            formData.shiftDays[dayKey] = {
                                enabled: dayData.enabled || false,
                                startTime: dayData.startTime?.toDate() || null,
                                endTime: dayData.endTime?.toDate() || null,
                                isOccasional: dayData.isOccasional || false,
                                occasionalDays: dayData.occasionalDays || [],
                                breakTimes: dayData.breakTimes
                                    ? dayData.breakTimes.map((bt) => ({
                                        startTime: bt.startTime?.toDate() || null,
                                        endTime: bt.endTime?.toDate() || null,
                                    }))
                                    : [],
                                isFixedBreakTime: dayData.isFixedBreakTime || false,
                                breakTimeMinutes: dayData.breakTimeMinutes || 0,
                            };

                            // Auto-expand enabled days
                            if (dayData.enabled) {
                                setExpandedDays((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.add(dayKey);
                                    return newSet;
                                });
                            }
                        }
                    });

                    reset(formData);
                } catch (error) {
                    console.error('Error loading shift:', error);
                    toast.error('Failed to load shift data');
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            } else if (!isOpen) {
                reset();
                setExpandedDays(new Set());
            }
        };

        loadShiftData();
    }, [isOpen, isEdit, shiftData, reset, onClose]);

    const toggleDayExpansion = (dayKey: string) => {
        setExpandedDays((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(dayKey)) {
                newSet.delete(dayKey);
            } else {
                newSet.add(dayKey);
            }
            return newSet;
        });
    };

    const onFormSubmit = async (data: ShiftFormData) => {
        setIsSubmitting(true);

        try {
            // Validate form using the validation function
            const validationResult = validateShiftForm(data);

            if (!validationResult.success) {
                // Show toast with error messages
                if (validationResult.errors.length === 1) {
                    toast.error(validationResult.errors[0].message);
                } else {
                    toast.error(`Please fix ${validationResult.errors.length} validation errors`);
                }

                // Trigger validation for all fields
                await trigger();
                setIsSubmitting(false);
                return;
            }

            // Save to Firebase
            await shiftStoreToDatabase(
                branchId,
                companyId,
                data,
                isEdit ? shiftId : undefined,
                dispatch
            );

            toast.success(isEdit ? 'Shift updated successfully!' : 'Shift created successfully!');
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
                        className="relative z-40 w-full max-w-4xl bg-white rounded-[14px] shadow-xl max-h-[90vh] flex flex-col"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-2 rounded-t-[14px] border-b border-gray-200 bg-primary">
                            <h2 className="text-xl font-semibold text-white">
                                {isEdit ? 'Edit Shift' : 'Add New Shift'}
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
                                        <p className="text-sm text-gray-600">Loading shift data...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {/* Shift Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Shift Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('shiftName', {
                                                required: 'Shift name is required',
                                                minLength: {
                                                    value: 2,
                                                    message: 'Shift name must be at least 2 characters',
                                                },
                                            })}
                                            type="text"
                                            placeholder="e.g., Morning Shift, Night Shift"
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${errors.shiftName
                                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                }`}
                                        />
                                        {errors.shiftName && (
                                            <p className="mt-1 text-xs text-red-600">{errors.shiftName.message}</p>
                                        )}
                                    </div>

                                    {/* Root Error Message */}
                                    {errors.root && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{errors.root.message}</p>
                                        </div>
                                    )}

                                    {/* Late Punch In Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Late Punch-In Time (minutes) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('latePunchInTime', {
                                                required: 'Late punch-in time is required',
                                                min: { value: 0, message: 'Must be 0 or greater' },
                                                valueAsNumber: true,
                                            })}
                                            type="number"
                                            min="0"
                                            placeholder="15"
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${errors.latePunchInTime
                                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                }`}
                                        />
                                        {errors.latePunchInTime && (
                                            <p className="mt-1 text-xs text-red-600">{errors.latePunchInTime.message}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Employees can punch in this many minutes after shift start time
                                        </p>
                                    </div>

                                    {/* Days Configuration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Shift Days Configuration <span className="text-red-500">*</span>
                                        </label>
                                        {errors.shiftDays && typeof errors.shiftDays === 'object' && 'message' in errors.shiftDays && (
                                            <p className="mb-2 text-xs text-red-600">{errors.shiftDays.message as string}</p>
                                        )}
                                        <div className="space-y-3">
                                            {dayOptions.map((day) => {
                                                const dayKey = day.key;
                                                const isExpanded = expandedDays.has(dayKey);
                                                const dayEnabled = watch(`shiftDays.${dayKey}.enabled`);

                                                return (
                                                    <div
                                                        key={dayKey}
                                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                                    >
                                                        {/* Day Header */}
                                                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Controller
                                                                    name={`shiftDays.${dayKey}.enabled`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <label className="flex items-center cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.value}
                                                                                onChange={(e) => {
                                                                                    field.onChange(e.target.checked);
                                                                                    // Auto-expand when enabled
                                                                                    if (e.target.checked) {
                                                                                        setExpandedDays((prev) => {
                                                                                            const newSet = new Set(prev);
                                                                                            newSet.add(dayKey);
                                                                                            return newSet;
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                                                                            />
                                                                            <span className="ml-2 text-sm font-medium text-gray-900">
                                                                                {day.label}
                                                                            </span>
                                                                        </label>
                                                                    )}
                                                                />
                                                            </div>
                                                            {dayEnabled && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleDayExpansion(dayKey)}
                                                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                                                >
                                                                    {isExpanded ? (
                                                                        <FiChevronUp className="w-4 h-4" />
                                                                    ) : (
                                                                        <FiChevronDown className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Day Configuration */}
                                                        {dayEnabled && (
                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="p-4 space-y-4 bg-white border-t border-gray-200">
                                                                            {/* Time Selection */}
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                                                        Start Time <span className="text-red-500">*</span>
                                                                                    </label>
                                                                                    <Controller
                                                                                        name={`shiftDays.${dayKey}.startTime`}
                                                                                        control={control}
                                                                                        rules={{
                                                                                            required: dayEnabled
                                                                                                ? 'Start time is required'
                                                                                                : false,
                                                                                        }}
                                                                                        render={({ field }) => (
                                                                                            <TimePickerWrapper
                                                                                                value={field.value}
                                                                                                onChange={field.onChange}
                                                                                                hasError={!!errors.shiftDays?.[dayKey]?.startTime}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                    {errors.shiftDays?.[dayKey]?.startTime && (
                                                                                        <p className="mt-1 text-xs text-red-600">
                                                                                            {errors.shiftDays[dayKey]?.startTime?.message}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                                                        End Time <span className="text-red-500">*</span>
                                                                                    </label>
                                                                                    <Controller
                                                                                        name={`shiftDays.${dayKey}.endTime`}
                                                                                        control={control}
                                                                                        rules={{
                                                                                            required: dayEnabled
                                                                                                ? 'End time is required'
                                                                                                : false,
                                                                                        }}
                                                                                        render={({ field }) => (
                                                                                            <TimePickerWrapper
                                                                                                value={field.value}
                                                                                                onChange={field.onChange}
                                                                                                hasError={!!errors.shiftDays?.[dayKey]?.endTime}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                    {errors.shiftDays?.[dayKey]?.endTime && (
                                                                                        <p className="mt-1 text-xs text-red-600">
                                                                                            {errors.shiftDays[dayKey]?.endTime?.message}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Break Settings */}
                                                                            <div>
                                                                                <label className="block text-xs font-medium text-gray-700 mb-3">
                                                                                    Break Type <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <Controller
                                                                                    name={`shiftDays.${dayKey}.isFixedBreakTime`}
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <div className="grid grid-cols-2 gap-3">
                                                                                            {/* Unscheduled Break */}
                                                                                            <label
                                                                                                className={`
                                                                                                p-4 border-2 rounded-lg cursor-pointer transition-all
                                                                                                ${!field.value
                                                                                                        ? 'border-primary bg-primary/5'
                                                                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                                                                    }
                                                                                            `}
                                                                                            >
                                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        checked={!field.value}
                                                                                                        onChange={() => {
                                                                                                            field.onChange(false);
                                                                                                        }}
                                                                                                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                                                                    />
                                                                                                    <span className="text-sm font-medium text-gray-900">
                                                                                                        Unscheduled Break
                                                                                                    </span>
                                                                                                </div>
                                                                                                <p className="text-xs text-gray-600 ml-6">
                                                                                                    Set total break time in minutes
                                                                                                </p>
                                                                                            </label>

                                                                                            {/* Scheduled Break */}
                                                                                            <label
                                                                                                className={`
                                                                                                p-4 border-2 rounded-lg cursor-pointer transition-all
                                                                                                ${field.value
                                                                                                        ? 'border-primary bg-primary/5'
                                                                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                                                                    }
                                                                                            `}
                                                                                            >
                                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        checked={field.value}
                                                                                                        onChange={() => {
                                                                                                            field.onChange(true);
                                                                                                            // Auto-initialize break times when enabled
                                                                                                            const currentBreakTimes = watch(`shiftDays.${dayKey}.breakTimes`);
                                                                                                            if (!currentBreakTimes || currentBreakTimes.length === 0) {
                                                                                                                setValue(`shiftDays.${dayKey}.breakTimes`, [
                                                                                                                    { startTime: null, endTime: null },
                                                                                                                ]);
                                                                                                            }
                                                                                                        }}
                                                                                                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                                                                    />
                                                                                                    <span className="text-sm font-medium text-gray-900">
                                                                                                        Scheduled Break
                                                                                                    </span>
                                                                                                </div>
                                                                                                <p className="text-xs text-gray-600 ml-6">
                                                                                                    Set specific break start and end times
                                                                                                </p>
                                                                                            </label>
                                                                                        </div>
                                                                                    )}
                                                                                />

                                                                                {/* Unscheduled Break - Show when selected */}
                                                                                {!watch(`shiftDays.${dayKey}.isFixedBreakTime`) && (
                                                                                    <div className="mt-4">
                                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                                                            Break Time (minutes) <span className="text-red-500">*</span>
                                                                                        </label>
                                                                                        <Controller
                                                                                            name={`shiftDays.${dayKey}.breakTimeMinutes`}
                                                                                            control={control}
                                                                                            render={({ field }) => (
                                                                                                <>
                                                                                                    <input
                                                                                                        {...field}
                                                                                                        type="number"
                                                                                                        min="0"
                                                                                                        placeholder="30"
                                                                                                        value={field.value ?? ''}
                                                                                                        onChange={(e) =>
                                                                                                            field.onChange(
                                                                                                                e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                                                                                                            )
                                                                                                        }
                                                                                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all ${errors.shiftDays?.[dayKey]?.breakTimeMinutes
                                                                                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                                                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                                                                            }`}
                                                                                                    />
                                                                                                    {errors.shiftDays?.[dayKey]?.breakTimeMinutes && (
                                                                                                        <p className="mt-1 text-xs text-red-600">
                                                                                                            {errors.shiftDays[dayKey]?.breakTimeMinutes?.message}
                                                                                                        </p>
                                                                                                    )}
                                                                                                </>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {/* Scheduled Break - Show when selected */}
                                                                                {watch(`shiftDays.${dayKey}.isFixedBreakTime`) && (
                                                                                    <div className="mt-4">
                                                                                        <div className="flex items-center justify-between mb-2">
                                                                                            <label className="block text-xs font-medium text-gray-700">
                                                                                                Break Times <span className="text-red-500">*</span>
                                                                                            </label>
                                                                                            <Controller
                                                                                                name={`shiftDays.${dayKey}.breakTimes`}
                                                                                                control={control}
                                                                                                render={({ field }) => (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => {
                                                                                                            const current = field.value || [];
                                                                                                            field.onChange([
                                                                                                                ...current,
                                                                                                                { startTime: null, endTime: null },
                                                                                                            ]);
                                                                                                        }}
                                                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                                                                                    >
                                                                                                        <FiPlus className="w-3.5 h-3.5" />
                                                                                                        Add Break
                                                                                                    </button>
                                                                                                )}
                                                                                            />
                                                                                        </div>
                                                                                        {errors.shiftDays?.[dayKey]?.breakTimes && typeof errors.shiftDays[dayKey]?.breakTimes === 'object' && 'message' in errors.shiftDays[dayKey]?.breakTimes && (
                                                                                            <p className="mb-2 text-xs text-red-600">
                                                                                                {errors.shiftDays[dayKey]?.breakTimes?.message as string}
                                                                                            </p>
                                                                                        )}
                                                                                        <Controller
                                                                                            name={`shiftDays.${dayKey}.breakTimes`}
                                                                                            control={control}
                                                                                            render={({ field }) => (
                                                                                                <div className="space-y-2">
                                                                                                    {(field.value || []).map((_, breakIndex) => (
                                                                                                        <div
                                                                                                            key={breakIndex}
                                                                                                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                                                                        >
                                                                                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                                                                                <div>
                                                                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                                                        Start Time
                                                                                                                    </label>
                                                                                                                    <Controller
                                                                                                                        name={`shiftDays.${dayKey}.breakTimes.${breakIndex}.startTime`}
                                                                                                                        control={control}
                                                                                                                        render={({ field: breakField }) => (
                                                                                                                            <>
                                                                                                                                <TimePickerWrapper
                                                                                                                                    value={breakField.value}
                                                                                                                                    onChange={breakField.onChange}
                                                                                                                                    size="small"
                                                                                                                                    hasError={!!errors.shiftDays?.[dayKey]?.breakTimes?.[breakIndex]?.startTime}
                                                                                                                                />
                                                                                                                                {errors.shiftDays?.[dayKey]?.breakTimes?.[breakIndex]?.startTime && (
                                                                                                                                    <p className="mt-1 text-xs text-red-600">
                                                                                                                                        {errors.shiftDays[dayKey]?.breakTimes?.[breakIndex]?.startTime?.message}
                                                                                                                                    </p>
                                                                                                                                )}
                                                                                                                            </>
                                                                                                                        )}
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div>
                                                                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                                                        End Time
                                                                                                                    </label>
                                                                                                                    <Controller
                                                                                                                        name={`shiftDays.${dayKey}.breakTimes.${breakIndex}.endTime`}
                                                                                                                        control={control}
                                                                                                                        render={({ field: breakField }) => (
                                                                                                                            <>
                                                                                                                                <TimePickerWrapper
                                                                                                                                    value={breakField.value}
                                                                                                                                    onChange={breakField.onChange}
                                                                                                                                    size="small"
                                                                                                                                    hasError={!!errors.shiftDays?.[dayKey]?.breakTimes?.[breakIndex]?.endTime}
                                                                                                                                />
                                                                                                                                {errors.shiftDays?.[dayKey]?.breakTimes?.[breakIndex]?.endTime && (
                                                                                                                                    <p className="mt-1 text-xs text-red-600">
                                                                                                                                        {errors.shiftDays[dayKey]?.breakTimes?.[breakIndex]?.endTime?.message}
                                                                                                                                    </p>
                                                                                                                                )}
                                                                                                                            </>
                                                                                                                        )}
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                onClick={() => {
                                                                                                                    const current = field.value || [];
                                                                                                                    field.onChange(
                                                                                                                        current.filter((_, idx) => idx !== breakIndex)
                                                                                                                    );
                                                                                                                }}
                                                                                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                                                                            >
                                                                                                                <FiTrash2 className="w-4 h-4" />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                    {(!field.value || field.value.length === 0) && (
                                                                                                        <p className="text-xs text-gray-500 italic py-2">
                                                                                                            No breaks added yet. Click "Add Break" to add one.
                                                                                                        </p>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>


                                                                            {/* Occasional Day Toggle */}
                                                                            <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
                                                                                <div className="flex items-center justify-between">
                                                                                    <div>
                                                                                        <label className="text-xs font-medium text-purple-900">
                                                                                            Occasional Day
                                                                                        </label>
                                                                                        <p className="text-xs text-purple-700 mt-0.5">
                                                                                            Enable if this day occurs only on specific weeks
                                                                                        </p>
                                                                                    </div>
                                                                                    <Controller
                                                                                        name={`shiftDays.${dayKey}.isOccasional`}
                                                                                        control={control}
                                                                                        render={({ field }) => (
                                                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={field.value}
                                                                                                    onChange={field.onChange}
                                                                                                    className="sr-only peer"
                                                                                                />
                                                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                                                            </label>
                                                                                        )}
                                                                                    />
                                                                                </div>

                                                                                {/* Occasional Weeks Selection */}
                                                                                {watch(`shiftDays.${dayKey}.isOccasional`) && (
                                                                                    <div className='mt-2'>
                                                                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                                                                            Select Weeks <span className="text-red-500">*</span>
                                                                                        </label>
                                                                                        <Controller
                                                                                            name={`shiftDays.${dayKey}.occasionalDays`}
                                                                                            control={control}
                                                                                            render={({ field }) => (
                                                                                                <div>
                                                                                                    <div className="flex flex-wrap gap-2">
                                                                                                        {weekOptions.map((week) => (
                                                                                                            <label
                                                                                                                key={week.value}
                                                                                                                className="flex items-center cursor-pointer"
                                                                                                            >
                                                                                                                <input
                                                                                                                    type="checkbox"
                                                                                                                    checked={field.value?.includes(week.value)}
                                                                                                                    onChange={(e) => {
                                                                                                                        const current = field.value || [];
                                                                                                                        if (e.target.checked) {
                                                                                                                            field.onChange([...current, week.value]);
                                                                                                                        } else {
                                                                                                                            field.onChange(
                                                                                                                                current.filter((v) => v !== week.value)
                                                                                                                            );
                                                                                                                        }
                                                                                                                    }}
                                                                                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                                                                />
                                                                                                                <span className="ml-2 text-xs text-gray-700">{week.label}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    {errors.shiftDays?.[dayKey]?.occasionalDays && (
                                                                                                        <p className="mt-1 text-xs text-red-600">
                                                                                                            {errors.shiftDays[dayKey]?.occasionalDays?.message}
                                                                                                        </p>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
                                        : (isEdit ? 'Update Shift' : 'Create Shift')
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

export default AddShiftModal;
