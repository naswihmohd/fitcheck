import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { collection, doc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePicker.css';
import type { BatchProps } from '../../data/batchTypes';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import { db } from '../../../../../firebaseConfig';
import keywordsBuilder from '../../../../../general/utils/keywordsBuilder';
import { addBatch, updateBatch } from '../../redux/batchSlice';
import FormLoading from '../../../../../general/components/FormLoading';
import type { CourseProps } from '../../../courses/data/courseType';
import TutorSelectionModal from './TutorSelectionModal';
import type { TutorProps } from '../../../tutorManagement/data/tutorTypes';

interface AddBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    batch?: BatchProps | null;
    courseId: string;
    onSuccess?: () => void;
    courseData: CourseProps;
}

interface BatchFormData {
    batchName: string;
    allowInstallmentPayments: boolean;
    batchStartDate: Date | null;
    batchEndDate: Date | null;
    batchPeriodStartTime: string;
    batchPeriodEndTime: string;
    tutorId: string;
    registrationFee: string;
}

const defaultValues: BatchFormData = {
    batchName: '',
    allowInstallmentPayments: false,
    batchStartDate: null,
    batchEndDate: null,
    batchPeriodStartTime: '',
    batchPeriodEndTime: '',
    tutorId: '',
    registrationFee: '',
};

