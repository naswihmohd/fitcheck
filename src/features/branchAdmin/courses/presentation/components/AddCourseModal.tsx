import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import toast from 'react-hot-toast';
import { collection, doc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import type { CourseProps } from '../../data/courseType';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import { db } from '../../../../../firebaseConfig';
import keywordsBuilder from '../../../../../general/utils/keywordsBuilder';
import { addCourse, updateCourse } from '../../redux/coursesSlice';
import FormLoading from '../../../../../general/components/FormLoading';

interface AddCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    course?: CourseProps | null;
    onSuccess?: () => void;
}

interface CourseFormData {
    courseName: string;
    courseDuration: string;
    courseFee: string;
}

const defaultValues: CourseFormData = {
    courseName: '',
    courseDuration: '',
    courseFee: '',
};

const AddCourseModal: React.FC<AddCourseModalProps> = ({
    isOpen,
    onClose,
    mode = 'create',
    course = null,
}) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { branchData } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CourseFormData>({
        defaultValues,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const isEditMode = mode === 'edit' && !!course;

    useEffect(() => {
        if (!isOpen) {
            reset(defaultValues);
            return;
        }

        if (isEditMode && course) {
            reset({
                courseName: course.courseName || '',
                courseDuration: course.courseDuration || '',
                courseFee: course.courseFee.toString() || '',
            });
        } else {
            reset(defaultValues);
        }
    }, [isOpen, reset, isEditMode, course]);

    const onSubmitForm = async (data: CourseFormData) => {
        if (!branchData?.id) {
            toast.error('Branch information not found');
            return;
        }

        try {
            setLoading(true);

            const courseFee = parseFloat(data.courseFee);
            if (isNaN(courseFee) || courseFee <= 0) {
                toast.error('Please enter a valid course fee');
                setLoading(false);
                return;
            }

            if (isEditMode && course) {
                // Update existing course
                const courseDocRef = doc(db, 'branches', branchData.id, 'courses', course.id);

                const updatedCoursePayload: Partial<CourseProps> = {
                    courseName: data.courseName.trim(),
                    courseDuration: data.courseDuration.trim(),
                    courseFee: courseFee,
                    keywords: keywordsBuilder(`${data.courseName.trim()}`),
                };

                await updateDoc(courseDocRef, updatedCoursePayload);

                // Update course in Redux store
                const updatedCourse: CourseProps = {
                    ...course,
                    ...updatedCoursePayload,
                };
                dispatch(updateCourse({ branchId: branchData.id, course: updatedCourse }));

                toast.success('Course updated successfully!');
            } else {
                // Create new course
                const coursesCollection = collection(db, 'branches', branchData.id, 'courses');
                const docRef = doc(coursesCollection);

                const coursePayload: CourseProps = {
                    id: docRef.id,
                    courseName: data.courseName.trim(),
                    courseDuration: data.courseDuration.trim(),
                    courseFee: courseFee,
                    createdAt: serverTimestamp() as Timestamp,
                    branchId: branchData.id,
                    keywords: keywordsBuilder(`${data.courseName.trim()}`),
                };

                await setDoc(docRef, coursePayload);

                // Add course to Redux store
                dispatch(addCourse({ branchId: branchData.id, course: coursePayload }));

                toast.success('Course created successfully!');
            }

            onClose();
            reset(defaultValues);
        } catch (error: any) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} course:`, error);
            toast.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} course`);
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
                                        {isEditMode ? 'Edit Course' : 'Create New Course'}
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
                                            Enter Course Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('courseName', { required: 'Course name is required' })}
                                            className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            placeholder="Enter Course Name"
                                        />
                                        {errors.courseName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.courseName.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Course Duration <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('courseDuration', { required: 'Course duration is required' })}
                                            className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            placeholder="e.g., 4 Years"
                                        />
                                        {errors.courseDuration && (
                                            <p className="mt-1 text-sm text-red-600">{errors.courseDuration.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Enter Course Fee <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('courseFee', {
                                                required: 'Course fee is required',
                                                min: { value: 0.01, message: 'Fee must be greater than 0' }
                                            })}
                                            className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                                            placeholder="Enter Course Fee"
                                        />
                                        {errors.courseFee && (
                                            <p className="mt-1 text-sm text-red-600">{errors.courseFee.message}</p>
                                        )}
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
        </>
    );
};

export default AddCourseModal;

