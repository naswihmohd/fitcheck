
import { formatDate } from '../../../../../general/utils/formatDate';
import type { EmployeeProps } from '../../../employeeManagement/data/employeeType';
import { useOutletContext } from 'react-router';

const EmployeeInfo: React.FC = () => {
    const { employeeData } = useOutletContext<{ employeeData: EmployeeProps }>();

    // Format employment type
    const formatEmploymentType = (type: string): string => {
        return type === 'fullTime' ? 'Full Time' : type === 'Part Time' ? 'Part Time' : 'Intern';
    };

    // Format salary type
    const formatSalaryType = (type: string): string => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    // Format attendance type
    const formatAttendanceType = (type: string): string => {
        return type === 'swipe' ? 'Swipe' : 'Selfie';
    };

    return (
        <div className="bg-white rounded-lg p-6 space-y-6">

            {/* Main Information Section - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-0">

                    {/* NAME */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">NAME</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.basicDetails.fullName}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE NUMBER */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">MOBILE NUMBER</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.basicDetails.phoneNumber}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">STATUS</label>
                            </div>
                            <div className="flex-1">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employeeData.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {employeeData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* JOINING DATE */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">JOINING DATE</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {formatDate(employeeData.basicDetails.companyJoiningDate)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GENDER */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">GENDER</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.basicDetails.gender || 'Not Added'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EMPLOYMENT TYPE */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">EMPLOYMENT TYPE</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {formatEmploymentType(employeeData.branchDetails.employmentType)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ATTENDANCE TYPE */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">ATTENDANCE TYPE</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.branchDetails.attendancePermission
                                        ? formatAttendanceType(employeeData.branchDetails.attendancePermission.attendanceType)
                                        : 'Not Added'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-0">
                    {/* SALARY TYPE */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">SALARY TYPE</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {formatSalaryType(employeeData.branchDetails.salaryType)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SALARY AMOUNT */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">SALARY AMOUNT</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.branchDetails.salaryAmount
                                        ? `₹${employeeData.branchDetails.salaryAmount.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}`
                                        : 'Not Added'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EMAIL ADDRESS */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">EMAIL ADDRESS</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.basicDetails.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DATE OF BIRTH */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">DATE OF BIRTH</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {formatDate(employeeData.basicDetails.dateOfBirth)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BLOOD GROUP */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">BLOOD GROUP</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.basicDetails.bloodGroup || 'Not Added'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">ADDRESS</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.basicDetails.address || 'Not Added'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GEO FENCING */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="w-40 flex-shrink-0">
                                <label className="text-sm font-medium text-gray-700">GEO FENCING</label>
                            </div>
                            <div className="flex-1">
                                <div className="py-2 text-sm text-gray-900">
                                    {employeeData.branchDetails.attendancePermission?.isGeoFencing ? 'Enabled' : 'Disabled'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Details Section */}
            {employeeData.bankDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">BANK DETAILS</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-0">
                            {/* BANK NAME */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">BANK NAME</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.bankDetails.bankName}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACCOUNT NUMBER */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">ACCOUNT NUMBER</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.bankDetails.accountNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* IFSC CODE */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">IFSC CODE</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.bankDetails.ifscCode}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-0">
                            {/* BRANCH NAME */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">BRANCH NAME</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.bankDetails.branchName}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* UPI ID */}
                            {employeeData.bankDetails.upiId && (
                                <div className="border-b border-gray-200 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="w-40 flex-shrink-0">
                                            <label className="text-sm font-medium text-gray-700">UPI ID</label>
                                        </div>
                                        <div className="flex-1">
                                            <div className="py-2 text-sm text-gray-900">
                                                {employeeData.bankDetails.upiId}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Contact Details Section */}
            {employeeData.emergencyContactDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">EMERGENCY CONTACT DETAILS</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-0">
                            {/* CONTACT NAME */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">CONTACT NAME</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.emergencyContactDetails.name}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RELATION */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">RELATION</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.emergencyContactDetails.relation}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PHONE NUMBER */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">PHONE NUMBER</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.emergencyContactDetails.countryCode}{' '}
                                            {employeeData.emergencyContactDetails.phoneNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-0">
                            {/* ADDRESS */}
                            <div className="border-b border-gray-200 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="w-40 flex-shrink-0">
                                        <label className="text-sm font-medium text-gray-700">ADDRESS</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="py-2 text-sm text-gray-900">
                                            {employeeData.emergencyContactDetails.address}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeInfo;
