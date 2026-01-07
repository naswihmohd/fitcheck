import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { auth, db, storage } from '../../../../../firebaseConfig';
import toast from 'react-hot-toast';
import FormLoading from '../../../../../general/components/FormLoading';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import LoadImage from '../../../../../general/components/LoadImage';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import { CloudFunctionsURLs } from '../../../../../general/constants/constants';
import type { TutorProps } from '../../data/tutorTypes';
import { addTutor, updateTutor } from '../../redux/tutorSlice';
import SelectCourseModal from './SelectCourseModal';
import type { CourseProps } from '../../../courses/data/courseType';
import keywordsBuilder from '../../../../../general/utils/keywordsBuilder';

export interface TutorFormData {
    tutorId: string;
    name: string;
    grade: string;
    courseId: string;
    phone: string;
    email: string;
    password: string;
    image: FileList;
}

interface AddTutorModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    tutor?: TutorProps | null;
    setTutor?: (tutor: TutorProps) => void;
}

const defaultValues: Omit<TutorFormData, 'image'> = {
    tutorId: '',
    name: '',
    grade: '',
    courseId: '',
    phone: '',
    email: '',
    password: '',
};


const AddTutorModal: React.FC<AddTutorModalProps> = ({ isOpen, onClose, mode = 'create', tutor, setTutor }) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(tutor?.imageUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseProps | null>(null);
    const isEditMode = mode === 'edit';
    const { branchId } = useSelector((state: RootState) => state.user);
    const { branchCourses } = useSelector((state: RootState) => state.branchCourses);
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<TutorFormData>({
        defaultValues: {
            ...defaultValues,
            image: undefined as any,
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            reset({
                ...defaultValues,
                image: undefined as any,
            });
            setShowPassword(false);
            setPreviewImage(null);
            setSelectedFile(null);
            setSelectedCourse(null);
            setIsCourseModalOpen(false);
        }
    }, [isOpen, reset]);

    useEffect(() => {
        if (isOpen && tutor) {
            reset({
                ...defaultValues,
                tutorId: tutor.tutorId,
                name: tutor.name,
                grade: tutor.grade,
                courseId: tutor.courseId,
                phone: tutor.phone,
                email: tutor.email,
                image: undefined as any,
            });
            setPreviewImage(tutor.imageUrl || null);

            // Try to find the course in branchCourses to set selectedCourse
            if (branchId && tutor.courseId) {
                const courses = branchCourses[branchId]?.courses || [];
                const course = courses.find((c: CourseProps) => c.id === tutor.courseId);
                if (course) {
                    setSelectedCourse(course);
                }
            }
        }
    }, [tutor, isOpen, reset, branchId, branchCourses]);

    // Handle Image Preview
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 2) {
            try {
                const options = {
                    maxSizeMB: 2, // Target 2MB
                    maxWidthOrHeight: 1920, // Reduce resolution for better compression
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(file, options);
                const compressedSizeMB = compressedFile.size / (1024 * 1024);

                if (compressedSizeMB > 2) {
                    toast.error("Unable to compress image below 2MB.");
                    return;
                }

                setSelectedFile(compressedFile);
                setPreviewImage(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Image compression error:", error);
                toast.error("Failed to compress image.");
            }
        } else {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return phone;
        return phone.startsWith('+') ? phone : `+${phone}`;
    };

    const onSubmitForm = async (data: TutorFormData) => {
        if (!branchId) {
            toast.error("Something went wrong! Please login again.");
            return;
        }

        // Validate course selection
        if (!selectedCourse) {
            toast.error("Please select a course");
            return;
        }

        try {
            setLoading(true);

            let imageUrl = tutor?.imageUrl || null;

            // Upload Image if selected
            if (selectedFile) {
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error("User not authenticated");

                const storageRef = ref(storage, `tutors/${branchId}/${data.email}`);
                await uploadBytes(storageRef, selectedFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            if (isEditMode) {
                if (!tutor) throw new Error("Tutor not found");

                const keywords = [
                    ...keywordsBuilder(data.name),
                    ...keywordsBuilder(data.email),
                ];

                const updatedTutor = {
                    tutorId: data.tutorId,
                    name: data.name,
                    grade: data.grade,
                    courseId: selectedCourse.id,
                    phone: formatPhoneNumber(data.phone),
                    email: data.email,
                    imageUrl: imageUrl || null,
                    keywords: keywords,
                };

                const updatedTutorData = {
                    ...tutor,
                    ...updatedTutor,
                } as TutorProps;

                // Update tutor document
                const tutorRef = doc(db, "branches", branchId, "tutors", tutor.id);
                await updateDoc(tutorRef, updatedTutor);

                dispatch(updateTutor({ branchId: branchId, tutor: updatedTutorData }));
                setTutor?.(updatedTutorData);

                toast.success("Tutor updated successfully!");
                onClose();
                return;
            }

            // ✅ Check authentication
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not authenticated");

            // ✅ Get Firebase ID token
            const idToken = await currentUser.getIdToken();

            // ✅ Cloud Function URL - Add CREATE_TUTOR to CloudFunctionsURLs if needed
            const url = CloudFunctionsURLs.CREATE_TUTOR;
            if (!url) throw new Error("Cloud Function URL not configured");

            const newTutor = {
                tutorId: data.tutorId,
                name: data.name,
                grade: data.grade,
                courseId: selectedCourse.id,
                phone: formatPhoneNumber(data.phone),
                email: data.email,
                password: data.password,
                imageUrl: imageUrl || null,
                branchId: branchId,
            };

            // ✅ Make HTTPS request
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    ...newTutor,
                }),
            });

            // ✅ Parse JSON response
            const result = await response.json();

            // ✅ Handle response cases
            if (!response.ok) {
                console.error("Create tutor failed:", result);
                toast.error(result.message || "Failed to create tutor");
                return;
            }

            console.log("result.tutor", result.tutor || result);

            dispatch(addTutor({ branchId: branchId, tutor: result.tutor }));

            console.log("✅ Tutor Added successfully:", result);
            toast.success("Tutor Added successfully!");
            onClose();

        } catch (error: any) {
            console.error("Error saving tutor:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (<>
        {createPortal(
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
                            className="relative z-40 w-full max-w-3xl bg-gray-100 rounded-[14px] overflow-hidden shadow-xl"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-secondary px-6 py-3 flex items-center justify-between">
                                <h2 className="text-white text-base font-semibold">
                                    {isEditMode ? 'Edit Tutor' : 'Add New Tutor'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-full scale-100 hover:scale-105 duration-300 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <IoMdCloseCircleOutline className="text-white w-6 h-6" />
                                </button>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white max-h-[85vh] overflow-y-auto p-6">
                                <div className="space-y-5">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Image (Jpg, Png)
                                        </label>
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer block w-full"
                                        >
                                            <div className="w-full max-w-[200px] border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-center hover:border-primary transition-colors">
                                                {previewImage ? (
                                                    <div className="relative w-full h-32 flex items-center justify-center">
                                                        <LoadImage
                                                            index={0}
                                                            className="object-cover max-h-32 rounded-md"
                                                            src={previewImage}
                                                            alt="Profile preview"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-500">
                                                            Click to upload image
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            JPG, PNG (Max 2MB)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                {...register("image")}
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>

                                    {/* Tutor ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Enter ID <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('tutorId', { required: 'Tutor ID is required' })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                            placeholder="Enter ID"
                                        />
                                        {errors.tutorId && (
                                            <p className="mt-1 text-sm text-red-600">{errors.tutorId.message}</p>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('name', { required: 'Name is required' })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                            placeholder="Enter name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Grade and Course - Two Columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('grade', { required: 'Grade is required' })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                placeholder="Enter grade"
                                            />
                                            {errors.grade && (
                                                <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Course <span className='text-red-500'>*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsCourseModalOpen(true)}
                                                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none text-sm text-left bg-white ${selectedCourse
                                                    ? 'border-gray-300 text-gray-900'
                                                    : 'border-gray-300 text-gray-500'
                                                    } hover:border-primary transition-colors`}
                                            >
                                                {selectedCourse ? (
                                                    <div className="flex items-center justify-between">
                                                        <span>{selectedCourse.courseName}</span>
                                                        <span className="text-xs text-gray-400">Click to change</span>
                                                    </div>
                                                ) : (
                                                    <span>Click to select course</span>
                                                )}
                                            </button>
                                            {!selectedCourse && (
                                                <p className="mt-1 text-sm text-red-600">Please select a course</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number <span className='text-red-500'>*</span>
                                        </label>
                                        <Controller
                                            name="phone"
                                            control={control}
                                            rules={{
                                                required: 'Phone number is required',
                                                validate: (value) => {
                                                    if (!value || value.length < 8) {
                                                        return 'Please enter a valid phone number';
                                                    }
                                                    return true;
                                                }
                                            }}
                                            render={({ field }) => (
                                                <PhoneInput
                                                    country={'in'}
                                                    value={field.value || ''}
                                                    onChange={(value) => field.onChange(value)}
                                                    inputClass="!w-full !py-2.5 !px-4 !pl-14 !rounded-md !text-sm !font-normal !bg-white !border !border-gray-300 !focus:border-primary !focus:ring-2 !focus:ring-primary/20 !transition-all !duration-300"
                                                    inputProps={{
                                                        name: 'phone',
                                                        required: true,
                                                        placeholder: 'Enter phone number',
                                                        autoComplete: 'tel',
                                                    }}
                                                    countryCodeEditable={true}
                                                    containerClass="w-full"
                                                    enableSearch
                                                    disableSearchIcon={false}
                                                    preferredCountries={['in', 'us', 'gb', 'au', 'ca']}
                                                    onFocus={(e) => {
                                                        const length = e.target.value.length;
                                                        e.target.setSelectionRange(length, length);
                                                    }}
                                                />
                                            )}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    {/* Email and Password - Two Columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                autoComplete="email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address',
                                                    },
                                                })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                placeholder="Enter"
                                                disabled={isEditMode}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                            )}
                                        </div>

                                        {!isEditMode && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Create Password <span className='text-red-500'>*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        autoComplete='new-password'
                                                        type={showPassword ? "text" : "password"}
                                                        {...register('password', {
                                                            required: isEditMode ? false : 'Password is required',
                                                        })}
                                                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                        placeholder="Enter"
                                                        disabled={isEditMode}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showPassword ? (
                                                            <IoEyeOffOutline className="w-5 h-5" />
                                                        ) : (
                                                            <IoEyeOutline className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors cursor-pointer font-medium text-sm"
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

        <SelectCourseModal
            isOpen={isCourseModalOpen}
            onClose={() => setIsCourseModalOpen(false)}
            onSelect={(course) => {
                setSelectedCourse(course);
                setIsCourseModalOpen(false);
            }}
        />
    </>);
};

export default AddTutorModal;

