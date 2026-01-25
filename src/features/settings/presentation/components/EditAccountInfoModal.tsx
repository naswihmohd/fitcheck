import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useDispatch } from 'react-redux';
import { updateApplicationData } from '../../redux/generalSlice';
import type { ApplicationProps } from '../../data/applicationTypes';
import type { AppDispatch } from '../../../../general/redux/store';

interface EditAccountInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountData: ApplicationProps | null;
}

interface AccountFormData {
    companyName: string;
    email: string;
    phoneNumber: string;
    taxNumber: string;
    country: string;
    currency: string;
    address: string;
}

const EditAccountInfoModal: React.FC<EditAccountInfoModalProps> = ({ isOpen, onClose, accountData }) => {
    const dispatch: AppDispatch = useDispatch();
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<AccountFormData>({
        defaultValues: {
            companyName: '',
            email: '',
            phoneNumber: '',
            taxNumber: '',
            country: 'United States',
            currency: '$',
            address: '',
        },
        mode: 'onTouched',
    });


    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && accountData?.companyInfo) {
            reset({
                companyName: accountData.companyInfo.companyName || '',
                email: accountData.companyInfo.email || '',
                phoneNumber: accountData.companyInfo.phoneNumber || '',
                taxNumber: accountData.companyInfo.taxNumber || '',
                country: accountData.companyInfo.country || 'United States',
                currency: accountData.companyInfo.currency || '$',
                address: accountData.companyInfo.address || '',
            });
        } else if (isOpen && !accountData) {
            reset({
                companyName: '',
                email: '',
                phoneNumber: '',
                taxNumber: '',
                country: 'United States',
                currency: '$',
                address: '',
            });
        }
    }, [isOpen, accountData, reset]);

    const onSubmit = async (data: AccountFormData) => {
        try {
            setIsSubmitting(true);

            const docRef = doc(db, 'general', 'applicationData');

            const accountDataToSave: ApplicationProps = {
                companyInfo: {
                    companyName: data.companyName.trim(),
                    email: data.email.trim().toLowerCase(),
                    phoneNumber: data.phoneNumber.trim(),
                    taxNumber: data.taxNumber.trim(),
                    country: data.country.trim(),
                    currency: data.currency.trim(),
                    address: data.address.trim(),
                },
            };

            await setDoc(docRef, accountDataToSave, { merge: true });

            // Update Redux state immediately
            dispatch(updateApplicationData({ applicationData: accountDataToSave }));

            toast.success('Account information updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving account data:', error);
            toast.error('Failed to save account information. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
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
                        className="z-40 w-full max-w-[500px] h-full bg-white flex flex-col rounded-l-[14px] shadow-xl"
                        initial={{ opacity: 0, x: 500 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 500 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Fixed Header */}
                        <div className="flex bg-primary rounded-tl-[14px] items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-base font-semibold text-white">
                                Edit Account Information
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <HiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="space-y-5">
                                    {/* Company Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('companyName', {
                                                required: 'Company name is required',
                                                minLength: {
                                                    value: 1,
                                                    message: 'Company name must be at least 1 character',
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="Enter company name"
                                        />
                                        {errors.companyName && (
                                            <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'Invalid email address',
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            rules={{
                                                required: 'Phone number is required',
                                                validate: (value) => {
                                                    if (!value || value.length < 8) {
                                                        return 'Please enter a valid phone number';
                                                    }
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => (
                                                <PhoneInput
                                                    country={'us'}
                                                    value={field.value || ''}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                    }}
                                                    inputClass={`!w-full !py-2 !px-4 !pl-14 !rounded-lg !text-sm !font-normal !bg-white !border !transition-all !duration-300 ${
                                                        errors.phoneNumber
                                                            ? '!border-red-500 '
                                                            : '!border-gray-200'
                                                    }`}
                                                    inputProps={{
                                                        name: 'phoneNumber',
                                                        placeholder: 'Enter phone number',
                                                        autoComplete: 'tel',
                                                    }}
                                                    countryCodeEditable={true}
                                                    containerClass="w-full"
                                                    enableSearch
                                                    disableSearchIcon={false}
                                                    preferredCountries={['us', 'gb', 'ca', 'au', 'in']}
                                                    onFocus={(e) => {
                                                        const length = e.target.value.length;
                                                        e.target.setSelectionRange(length, length);
                                                    }}
                                                />
                                            )}
                                        />
                                        {errors.phoneNumber && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.phoneNumber.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tax Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tax Number (VAT/GST) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('taxNumber', {
                                                required: 'Tax number is required',
                                                minLength: {
                                                    value: 1,
                                                    message: 'Tax number is required',
                                                },
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                            placeholder="Enter tax number"
                                        />
                                        {errors.taxNumber && (
                                            <p className="mt-1 text-xs text-red-500">{errors.taxNumber.message}</p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('country', {
                                                required: 'Country is required',
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                        >
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="India">India</option>
                                            <option value="Germany">Germany</option>
                                            <option value="France">France</option>
                                            <option value="Italy">Italy</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Japan">Japan</option>
                                            <option value="China">China</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="United Arab Emirates">United Arab Emirates</option>
                                            <option value="Saudi Arabia">Saudi Arabia</option>
                                        </select>
                                        {errors.country && (
                                            <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>
                                        )}
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Currency <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('currency', {
                                                required: 'Currency is required',
                                            })}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none"
                                        >
                                            <option value="$">$ (USD)</option>
                                            <option value="£">£ (GBP)</option>
                                            <option value="€">€ (EUR)</option>
                                            <option value="₹">₹ (INR)</option>
                                            <option value="¥">¥ (JPY)</option>
                                            <option value="A$">A$ (AUD)</option>
                                            <option value="C$">C$ (CAD)</option>
                                            <option value="CHF">CHF</option>
                                            <option value="CN¥">CN¥ (CNY)</option>
                                            <option value="R$">R$ (BRL)</option>
                                            <option value="₽">₽ (RUB)</option>
                                            <option value="₩">₩ (KRW)</option>
                                            <option value="AED">AED</option>
                                            <option value="SAR">SAR</option>
                                        </select>
                                        {errors.currency && (
                                            <p className="mt-1 text-xs text-red-500">{errors.currency.message}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            {...register('address', {
                                                required: 'Address is required',
                                                minLength: {
                                                    value: 1,
                                                    message: 'Address is required',
                                                },
                                            })}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 transition focus:border-primary outline-none resize-none"
                                            placeholder="Enter address"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="flex gap-2 justify-end px-5 py-3 border-t border-gray-200 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
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

export default EditAccountInfoModal;
