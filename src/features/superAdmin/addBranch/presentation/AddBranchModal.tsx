import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { auth, db, storage } from '../../../../firebaseConfig';
import toast from 'react-hot-toast';
import FormLoading from '../../../../general/components/FormLoading';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import type { BranchProps } from '../data/branchTypes';
import { doc, updateDoc, collection, Timestamp, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import LoadImage from '../../../../general/components/LoadImage';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';
import { addBranch, updateBranchData } from '../../branches/redux/branchesSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';

export interface BranchFormData {
    branchName: string;
    phoneNumber: string;
    address: string;
    contactName: string;
    alternativeNumber?: string;
    bankDetails: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        qrCodeUrl?: string;
    };
    qrCode: FileList;
}

interface AddBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    branch?: BranchProps & { id: string } | null;
}

const defaultValues: Omit<BranchFormData, 'qrCode'> = {
    branchName: '',
    phoneNumber: '',
    address: '',
    contactName: '',
    alternativeNumber: '',
    bankDetails: {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        qrCodeUrl: '',
    },
};

const AddBranchModal: React.FC<AddBranchModalProps> = ({ isOpen, onClose, mode = 'create', branch }) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewQrCode, setPreviewQrCode] = useState<string | null>(branch?.bankDetails?.qrCodeUrl || null);
    const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
    const isEditMode = mode === 'edit';
    const dispatch: AppDispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<BranchFormData>({
        defaultValues: {
            ...defaultValues,
            qrCode: undefined as any,
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            reset({
                ...defaultValues,
                qrCode: undefined as any,
            });
            setPreviewQrCode(null);
            setSelectedQrFile(null);
        }
    }, [isOpen, reset]);

    useEffect(() => {
        if (isOpen && branch) {
            reset({
                branchName: branch.branchName,
                phoneNumber: branch.phoneNumber,
                address: branch.address,
                contactName: branch.contactName,
                alternativeNumber: branch.alternativeNumber || '',
                bankDetails: {
                    bankName: branch.bankDetails.bankName,
                    accountHolderName: branch.bankDetails.accountHolderName,
                    accountNumber: branch.bankDetails.accountNumber,
                    ifscCode: branch.bankDetails.ifscCode,
                    qrCodeUrl: branch.bankDetails.qrCodeUrl || '',
                },
                qrCode: undefined as any,
            });
            setPreviewQrCode(branch.bankDetails.qrCodeUrl || null);
        }
    }, [branch, isOpen, reset]);

    // Handle QR Code Image Preview
    const handleQrCodeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > 50) {
            try {
                const options = {
                    maxSizeMB: 0.05, // Target 50KB
                    maxWidthOrHeight: 500, // Reduce resolution for better compression
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(file, options);
                const compressedSizeKB = compressedFile.size / 1024;

                if (compressedSizeKB > 50) {
                    toast.error("Unable to compress image below 50KB.");
                    return;
                }

                setSelectedQrFile(compressedFile);
                setPreviewQrCode(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Image compression error:", error);
                toast.error("Failed to compress image.");
            }
        } else {
            setSelectedQrFile(file);
            setPreviewQrCode(URL.createObjectURL(file));
        }
    };

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return phone;
        return phone.startsWith('+') ? phone : `+${phone}`;
    };

    const onSubmitForm = async (data: BranchFormData) => {
        try {
            setLoading(true);

            const branchRef = doc(collection(db, "branches"));
            let qrCodeUrl = branch?.bankDetails?.qrCodeUrl || null;
            let qrCodeName = branch? branch.id : branchRef.id;

            // Upload QR Code Image if selected
            if (selectedQrFile) {
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error("User not authenticated");

                const storageRef = ref(storage, `branches/qrCodes/${qrCodeName}`);
                await uploadBytes(storageRef, selectedQrFile);
                qrCodeUrl = await getDownloadURL(storageRef);
            }

            if (isEditMode) {
                if (!branch) throw new Error("Branch not found");

                const updatedBranch: Partial<BranchProps> = {
                    branchName: data.branchName,
                    phoneNumber: formatPhoneNumber(data.phoneNumber),
                    address: data.address,
                    contactName: data.contactName,
                    alternativeNumber: formatPhoneNumber(data.alternativeNumber || ''),
                    bankDetails: {
                        bankName: data.bankDetails.bankName,
                        accountHolderName: data.bankDetails.accountHolderName,
                        accountNumber: data.bankDetails.accountNumber,
                        ifscCode: data.bankDetails.ifscCode,
                        qrCodeUrl: qrCodeUrl || null
                    },
                    keywords: keywordsBuilder(`${data.branchName.trim()} ${data.phoneNumber.trim()}`),
                    updatedAt: serverTimestamp() as Timestamp,
                };

                // Update branch document
                const branchRef = doc(db, "branches", branch.id);
                await updateDoc(branchRef, updatedBranch);
                dispatch(updateBranchData({ ...branch, ...updatedBranch }));

                toast.success("Branch updated successfully!");
                onClose();
                return;
            }

            // Create branch document directly in Firestore
            const newBranch: BranchProps = {
                id: branchRef.id,
                branchName: data.branchName,
                phoneNumber: formatPhoneNumber(data.phoneNumber),
                address: data.address,
                contactName: data.contactName,
                alternativeNumber: formatPhoneNumber(data.alternativeNumber || ''),
                bankDetails: {
                    bankName: data.bankDetails.bankName,
                    accountHolderName: data.bankDetails.accountHolderName,
                    accountNumber: data.bankDetails.accountNumber,
                    ifscCode: data.bankDetails.ifscCode,
                    qrCodeUrl: qrCodeUrl || null,
                },
                createdAt: serverTimestamp() as Timestamp,
                keywords: keywordsBuilder(`${data.branchName.trim()} ${data.phoneNumber.trim()}`),
                isActive: true,
            };

            // Add branch document to Firestore
            await setDoc(branchRef, newBranch);
            dispatch(addBranch(newBranch));
            toast.success("Branch created successfully!");

            onClose();
        } catch (error: any) {
            console.error("❌ Error creating branch:", error);
            toast.error(error.message || "An unexpected error occurred");
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
                        className="relative z-40 w-full max-w-3xl bg-gray-100 rounded-[14px] overflow-hidden shadow-xl"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-secondary px-6 py-3 flex items-center justify-between">
                            <h2 className="text-white text-base font-semibold">{isEditMode ? 'Edit Branch' : 'Add Branch'}</h2>
                            <button
                                onClick={onClose}
                                className="rounded-full scale-100 hover:scale-105 duration-300 cursor-pointer"
                                aria-label="Close"
                            >
                                <IoMdCloseCircleOutline className="text-white w-6 h-6" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 max-h-[90vh] overflow-y-auto">
                            <div className="space-y-5">
                                {/* Branch Name - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Branch Name
                                    </label>
                                    <input
                                        type="text"
                                        {...register('branchName', { required: 'Branch name is required' })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                        placeholder="Enter branch name"
                                    />
                                    {errors.branchName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.branchName.message}</p>
                                    )}
                                </div>

                                {/* Number - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number <span className='text-red-500'>*</span>
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
                                            }
                                        }}
                                        render={({ field }) => (
                                            <PhoneInput
                                                country={'in'}
                                                value={field.value || ''}
                                                onChange={(value) => field.onChange(value)}
                                                inputClass="!w-full !py-2.5 !px-4 !pl-14 !rounded-md !text-sm !font-normal !bg-white !border !border-gray-300 !focus:border-primary !focus:ring-2 !focus:ring-primary/20 !transition-all !duration-300"
                                                inputProps={{
                                                    name: 'phoneNumber',
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
                                    {errors.phoneNumber && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                                    )}
                                </div>

                                {/* Address - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        {...register('address', { required: 'Address is required' })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                        placeholder="Enter address"
                                    />
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                    )}
                                </div>

                                {/* Contact Name and Alternative Number - Two Columns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('contactName', { required: 'Contact name is required' })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                            placeholder="Enter contact name"
                                        />
                                        {errors.contactName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Alternative Number
                                        </label>
                                        <Controller
                                            name="alternativeNumber"
                                            control={control}
                                            render={({ field }) => (
                                                <PhoneInput
                                                    country={'in'}
                                                    value={field.value || ''}
                                                    onChange={(value) => field.onChange(value)}
                                                    inputClass="!w-full !py-2.5 !px-4 !pl-14 !rounded-md !text-sm !font-normal !bg-white !border !border-gray-300 !focus:border-primary !focus:ring-2 !focus:ring-primary/20 !transition-all !duration-300"
                                                    inputProps={{
                                                        name: 'alternativeNumber',
                                                        placeholder: 'Enter alternative number',
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
                                        {errors.alternativeNumber && (
                                            <p className="mt-1 text-sm text-red-600">{errors.alternativeNumber.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Bank Details Section */}
                                <div className="border-t pt-5 mt-5 border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">Bank Details</h3>

                                    <div className="space-y-4">
                                        {/* Bank Name - Full Width */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bank Name
                                            </label>
                                            <input
                                                type="text"
                                                {...register('bankDetails.bankName', { required: 'Bank name is required' })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                placeholder="Enter bank name"
                                            />
                                            {errors.bankDetails?.bankName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.bankDetails.bankName.message}</p>
                                            )}
                                        </div>

                                        {/* Account Holder Name - Full Width */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Account Holder Name
                                            </label>
                                            <input
                                                type="text"
                                                {...register('bankDetails.accountHolderName', { required: 'Account holder name is required' })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                placeholder="Enter account holder name"
                                            />
                                            {errors.bankDetails?.accountHolderName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.bankDetails.accountHolderName.message}</p>
                                            )}
                                        </div>

                                        {/* Account Number and IFSC Code - Two Columns */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bank Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('bankDetails.accountNumber', { required: 'Account number is required' })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                    placeholder="Enter account number"
                                                />
                                                {errors.bankDetails?.accountNumber && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.bankDetails.accountNumber.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    IFSC Code
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('bankDetails.ifscCode', { required: 'IFSC code is required' })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none text-sm"
                                                    placeholder="Enter IFSC code"
                                                />
                                                {errors.bankDetails?.ifscCode && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.bankDetails.ifscCode.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* QR Code Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Add QR Code
                                            </label>
                                            <label
                                                htmlFor="qr-code-upload"
                                                className="cursor-pointer block w-full"
                                            >
                                                <div className="w-full max-w-[200px] border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-center hover:border-primary transition-colors">
                                                    {previewQrCode ? (
                                                        <div className="relative w-full h-32 flex items-center justify-center">
                                                            <LoadImage
                                                                index={0}
                                                                className="object-cover max-h-32 rounded-md"
                                                                src={previewQrCode}
                                                                alt="QR Code preview"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500">
                                                                Click to upload QR code
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                JPG, PNG (Max 50KB)
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    id="qr-code-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    {...register("qrCode")}
                                                    onChange={handleQrCodeChange}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-end mt-8">
                                <button
                                    disabled={loading}
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
    );
};

export default AddBranchModal;