const AddBatchModal: React.FC<AddBatchModalProps> = ({
    isOpen,
    onClose,
    mode = 'create',
    batch = null,
    courseId,
    courseData,
}) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState<TutorProps | null>(null);
    const { branchData, branchId } = useSelector((state: RootState) => state.user);
    const { branchTutors } = useSelector((state: RootState) => state.branchTutors);
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BatchFormData>({
        defaultValues,
    });

    const watchedStartDate = watch('batchStartDate');

    useEffect(() => {
        setMounted(true);
    }, []);

    const isEditMode = mode === 'edit' && !!batch;

    useEffect(() => {
        if (!isOpen) {
            reset(defaultValues);
            setSelectedTutor(null);
            return;
        }

        if (isEditMode && batch) {
            const startDate = batch.batchStartDate instanceof Date 
                ? batch.batchStartDate
                : batch.batchStartDate.toDate();
            
            const endDate = batch.batchEndDate instanceof Date 
                ? batch.batchEndDate
                : batch.batchEndDate.toDate();
            
            const startTime = batch.batchPeriodStartTime instanceof Date
                ? batch.batchPeriodStartTime
                : batch.batchPeriodStartTime.toDate();
            
            const endTime = batch.batchPeriodEndTime instanceof Date
                ? batch.batchPeriodEndTime
                : batch.batchPeriodEndTime.toDate();

            // Format times as HH:mm for HTML time inputs
            const formatTimeForInput = (date: Date) => {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            reset({
                batchName: batch.batchName || '',
                allowInstallmentPayments: batch.allowInstallmentPayments || false,
                batchStartDate: startDate,
                batchEndDate: endDate,
                batchPeriodStartTime: formatTimeForInput(startTime),
                batchPeriodEndTime: formatTimeForInput(endTime),
                tutorId: batch.tutorId || '',
                registrationFee: batch.registrationFee.toString() || '',
            });

            // Find and set the selected tutor if tutorId exists
            if (batch.tutorId && branchId && branchTutors[branchId]?.teams) {
                const tutor = branchTutors[branchId].teams.find((t: TutorProps) => t.id === batch.tutorId);
                if (tutor) {
                    setSelectedTutor(tutor);
                }
            }
        } else {
            reset(defaultValues);
            setSelectedTutor(null);
        }
    }, [isOpen, reset, isEditMode, batch, branchId, branchTutors]);

    const onSubmitForm = async (data: BatchFormData) => {
        if (!branchData?.id || !branchId) {
            toast.error('Branch information not found');
            return;
        }

        if (!courseId) {
            toast.error('Course information not found');
            return;
        }

        try {
            setLoading(true);
            const registrationFee = parseFloat(data.registrationFee);

            if (isNaN(registrationFee) || registrationFee < 0) {
                toast.error('Please enter a valid registration fee');
                setLoading(false);
                return;
            }

            if (!data.tutorId) {
                toast.error('Please select a tutor');
                setLoading(false);
                return;
            }

            if (!data.batchStartDate || !data.batchEndDate) {
                toast.error('Please select both start and end dates');
                setLoading(false);
                return;
            }

            if (!data.batchPeriodStartTime || !data.batchPeriodEndTime) {
                toast.error('Please select both start and end times');
                setLoading(false);
                return;
            }

            const batchStartDate = data.batchStartDate;
            const batchEndDate = data.batchEndDate;
            
            if (batchEndDate <= batchStartDate) {
                toast.error('End date must be after start date');
                setLoading(false);
                return;
            }

            // Convert time strings (HH:mm) to Date objects by combining with batchStartDate
            // Parse time string (HH:mm format)
            const parseTimeString = (timeString: string, referenceDate: Date): Date => {
                const [hours, minutes] = timeString.split(':').map(Number);
                const date = new Date(referenceDate);
                date.setHours(hours, minutes, 0, 0);
                return date;
            };

            const periodStartDateTime = parseTimeString(data.batchPeriodStartTime, batchStartDate);
            const periodEndDateTime = parseTimeString(data.batchPeriodEndTime, batchStartDate);

            if (isNaN(periodStartDateTime.getTime()) || isNaN(periodEndDateTime.getTime())) {
                toast.error('Please enter valid times');
                setLoading(false);
                return;
            }

            if (periodEndDateTime <= periodStartDateTime) {
                toast.error('End time must be after start time');
                setLoading(false);
                return;
            }

            if (isEditMode && batch) {
                // Update existing batch
                const batchDocRef = doc(db, 'branches', branchId, 'courses', courseId, 'batches', batch.id);

                const updatedBatchPayload: Partial<BatchProps> = {
                    batchName: data.batchName.trim(),
                    allowInstallmentPayments: data.allowInstallmentPayments,
                    batchStartDate: Timestamp.fromDate(batchStartDate),
                    batchEndDate: Timestamp.fromDate(batchEndDate),
                    batchPeriodStartTime: Timestamp.fromDate(periodStartDateTime),
                    batchPeriodEndTime: Timestamp.fromDate(periodEndDateTime),
                    tutorId: data.tutorId,
                    courseFee: courseData.courseFee,
                    registrationFee: registrationFee,
                    keywords: keywordsBuilder(`${data.batchName.trim()}`),
                };

                await updateDoc(batchDocRef, updatedBatchPayload);

                // Update batch in Redux store
                const updatedBatch: BatchProps = {
                    ...batch,
                    ...updatedBatchPayload,
                };
                dispatch(updateBatch({ courseId, batch: updatedBatch }));

                toast.success('Batch updated successfully!');
            } else {
                // Create new batch
                const batchesCollection = collection(db, 'branches', branchId, 'courses', courseId, 'batches');
                const docRef = doc(batchesCollection);

                const batchPayload: BatchProps = {
                    id: docRef.id,
                    batchName: data.batchName.trim(),
                    allowInstallmentPayments: data.allowInstallmentPayments,
                    batchStartDate: Timestamp.fromDate(batchStartDate),
                    batchEndDate: Timestamp.fromDate(batchEndDate),
                    batchPeriodStartTime: Timestamp.fromDate(periodStartDateTime),
                    batchPeriodEndTime: Timestamp.fromDate(periodEndDateTime),
                    tutorId: data.tutorId,
                    courseFee: courseData.courseFee,
                    registrationFee: registrationFee,
                    courseId: courseId,
                    branchId: branchId,
                    createdAt: serverTimestamp() as Timestamp,
                    keywords: keywordsBuilder(`${data.batchName.trim()}`),
                };

                await setDoc(docRef, batchPayload);

                // Add batch to Redux store
                dispatch(addBatch({ courseId, batch: batchPayload }));

                toast.success('Batch created successfully!');
            }

            onClose();
            reset(defaultValues);
        } catch (error: any) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} batch:`, error);
            toast.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} batch`);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                className="absolute inset-0 bg-black/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={onClose}
                            />

                            <motion.div
                                className="relative z-40 w-full max-w-2xl rounded-[18px] bg-white shadow-2xl"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="rounded-t-[18px] bg-[#111F60] px-6 py-3 flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-white">
                                        {isEditMode ? 'Edit Batch' : 'Create New Batch'}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full text-white transition-transform duration-200 hover:scale-105"
                                        aria-label="Close"
                                    >
                                        <IoMdCloseCircleOutline className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-3 scrollbar-none overflow-y-auto max-h-[90vh] bg-[#F7F8FC] rounded-b-[18px]">

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Enter Batch Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('batchName', { required: 'Batch name is required' })}
                                            className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            placeholder="Enter Batch Name"
                                        />
                                        {errors.batchName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.batchName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Select Tutor <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            control={control}
                                            name="tutorId"
                                            rules={{ required: 'Tutor selection is required' }}
                                            render={({ field }) => (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsTutorModalOpen(true)}
                                                        className={`w-full rounded-md border ${
                                                            errors.tutorId 
                                                                ? 'border-red-500' 
                                                                : 'border-gray-200'
                                                        } bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 flex items-center justify-between cursor-pointer hover:border-secondary transition-colors`}
                                                    >
                                                        <span className={selectedTutor ? 'text-gray-900' : 'text-gray-500'}>
                                                            {selectedTutor ? selectedTutor.name : 'Select a tutor'}
                                                        </span>
                                                        <FiChevronDown className="text-gray-400" size={20} />
                                                    </button>
                                                    <input
                                                        type="hidden"
                                                        {...field}
                                                    />
                                                </>
                                            )}
                                        />
                                        {errors.tutorId && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tutorId.message}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Batch Start Date <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                control={control}
                                                name="batchStartDate"
                                                rules={{ required: 'Start date is required' }}
                                                render={({ field }) => (
                                                    <div className="w-full">
                                                        <DatePicker
                                                            selected={field.value}
                                                            onChange={(date) => field.onChange(date)}
                                                            dateFormat="MMM dd, yyyy"
                                                            placeholderText="Select start date"
                                                            minDate={new Date()}
                                                            wrapperClassName="w-full"
                                                        />
                                                    </div>
                                                )}
                                            />
                                            {errors.batchStartDate && (
                                                <p className="mt-1 text-sm text-red-600">{errors.batchStartDate.message}</p>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Batch End Date <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                control={control}
                                                name="batchEndDate"
                                                rules={{ required: 'End date is required' }}
                                                render={({ field }) => (
                                                    <div className="w-full">
                                                        <DatePicker
                                                            selected={field.value}
                                                            onChange={(date) => field.onChange(date)}
                                                            dateFormat="MMM dd, yyyy"
                                                            placeholderText="Select end date"
                                                            minDate={watchedStartDate || new Date()}
                                                            wrapperClassName="w-full"
                                                        />
                                                    </div>
                                                )}
                                            />
                                            {errors.batchEndDate && (
                                                <p className="mt-1 text-sm text-red-600">{errors.batchEndDate.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Start Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                {...register('batchPeriodStartTime', { required: 'Start time is required' })}
                                                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            />
                                            {errors.batchPeriodStartTime && (
                                                <p className="mt-1 text-sm text-red-600">{errors.batchPeriodStartTime.message}</p>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                End Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                {...register('batchPeriodEndTime', { required: 'End time is required' })}
                                                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            />
                                            {errors.batchPeriodEndTime && (
                                                <p className="mt-1 text-sm text-red-600">{errors.batchPeriodEndTime.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Registration Fee <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...register('registrationFee', {
                                                    required: 'Registration fee is required',
                                                    min: { value: 0, message: 'Fee cannot be negative' }
                                                })}
                                                className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                                placeholder="Enter Registration Fee"
                                            />
                                            {errors.registrationFee && (
                                                <p className="mt-1 text-sm text-red-600">{errors.registrationFee.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-4 block text-base italic font-medium text-gray-700">
                                            Allow Installment Payments?
                                        </label>
                                        <Controller
                                            control={control}
                                            name="allowInstallmentPayments"
                                            render={({ field }) => (
                                                <div className="flex gap-8 items-center">
                                                    <label 
                                                        onClick={() => field.onChange(true)}
                                                        className="flex items-center gap-4 cursor-pointer"
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                                                            field.value === true
                                                                ? 'border-primary bg-primary'
                                                                : 'border-primary bg-white'
                                                        }`}></div>
                                                        <span className="text-sm font-medium text-gray-700">Yes</span>
                                                    </label>
                                                    <label 
                                                        onClick={() => field.onChange(false)}
                                                        className="flex items-center gap-4 cursor-pointer"
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                                                            field.value === false
                                                                ? 'border-primary bg-primary'
                                                                : 'border-primary bg-white'
                                                        }`}></div>
                                                        <span className="text-sm font-medium text-gray-700">No</span>
                                                    </label>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-[#111F60] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1a4d]"
                                        >
                                            {isEditMode ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>

                            {loading && <FormLoading />}
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Tutor Selection Modal */}
            <TutorSelectionModal
                isOpen={isTutorModalOpen}
                onClose={() => setIsTutorModalOpen(false)}
                onSelect={(tutor: TutorProps) => {
                    setValue('tutorId', tutor.id, { shouldValidate: true });
                    setSelectedTutor(tutor);
                    setIsTutorModalOpen(false);
                }}
                courseId={courseId}
                title="Select Tutor"
            />
        </>
    );
};

export default AddBatchModal;

