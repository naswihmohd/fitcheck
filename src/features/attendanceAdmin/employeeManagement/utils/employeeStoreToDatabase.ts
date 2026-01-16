import { doc, setDoc, getDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { EmployeeProps } from '../data/employeeType';
import keywordsBuilder from '../../../../general/utils/keywordsBuilder';

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

export const employeeStoreToDatabase = async (
    companyId: string,
    formData: EmployeeFormData,
    employeeId?: string // Optional: if provided, update existing employee; otherwise create new
): Promise<string> => {
    try {
        const keywords = [
            ...keywordsBuilder(formData.fullName),
            ...keywordsBuilder(formData.email),
            ...keywordsBuilder(formData.phoneNumber),
        ];

        // Reference to the employees collection for this company
        const employeesCollectionRef = collection(db, 'companies', companyId, 'employees');

        let newEmployeeId: string;
        let createdAt: Timestamp;

        if (employeeId) {
            // Update existing employee
            newEmployeeId = employeeId;
            const employeeDocRef = doc(employeesCollectionRef, employeeId);
            const employeeDoc = await getDoc(employeeDocRef);
            
            if (!employeeDoc.exists()) {
                throw new Error('Employee not found');
            }

            const existingData = employeeDoc.data() as EmployeeProps;
            createdAt = existingData.createdAt;

            // Update the employee document (preserve isActive status)
            await setDoc(employeeDocRef, {
                id: newEmployeeId,
                companyId,
                basicDetails: {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phoneNumber: formData.phoneNumber,
                    gender: formData.gender || null,
                    bloodGroup: formData.bloodGroup || null,
                    address: formData.address || null,
                    companyJoiningDate: formData.companyJoiningDate ? Timestamp.fromDate(formData.companyJoiningDate) : null,
                    dateOfBirth: formData.dateOfBirth ? Timestamp.fromDate(formData.dateOfBirth) : null,
                },
                branchDetails: {
                    branchId: formData.branchId || null,
                    departmentId: formData.departmentId || null,
                    designationId: formData.designationId || null,
                    shiftDocId: formData.shiftDocId || formData.shiftId || null,
                    shiftId: formData.shiftId || null,
                    employmentType: formData.employmentType,
                    attendancePermission: {
                        attendanceType: formData.attendanceType,
                        isGeoFencing: formData.isGeoFencing,
                    },
                    salaryType: formData.salaryType,
                    salaryAmount: formData.salaryAmount ? parseFloat(formData.salaryAmount) : null,
                },
                keywords: keywords,
                isActive: existingData.isActive, // Preserve existing isActive status
                bankDetails: formData.accountNumber || formData.bankName
                    ? {
                          accountNumber: formData.accountNumber,
                          bankName: formData.bankName,
                          branchName: formData.branchName,
                          ifscCode: formData.ifscCode,
                          upiId: formData.upiId,
                      }
                    : null,
                emergencyContactDetails: formData.emergencyContactName || formData.emergencyContactPhone
                    ? {
                          name: formData.emergencyContactName,
                          phoneNumber: formData.emergencyContactPhone,
                          countryCode: formData.emergencyContactCountryCode,
                          address: formData.emergencyContactAddress,
                          relation: formData.emergencyContactRelation,
                      }
                    : null,
                createdAt, // Preserve original creation date
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } else {
            // Create new employee with auto-generated ID
            const employeeDocRef = doc(employeesCollectionRef);
            newEmployeeId = employeeDocRef.id;

            await setDoc(employeeDocRef, {
                id: newEmployeeId,
                companyId,
                basicDetails: {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phoneNumber: formData.phoneNumber,
                    gender: formData.gender || null,
                    bloodGroup: formData.bloodGroup || null,
                    address: formData.address || null,
                    companyJoiningDate: formData.companyJoiningDate ? Timestamp.fromDate(formData.companyJoiningDate) : null,
                    dateOfBirth: formData.dateOfBirth ? Timestamp.fromDate(formData.dateOfBirth) : null,
                },
                branchDetails: {
                    branchId: formData.branchId || null,
                    departmentId: formData.departmentId || null,
                    designationId: formData.designationId || null,
                    shiftDocId: formData.shiftDocId || formData.shiftId || null,
                    shiftId: formData.shiftId || null,
                    employmentType: formData.employmentType,
                    attendancePermission: {
                        attendanceType: formData.attendanceType,
                        isGeoFencing: formData.isGeoFencing,
                    },
                    salaryType: formData.salaryType,
                    salaryAmount: formData.salaryAmount ? parseFloat(formData.salaryAmount) : null,
                },
                keywords: keywords,
                isActive: true,
                bankDetails: formData.accountNumber || formData.bankName
                    ? {
                          accountNumber: formData.accountNumber,
                          bankName: formData.bankName,
                          branchName: formData.branchName,
                          ifscCode: formData.ifscCode,
                          upiId: formData.upiId,
                      }
                    : null,
                emergencyContactDetails: formData.emergencyContactName || formData.emergencyContactPhone
                    ? {
                          name: formData.emergencyContactName,
                          phoneNumber: formData.emergencyContactPhone,
                          countryCode: formData.emergencyContactCountryCode,
                          address: formData.emergencyContactAddress,
                          relation: formData.emergencyContactRelation,
                      }
                    : null,
                createdAt: serverTimestamp() as Timestamp,
            });
        }

        return newEmployeeId;
    } catch (error) {
        console.error('Error saving employee to Firebase:', error);
        throw error;
    }
};

export const getEmployeeFromDatabase = async (
    companyId: string,
    employeeId: string
): Promise<EmployeeProps | null> => {
    try {
        const employeesCollectionRef = collection(db, 'companies', companyId, 'employees');
        const employeeDocRef = doc(employeesCollectionRef, employeeId);
        const employeeDoc = await getDoc(employeeDocRef);

        if (!employeeDoc.exists()) {
            return null;
        }

        return {
            id: employeeDoc.id,
            ...employeeDoc.data(),
        } as EmployeeProps;
    } catch (error) {
        console.error('Error fetching employee from Firebase:', error);
        throw error;
    }
};
