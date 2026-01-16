import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOfficeBuilding, HiHashtag, HiBriefcase, HiDocumentText, HiLocationMarker, HiMap, HiMail, HiEye, HiEyeOff, HiUser } from 'react-icons/hi';
import { Constants } from '../../../../general/constants/constants';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../../firebaseConfig';
import type { Timestamp } from 'firebase/firestore';
import type { UserProps } from '../../data/userTypes';
import type { CompanyProps, BranchProps } from '../../data/companyTypes';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { verifyAndLoadUser } from '../../utils/verifyAndLoadUser';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterFormData {
    ownerName: string;
    mobileNumber: string;
    email: string;
    password: string;
    companyName: string;
    companyNumber: string;
    businessType: string;
    gstNumber?: string | null;
    // imageUrl?: string | null;
    address?: string | null;
    state: string;
}

const RegisterForm = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        trigger,
    } = useForm<RegisterFormData>({
        mode: 'onTouched',
    });

    const onFormSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            // Check if email already exists in users collection
            const usersRef = collection(db, 'users');
            const emailQuery = query(usersRef, where('email', '==', data.email.toLowerCase().trim()));
            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                toast.error('Email already exists. Please use a different email or login.');
                setLoading(false);
                return;
            }

            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email.toLowerCase().trim(),
                data.password
            );
            const userId = userCredential.user.uid;

            // Create company document in companies collection
            const companyDocRef = doc(collection(db, 'companies'));

            // Create user document in users collection
            const userDocRef = doc(db, 'users', userId);

            const keywords = keywordsBuilder(data.companyName.trim() + " " + data.email.toLowerCase().trim());
            const userData: UserProps = {
                id: userId,
                name: data.ownerName.trim(),
                companyId: companyDocRef.id,
                email: data.email.toLowerCase().trim(),
                createdAt: serverTimestamp() as Timestamp,
                role: 'admin',
                keywords: keywords,
                isActive: true,
            };
            await setDoc(userDocRef, userData);

            // Create initial branch with random UID
            const initialBranchId = uuidv4();
            const initialBranch: BranchProps = {
                id: initialBranchId,
                isActive: true,
                isInitialBranch: true,
                branchName: data.companyName.trim(),
                contactInfo: {
                    email: data.email.toLowerCase().trim(),
                    phoneNumber: data.mobileNumber,
                    whatsappNumber: null,
                },
                location: {
                    deliveryDistance: null,
                    latitude: null,
                    longitude: null,
                },
                createdAt: serverTimestamp() as Timestamp,
            };

            const companyData: CompanyProps = {
                id: companyDocRef.id,
                userId: userId,
                isActive: true,
                keywords: keywords,
                createdAt: serverTimestamp() as Timestamp,
                owner: {
                    ownerName: data.ownerName.trim(),
                    mobileNumber: data.mobileNumber,
                    email: data.email.toLowerCase().trim(),
                },
                companyInfo: {
                    companyName: data.companyName.trim(),
                    companyNumber: data.companyNumber.trim(),
                    businessType: data.businessType,
                    gstNumber: data.gstNumber || null,
                    address: data.address || null,
                    state: data.state.trim(),
                },
                branches: {
                    [initialBranchId]: initialBranch,
                },
            };
            await setDoc(companyDocRef, companyData);

            toast.success('Registration successful! Welcome to EmploTrackEZ.');
            console.log('Registration successful:', { userId, companyId: companyDocRef.id });

            const verifyAndLoadUserResult = await verifyAndLoadUser(dispatch);
            if (verifyAndLoadUserResult.status === 'success') {
                navigate(verifyAndLoadUserResult.path as string, { replace: true });
            } else {
                toast.error(verifyAndLoadUserResult.message);
            }

        } catch (error: any) {
            console.error('Error submitting form:', error);
            let errorMessage = 'Registration failed. Please try again.';

            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Email is already registered. Please use a different email or login.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address. Please check your email.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                        break;
                    default:
                        errorMessage = `Registration error: ${error.message || error.code}`;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        const step1Fields: (keyof RegisterFormData)[] = [
            'ownerName',
            'mobileNumber',
            'companyName',
            'companyNumber',
            'businessType',
            'state'
        ];

        const isValid = await trigger(step1Fields);
        if (isValid) {
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const businessTypes = [
        'Sole Proprietorship',
        'Partnership',
        'Private Limited Company',
        'Public Limited Company',
        'LLP (Limited Liability Partnership)',
        'One Person Company',
        'Other'
    ];

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <img
                    src={Constants.APP_LOGO}
                    alt="Skytex Logo"
                    className="h-12 w-auto"
                />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Register your company!
            </h2>

            {/* Step Indicator */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2">
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: currentStep >= 1 ? '#0095DA' : '#D1D5DB',
                            color: currentStep >= 1 ? '#FFFFFF' : '#4B5563',
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    >
                        1
                    </motion.div>
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: currentStep >= 2 ? '#0095DA' : '#D1D5DB',
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-24 h-1"
                    />
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: currentStep >= 2 ? '#0095DA' : '#D1D5DB',
                            color: currentStep >= 2 ? '#FFFFFF' : '#4B5563',
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    >
                        2
                    </motion.div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <AnimatePresence mode="wait">
                    {/* Step 1: Company Details */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-5"
                        >
                            {/* Owner Name Field */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('ownerName', {
                                            required: 'Owner name is required',
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'Owner name cannot be empty';
                                                }
                                                if (value.trim().length < 2) {
                                                    return 'Owner name must be at least 2 characters';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none text-sm transition-all ${errors.ownerName
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="Owner Name"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.ownerName && (
                                    <p className="mt-1 text-xs text-red-600">{errors.ownerName.message}</p>
                                )}
                            </div>

                            {/* Mobile Number Field */}
                            <div>
                                <Controller
                                    name="mobileNumber"
                                    control={control}
                                    rules={{
                                        required: 'Mobile number is required',
                                        validate: (value) => {
                                            if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                                                return 'Mobile number is required';
                                            }
                                            const phoneValue = String(value);
                                            if (phoneValue.length < 8) {
                                                return 'Please enter a valid mobile number';
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field }) => (
                                        <PhoneInput
                                            country={'in'}
                                            value={field.value || ''}
                                            onChange={(value) => field.onChange(value)}
                                            inputClass={`!w-full !py-3 !px-4 !pl-14 !rounded-lg !text-sm !font-normal !bg-white !border !transition-all !duration-300 ${errors.mobileNumber
                                                ? '!border-red-500 focus:!border-red-500 focus:!ring-2 focus:!ring-red-500/20'
                                                : '!border-gray-300 focus:!border-primary focus:!ring-2 focus:!ring-primary/20'
                                                }`}
                                            inputProps={{
                                                name: 'mobileNumber',
                                                placeholder: 'Mobile Number',
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
                                {errors.mobileNumber && (
                                    <p className="mt-1 text-xs text-red-600">{errors.mobileNumber.message}</p>
                                )}
                            </div>

                            {/* Company Name Field */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiOfficeBuilding className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('companyName', {
                                            required: 'Company name is required',
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'Company name cannot be empty';
                                                }
                                                if (value.trim().length < 2) {
                                                    return 'Company name must be at least 2 characters';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none text-sm transition-all ${errors.companyName
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="Company Name"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.companyName && (
                                    <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>
                                )}
                            </div>

                            {/* Company Number Field */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiHashtag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('companyNumber', {
                                            required: 'Company number is required',
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'Company number cannot be empty';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none text-sm transition-all ${errors.companyNumber
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="Company Number"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.companyNumber && (
                                    <p className="mt-1 text-xs text-red-600">{errors.companyNumber.message}</p>
                                )}
                            </div>

                            {/* Business Type Field */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <HiBriefcase className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        {...register('businessType', {
                                            required: 'Business type is required',
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'Business type cannot be empty';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none text-sm transition-all appearance-none bg-white ${errors.businessType
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        disabled={loading}
                                    >
                                        <option value="">Select Business Type</option>
                                        {businessTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.businessType && (
                                    <p className="mt-1 text-xs text-red-600">{errors.businessType.message}</p>
                                )}
                            </div>

                            {/* State Field */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiMap className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('state', {
                                            required: 'State is required',
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'State cannot be empty';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none text-sm transition-all ${errors.state
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="State"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.state && (
                                    <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>
                                )}
                            </div>

                            {/* GST Number Field (Optional) */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiDocumentText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('gstNumber', {
                                            setValueAs: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return null;
                                                }
                                                return value.trim();
                                            }
                                        })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                        placeholder="GST Number (Optional)"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Address Field (Optional) */}
                            <div>
                                <div className="relative">
                                    <div className="absolute top-3 left-4 flex items-start pointer-events-none">
                                        <HiLocationMarker className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        {...register('address', {
                                            setValueAs: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return null;
                                                }
                                                return value.trim();
                                            }
                                        })}
                                        rows={3}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all resize-none"
                                        placeholder="Address (Optional)"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Next Button for Step 1 */}
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                                className="w-full py-3 px-4 rounded-lg text-white font-medium text-sm transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-[#1D256F] shadow-lg shadow-primary/30"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Email and Password */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-5"
                        >
                            {/* Email Field */}
                            <div>
                                <p className="text-sm text-gray-500 mb-4">Set your company email and a strong password.</p>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'Email cannot be empty';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none text-sm transition-all ${errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="Email"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <HiEye className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', {
                                            required: 'Password is required',
                                            validate: (value) => {
                                                if (!value || value.trim().length === 0) {
                                                    return 'Password cannot be empty';
                                                }
                                                if (value.length < 6) {
                                                    return 'Password must be at least 6 characters';
                                                }
                                                return true;
                                            }
                                        })}
                                        className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none text-sm transition-all ${errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            }`}
                                        placeholder="Password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <HiEyeOff className="h-5 w-5" />
                                        ) : (
                                            <HiEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Back and Submit Buttons for Step 2 */}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 rounded-lg text-gray-700 font-medium text-sm transition-all duration-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 border border-gray-300"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 rounded-lg text-white font-medium text-sm transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-[#1D256F] shadow-lg shadow-primary/30"
                                >
                                    {loading ? 'Loading...' : 'Register'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
};

export default RegisterForm;

