import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePickerStyles.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../general/redux/store';
import { employeeStoreToDatabase, getEmployeeFromDatabase } from '../../utils/employeeStoreToDatabase';

interface EmployeeFormData {
    // Basic Details
    fullName: string;
    gender: string;
    bloodGroup: string;
    email: string;
    phoneNumber: string;
    address: string;
    companyJoiningDate: Date | null;
    dateOfBirth: Date | null;

    // Branch Details
    branchId: string;
    departmentId: string;
    designationId: string;
    shiftDocId: string;
    shiftId: string;
    employmentType: 'fullTime' | 'partTime' | 'intern';
    role: 'employee' | 'attendanceManager';
    attendanceType: 'swipe' | 'selfie';
    isGeoFencing: boolean;
    salaryType: 'monthly' | 'hourly' | 'yearly' | 'daily';
    salaryAmount: string;

    // Bank Details (optional)
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    upiId: string;

    // Emergency Contact Details (optional)
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactCountryCode: string;
    emergencyContactAddress: string;
    emergencyContactRelation: string;
}

// Custom Date Picker Wrapper Component
interface DatePickerWrapperProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    hasError?: boolean;
    placeholder?: string;
}

const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
    value,
    onChange,
    hasError = false,
    placeholder = 'Select date',
}) => {
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
                        placeholderText={placeholder}
                        className="w-full border-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 cursor-pointer"
                        wrapperClassName="w-full custom-datepicker-wrapper"
                        popperClassName="custom-datepicker-popper"
                    />
                </div>
            </div>
        </div>
    );
};

