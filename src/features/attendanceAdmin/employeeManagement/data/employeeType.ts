import type { Timestamp } from "firebase/firestore";

export interface EmployeeProps {
    id: string;
    companyId: string;
    createdAt: Timestamp;

    branchDetails: {
        branchId: string | null;
        departmentId: string | null;
        designationId: string | null;
        shiftDocId: string | null;
        shiftId: string | null;
        employmentType: "fullTime" | "partTime" | "intern";
        attendancePermission: {
            attendanceType: 'swipe' | 'selfie';
            isGeoFencing: boolean;
        } | null;
        salaryType: 'monthly' | 'hourly' | 'yearly' | 'daily';
        salaryAmount: number | null;
    };

    basicDetails: {
        fullName: string;
        gender: string | null;
        bloodGroup: string | null;
        email: string;
        phoneNumber: string;
        address: string | null;
        companyJoiningDate: Timestamp | null;
        dateOfBirth: Timestamp | null;
    };

    keywords: string[];
    isActive: boolean;
    bankDetails: BankDetails | null;
    emergencyContactDetails: EmergencyContactDetails | null;
}

export interface CustomFieldValue {
    id: string;
    value: string;
}

// export interface UserAttendanceProps {
//     isPunchIn: boolean;
//     lastPunchCount: number;
//     lastPunchInAt: Timestamp;
//     lastPunchInImageUrl: string | null;
//     latitude: number | null;
//     longitude: number | null;
// }

export interface BankDetails {
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    upiId: string;
}

export interface EmergencyContactDetails {
    name: string;
    phoneNumber: string;
    countryCode: string;
    address: string;
    relation: string;
}