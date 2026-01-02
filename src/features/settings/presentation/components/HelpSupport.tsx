import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { RootState, AppDispatch } from '../../../../general/redux/store';
import { setBranchData } from '../../../login/redux/authSlice';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface HelpSupportFormData {
    whatsappNumber: string;
    email: string;
    contactNumber: string;
}

const defaultValues: HelpSupportFormData = {
    whatsappNumber: '',
    email: '',
    contactNumber: '',
};

const HelpSupport: React.FC = () => {
    const { branchData } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<HelpSupportFormData>(defaultValues);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        watch,
    } = useForm<HelpSupportFormData>({
        defaultValues,
    });

    const currentValues = watch();

    // Load initial values from branchData
    useEffect(() => {
        if (branchData?.helpSupport) {
            const initialData = {
                whatsappNumber: branchData.helpSupport.whatsappNumber || '',
                email: branchData.helpSupport.email || '',
                contactNumber: branchData.helpSupport.contactNumber || '',
            };
            setInitialValues(initialData);
            reset(initialData);
        }
    }, [branchData, reset]);

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return phone;
        return phone.startsWith('+') ? phone : `+${phone}`;
    };

    // Normalize phone number for comparison (remove + and spaces)
    const normalizePhone = (phone: string) => {
        if (!phone) return '';
        return phone.replace(/[\s+]/g, '');
    };

    // Check if form values have changed from initial values
    const hasChanges = useMemo(() => {
        const normalizedCurrent = {
            whatsappNumber: normalizePhone(currentValues.whatsappNumber || ''),
            email: (currentValues.email || '').trim(),
            contactNumber: normalizePhone(currentValues.contactNumber || ''),
        };

        const normalizedInitial = {
            whatsappNumber: normalizePhone(initialValues.whatsappNumber || ''),
            email: (initialValues.email || '').trim(),
            contactNumber: normalizePhone(initialValues.contactNumber || ''),
        };

        return (
            normalizedCurrent.whatsappNumber !== normalizedInitial.whatsappNumber ||
            normalizedCurrent.email !== normalizedInitial.email ||
            normalizedCurrent.contactNumber !== normalizedInitial.contactNumber
        );
    }, [currentValues, initialValues]);

    const onSubmitForm = async (data: HelpSupportFormData) => {
        if (!branchData) {
            toast.error("Branch data not found");
            return;
        }

        try {
            setLoading(true);
            const updatedHelpSupport = {
                whatsappNumber: formatPhoneNumber(data.whatsappNumber),
                email: data.email,
                contactNumber: formatPhoneNumber(data.contactNumber),
            };

            // Update Firestore
            const branchRef = doc(db, "branches", branchData.id);
            await updateDoc(branchRef, {
                helpSupport: updatedHelpSupport,
            });

            // Update Redux state
            dispatch(setBranchData({
                ...branchData,
                helpSupport: updatedHelpSupport,
            }));

            toast.success('Help & Support details updated successfully!');
        } catch (error: any) {
            console.error('Error saving help & support details:', error);
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
            }}
        >
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Help & Support
                </h2>
                <p className="text-sm text-gray-600">
                    Add details for connect for employees
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                {/* WhatsApp Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <label className="block text-sm font-medium text-gray-700 sm:w-48 flex-shrink-0">
                        WhatsApp Number
                    </label>
                    <div className="flex-1">
                        <Controller
                            name="whatsappNumber"
                            control={control}
                            rules={{
                                required: 'WhatsApp number is required',
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
                                        name: 'whatsappNumber',
                                        required: true,
                                        placeholder: 'Enter WhatsApp number',
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
                        {errors.whatsappNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber.message}</p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <label className="block text-sm font-medium text-gray-700 sm:w-48 flex-shrink-0">
                        E-Mail
                    </label>
                    <div className="flex-1">
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                            placeholder="enter email address"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>
                </div>

                {/* Contact Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <label className="block text-sm font-medium text-gray-700 sm:w-48 flex-shrink-0">
                        Contact Number
                    </label>
                    <div className="flex-1">
                        <Controller
                            name="contactNumber"
                            control={control}
                            rules={{
                                required: 'Contact number is required',
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
                                        name: 'contactNumber',
                                        required: true,
                                        placeholder: 'Enter contact number',
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
                        {errors.contactNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
                        )}
                    </div>
                </div>

                {/* Update & Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !hasChanges}
                        className={`w-fit px-6 py-2.5  text-white rounded-md transition-colors font-medium text-sm ${
                            loading || !hasChanges ? 'opacity-50 cursor-not-allowed bg-gray-800' : 'cursor-pointer bg-primary hover:bg-primary/90'
                        }`}
                    >
                        {loading ? 'Saving...' : 'Update & Save'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default HelpSupport;