const AddEmployee: React.FC = () => {
    const navigate = useNavigate();
    const { employeeId } = useParams<{ employeeId?: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { companyId, branchId } = useSelector((state: RootState) => state.user);
    const isEditMode = !!employeeId;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<EmployeeFormData>({
        defaultValues: {
            fullName: '',
            gender: '',
            bloodGroup: '',
            email: '',
            phoneNumber: '',
            address: '',
            companyJoiningDate: null,
            dateOfBirth: null,
            branchId: branchId || '',
            departmentId: '',
            designationId: '',
            shiftDocId: '',
            shiftId: '',
            employmentType: 'fullTime',
            role: 'employee',
            attendanceType: 'selfie',
            isGeoFencing: false,
            salaryType: 'monthly',
            salaryAmount: '',
            accountNumber: '',
            bankName: '',
            branchName: '',
            ifscCode: '',
            upiId: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactCountryCode: '+1',
            emergencyContactAddress: '',
            emergencyContactRelation: '',
        },
        mode: 'onTouched',
    });

    // Load employee data if in edit mode
    useEffect(() => {
        const loadEmployeeData = async () => {
            if (!isEditMode || !employeeId || !companyId) return;

            setIsLoading(true);
            try {
                const employee = await getEmployeeFromDatabase(companyId, employeeId);
                
                if (!employee) {
                    toast.error('Employee not found');
                    navigate('/attendance/employee-management');
                    return;
                }

                // Parse Timestamp or date string to Date objects
                const parseDate = (dateValue: any): Date | null => {
                    if (!dateValue) return null;
                    // If it's a Firestore Timestamp, convert to Date
                    if (dateValue && typeof dateValue.toDate === 'function') {
                        return dateValue.toDate();
                    }
                    // If it's a string, parse it
                    if (typeof dateValue === 'string') {
                        const date = new Date(dateValue);
                        return isNaN(date.getTime()) ? null : date;
                    }
                    // If it's already a Date, return it
                    if (dateValue instanceof Date) {
                        return dateValue;
                    }
                    return null;
                };

                // Extract country code from phone number if present
                const phoneNumber = employee.basicDetails.phoneNumber || '';
                const emergencyPhone = employee.emergencyContactDetails?.phoneNumber || '';
                const emergencyCountryCode = employee.emergencyContactDetails?.countryCode || '+1';

                // Reset form with employee data
                reset({
                    fullName: employee.basicDetails.fullName || '',
                    gender: employee.basicDetails.gender || '',
                    bloodGroup: employee.basicDetails.bloodGroup || '',
                    email: employee.basicDetails.email || '',
                    phoneNumber: phoneNumber,
                    address: employee.basicDetails.address || '',
                    companyJoiningDate: parseDate(employee.basicDetails.companyJoiningDate),
                    dateOfBirth: parseDate(employee.basicDetails.dateOfBirth),
                    branchId: employee.branchDetails.branchId || branchId || '',
                    departmentId: employee.branchDetails.departmentId || '',
                    designationId: employee.branchDetails.designationId || '',
                    shiftDocId: employee.branchDetails.shiftDocId || '',
                    shiftId: employee.branchDetails.shiftId || '',
                    employmentType: employee.branchDetails.employmentType || 'fullTime',
                    role: 'employee', // Default role, adjust if needed
                    attendanceType: employee.branchDetails.attendancePermission?.attendanceType || 'selfie',
                    isGeoFencing: employee.branchDetails.attendancePermission?.isGeoFencing || false,
                    salaryType: employee.branchDetails.salaryType || 'monthly',
                    salaryAmount: employee.branchDetails.salaryAmount?.toString() || '',
                    accountNumber: employee.bankDetails?.accountNumber || '',
                    bankName: employee.bankDetails?.bankName || '',
                    branchName: employee.bankDetails?.branchName || '',
                    ifscCode: employee.bankDetails?.ifscCode || '',
                    upiId: employee.bankDetails?.upiId || '',
                    emergencyContactName: employee.emergencyContactDetails?.name || '',
                    emergencyContactPhone: emergencyPhone,
                    emergencyContactCountryCode: emergencyCountryCode,
                    emergencyContactAddress: employee.emergencyContactDetails?.address || '',
                    emergencyContactRelation: employee.emergencyContactDetails?.relation || '',
                });
            } catch (error) {
                console.error('Error loading employee data:', error);
                toast.error('Failed to load employee data');
                navigate('/attendance-admin/employee-management');
            } finally {
                setIsLoading(false);
            }
        };

        loadEmployeeData();
    }, [employeeId, companyId, isEditMode, branchId, reset, navigate]);


    const onFormSubmit = async (data: EmployeeFormData) => {
        if (!companyId) {
            toast.error('Company ID is missing');
            return;
        }

        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!data.fullName || data.fullName.trim().length < 2) {
                toast.error('Full name must be at least 2 characters');
                setIsSubmitting(false);
                return;
            }

            if (!data.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
                toast.error('Please enter a valid email address');
                setIsSubmitting(false);
                return;
            }

            if (!data.phoneNumber) {
                toast.error('Phone number is required');
                setIsSubmitting(false);
                return;
            }

            if (!data.companyJoiningDate) {
                toast.error('Company joining date is required');
                setIsSubmitting(false);
                return;
            }

            if (!data.dateOfBirth) {
                toast.error('Date of birth is required');
                setIsSubmitting(false);
                return;
            }

            // Validate date of birth is before joining date
            if (data.dateOfBirth >= data.companyJoiningDate) {
                toast.error('Date of birth must be before company joining date');
                setIsSubmitting(false);
                return;
            }

            if (!data.salaryType) {
                toast.error('Salary type is required');
                setIsSubmitting(false);
                return;
            }

            if (!data.salaryAmount || parseFloat(data.salaryAmount) <= 0) {
                toast.error('Please enter a valid salary amount');
                setIsSubmitting(false);
                return;
            }

            // Save to Firebase
            await employeeStoreToDatabase(companyId, data, employeeId);
            
            toast.success(isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
            navigate('/attendance-admin/employee-management');
        } catch (error) {
            console.error('Error submitting form:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['Male', 'Female', 'Other'];
    const roles = [
        { value: 'employee', label: 'Employee' },
        { value: 'attendanceManager', label: 'AttendanceManager' },
    ];
    const attendanceTypes = [
        { value: 'swipe', label: 'Swipe' },
        { value: 'selfie', label: 'Selfie' },
    ];
    const salaryTypes = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'hourly', label: 'Hourly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'daily', label: 'Daily' },
    ];
    const relations = ['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Other'];

    // TODO: Fetch these from Redux/Firebase
    const departments = [{ id: 'dept1', name: 'IT Department' }];
    const designations = [{ id: 'desig1', name: 'Software Engineer' }];
    const shifts = [{ id: 'shift1', name: 'Morning Shift' }];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-sm text-gray-500">Loading employee data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/attendance-admin/employee-management')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Go back"
                >
                    <FiArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                {/* Basic Details Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                        Basic Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('fullName', {
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Full name must be at least 2 characters',
                                    },
                                })}
                                type="text"
                                placeholder="Enter full name"
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                                    errors.fullName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                }`}
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                type="email"
                                placeholder="Enter email address"
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                                    errors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                                rules={{ required: 'Phone number is required' }}
                                render={({ field }) => (
                                    <>
                                        <PhoneInput
                                            country={'in'}
                                            value={field.value || ''}
                                            onChange={(value) => field.onChange(value)}
                                            inputClass={`!w-full !py-2.5 !px-4 !pl-14 !rounded-lg !text-sm !font-normal !bg-white !border !transition-all !duration-300 ${
                                                errors.phoneNumber
                                                    ? '!border-red-500 !focus:border-red-500 !focus:ring-2 !focus:ring-red-500/20'
                                                    : '!border-gray-300 !focus:border-primary !focus:ring-2 !focus:ring-primary/20'
                                            }`}
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
                                        />
                                        {errors.phoneNumber && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.phoneNumber.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                {...register('gender')}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Select gender</option>
                                {genders.map((gender) => (
                                    <option key={gender} value={gender}>
                                        {gender}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Blood Group */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Blood Group
                            </label>
                            <select
                                {...register('bloodGroup')}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Select blood group</option>
                                {bloodGroups.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="dateOfBirth"
                                control={control}
                                rules={{ required: 'Date of birth is required' }}
                                render={({ field }) => (
                                    <>
                                        <DatePickerWrapper
                                            value={field.value}
                                            onChange={field.onChange}
                                            hasError={!!errors.dateOfBirth}
                                            placeholder="Select date of birth"
                                        />
                                        {errors.dateOfBirth && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.dateOfBirth.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* Company Joining Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Joining Date <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="companyJoiningDate"
                                control={control}
                                rules={{ required: 'Company joining date is required' }}
                                render={({ field }) => (
                                    <>
                                        <DatePickerWrapper
                                            value={field.value}
                                            onChange={field.onChange}
                                            hasError={!!errors.companyJoiningDate}
                                            placeholder="Select joining date"
                                        />
                                        {errors.companyJoiningDate && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.companyJoiningDate.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                {...register('address')}
                                rows={3}
                                placeholder="Enter address"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Branch Details Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                        Branch & Employment Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('departmentId', { required: 'Department is required' })}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                                    errors.departmentId
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                }`}
                            >
                                <option value="">Select a department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <p className="mt-1 text-xs text-red-600">{errors.departmentId.message}</p>
                            )}
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('designationId', { required: 'Designation is required' })}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                                    errors.designationId
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                }`}
                            >
                                <option value="">Select a designation</option>
                                {designations.map((desig) => (
                                    <option key={desig.id} value={desig.id}>
                                        {desig.name}
                                    </option>
                                ))}
                            </select>
                            {errors.designationId && (
                                <p className="mt-1 text-xs text-red-600">{errors.designationId.message}</p>
                            )}
                        </div>

                        {/* Salary Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salary Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="salaryType"
                                control={control}
                                rules={{ required: 'Salary type is required' }}
                                render={({ field }) => (
                                    <div className="flex gap-6">
                                        {salaryTypes.map((type) => (
                                            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    {...field}
                                                    value={type.value}
                                                    checked={field.value === type.value}
                                                    onChange={() => field.onChange(type.value)}
                                                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                                                />
                                                <span className="text-sm text-gray-700">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                            {errors.salaryType && (
                                <p className="mt-1 text-xs text-red-600">{errors.salaryType.message}</p>
                            )}
                        </div>

                        {/* Salary Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salary Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('salaryAmount', {
                                    required: 'Salary amount is required',
                                    pattern: {
                                        value: /^\d+(\.\d{1,2})?$/,
                                        message: 'Please enter a valid amount',
                                    },
                                })}
                                type="text"
                                placeholder="Enter salary amount"
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                                    errors.salaryAmount
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                }`}
                            />
                            {errors.salaryAmount && (
                                <p className="mt-1 text-xs text-red-600">{errors.salaryAmount.message}</p>
                            )}
                        </div>

                        {/* Assign Shift */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign Shift <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('shiftId', { required: 'Shift is required' })}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                                    errors.shiftId
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                                }`}
                            >
                                <option value="">Select a shift</option>
                                {shifts.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.name}
                                    </option>
                                ))}
                            </select>
                            {errors.shiftId && (
                                <p className="mt-1 text-xs text-red-600">{errors.shiftId.message}</p>
                            )}
                        </div>

                        {/* Role & Attendance Section */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-200">
                            <h3 className="text-base font-semibold text-gray-900">Role & Attendance</h3>
                            
                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="role"
                                    control={control}
                                    rules={{ required: 'Role is required' }}
                                    render={({ field }) => (
                                        <div className="flex gap-6">
                                            {roles.map((roleOption) => (
                                                <label key={roleOption.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        {...field}
                                                        value={roleOption.value}
                                                        checked={field.value === roleOption.value}
                                                        onChange={() => field.onChange(roleOption.value)}
                                                        className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                                                    />
                                                    <span className="text-sm text-gray-700">{roleOption.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                />
                                {errors.role && (
                                    <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
                                )}
                            </div>

                            {/* Attendance Permission */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-700">Attendance Permission</h4>
                                
                                {/* Geo Fencing */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Geo Fencing
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <Controller
                                            name="isGeoFencing"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-xs font-medium ${field.value ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                                                        {field.value ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                    <button
                                                        onClick={() => field.onChange(!field.value)}
                                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${field.value ? 'bg-[#0A8316]' : 'bg-gray-300'
                                                            }`}
                                                        type="button"
                                                    >
                                                        <span
                                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${field.value ? 'translate-x-6' : 'translate-x-0'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                        />
                                        <p className="text-xs text-gray-500">
                                            When enabled, employees must be within a specified location to mark attendance
                                        </p>
                                    </div>
                                </div>

                                {/* Attendance Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Attendance Type <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="attendanceType"
                                        control={control}
                                        rules={{ required: 'Attendance type is required' }}
                                        render={({ field }) => (
                                            <div className="flex gap-6">
                                                {attendanceTypes.map((type) => (
                                                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            {...field}
                                                            value={type.value}
                                                            checked={field.value === type.value}
                                                            onChange={() => field.onChange(type.value)}
                                                            className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                                                        />
                                                        <span className="text-sm text-gray-700">{type.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    />
                                    {errors.attendanceType && (
                                        <p className="mt-1 text-xs text-red-600">{errors.attendanceType.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                        Bank Details <span className="text-sm font-normal text-gray-500">(Optional)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number
                            </label>
                            <input
                                {...register('accountNumber')}
                                type="text"
                                placeholder="Enter account number"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Bank Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name
                            </label>
                            <input
                                {...register('bankName')}
                                type="text"
                                placeholder="Enter bank name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Branch Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch Name
                            </label>
                            <input
                                {...register('branchName')}
                                type="text"
                                placeholder="Enter branch name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* IFSC Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IFSC Code
                            </label>
                            <input
                                {...register('ifscCode')}
                                type="text"
                                placeholder="Enter IFSC code"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* UPI ID */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                UPI ID
                            </label>
                            <input
                                {...register('upiId')}
                                type="text"
                                placeholder="Enter UPI ID"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact Details Section */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                        Emergency Contact Details <span className="text-sm font-normal text-gray-500">(Optional)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emergency Contact Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Name
                            </label>
                            <input
                                {...register('emergencyContactName')}
                                type="text"
                                placeholder="Enter contact name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Emergency Contact Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone
                            </label>
                            <Controller
                                name="emergencyContactPhone"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInput
                                        country={'in'}
                                        value={field.value || ''}
                                        onChange={(value) => field.onChange(value)}
                                        inputClass="!w-full !py-2.5 !px-4 !pl-14 !rounded-lg !text-sm !font-normal !bg-white !border !border-gray-300 !focus:border-primary !focus:ring-2 !focus:ring-primary/20 !transition-all !duration-300"
                                        inputProps={{
                                            name: 'emergencyContactPhone',
                                            placeholder: 'Enter contact phone',
                                            autoComplete: 'tel',
                                        }}
                                        countryCodeEditable={true}
                                        containerClass="w-full"
                                        enableSearch
                                        disableSearchIcon={false}
                                        preferredCountries={['in', 'us', 'gb', 'au', 'ca']}
                                    />
                                )}
                            />
                        </div>

                        {/* Relation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relation
                            </label>
                            <select
                                {...register('emergencyContactRelation')}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Select relation</option>
                                {relations.map((relation) => (
                                    <option key={relation} value={relation}>
                                        {relation}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Emergency Contact Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Address
                            </label>
                            <textarea
                                {...register('emergencyContactAddress')}
                                rows={3}
                                placeholder="Enter contact address"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/attendance-admin/employee-management')}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                            isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90'
                        }`}
                    >
                        {isSubmitting 
                            ? (isEditMode ? 'Updating...' : 'Adding...') 
                            : (isEditMode ? 'Update Employee' : 'Add Employee')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmployee;
