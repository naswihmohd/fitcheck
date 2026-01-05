import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { auth, db } from '../../../../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import FormLoading from '../../../../../general/components/FormLoading';
import { CloudFunctionsURLs } from '../../../../../general/constants/constants';
import type { UserProps } from '../../../../login/data/userTypes';
import { addBranchUser } from '../../redux/branchUsersSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../../general/redux/store';

export interface LoginFormData {
    name: string;
    email: string;
    password: string;
}

interface CreateLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    user?: UserProps | null;
    branchId: string;
}

const defaultValues: LoginFormData = {
    name: '',
    email: '',
    password: '',
};

const CreateLoginModal: React.FC<CreateLoginModalProps> = ({ 
    isOpen, 
    onClose, 
    mode = 'create', 
    user,
    branchId
}) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isEditMode = mode === 'edit';
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormData>({
        defaultValues,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            reset(defaultValues);
            setShowPassword(false);
        }
    }, [isOpen, reset]);

    useEffect(() => {
        if (isOpen && user && isEditMode) {
            reset({
                name: user.name,
                email: user.email,
                password: '', // Don't show password in edit mode
            });
        }
    }, [user, isOpen, isEditMode, reset]);

    const onSubmitForm = async (data: LoginFormData) => {

        if(!branchId) {
            toast.error("Something went wrong. Please try again.");
            return;
        }
        
        try {
            setLoading(true);

            if (isEditMode) {
                if (!user) throw new Error("User not found");

                // In edit mode, only update the name
                const updatedData = {
                    name: data.name,
                };

                // Update Firestore document
                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, updatedData);

                toast.success("Login user updated successfully!");
                onClose();
                return;
            }

            // Create mode - call cloud function
            // ✅ Check authentication
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not authenticated");

            // ✅ Get Firebase ID token
            const idToken = await currentUser.getIdToken();

            // ✅ Cloud Function URL
            const url = CloudFunctionsURLs.CREATE_LOGIN_USER;
            if (!url) throw new Error("Cloud Function URL not configured");

            // ✅ Make HTTPS request
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    branchId: branchId,
                }),
            });

            // ✅ Parse JSON response
            const result = await response.json();

            // ✅ Handle response cases
            if (!response.ok) {
                console.error("Create login user failed:", result);
                toast.error(result.message || "Failed to create login user");
                return;
            }

            dispatch(addBranchUser({ branchId: branchId, user: result.user }));

            console.log("✅ Login user created successfully:", result);
            toast.success("Login user created successfully!");
            onClose();
        } catch (error: any) {
            console.error('❌ Error submitting form:', error);
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
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
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative z-40 w-full max-w-xl bg-gray-100 rounded-[14px] overflow-hidden shadow-xl"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Dark Gray */}
                        <div className="bg-secondary px-6 py-3 flex items-center justify-between">
                            <h2 className="text-white text-base font-semibold">
                                {isEditMode ? 'Edit Login' : 'Create Login'}
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
                        <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6">
                            <div className="space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        {...register('name', { required: 'Name is required' })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                                        placeholder="Enter name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add Email
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email', { 
                                            required: isEditMode ? false : 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter email"
                                        disabled={isEditMode}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                {!isEditMode && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Create Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                autoComplete='new-password'
                                                type={showPassword ? "text" : "password"}
                                                {...register('password', { 
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Password must be at least 6 characters'
                                                    }
                                                })}
                                                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                                                placeholder="Enter password"
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

                            {/* Action Button - Black, Bottom Right */}
                            <div className="flex justify-end mt-8">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="px-6 py-2.5 bg-secondary text-white rounded-md hover:bg-gray-800 transition-colors cursor-pointer font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
};

export default CreateLoginModal;

