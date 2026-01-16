import { doc, setDoc, updateDoc, query, collection, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { HolidayItem } from '../data/holydayTypes';
import { v4 as uuidv4 } from 'uuid';
import type { AppDispatch } from '../../../../general/redux/store';
import { updateHolidayInRedux, addHolidayInRedux } from '../redux/holydaySlice';

interface HolidayFormData {
    name: string;
    startDate: Date | null;
    endDate: Date | null;
}

export const holidayStoreToDatabase = async (
    branchId: string,
    companyId: string,
    formData: HolidayFormData,
    holidayId?: string, // Optional: if provided, update existing holiday; otherwise create new
    dispatch?: AppDispatch
): Promise<void> => {
    try {
        // Generate holidayId if not provided (for new holidays)
        const newHolidayId = holidayId || uuidv4();

        // Convert Date objects to Firestore Timestamps
        const startDateTimestamp = formData.startDate
            ? Timestamp.fromDate(formData.startDate)
            : null;
        const endDateTimestamp = formData.endDate
            ? Timestamp.fromDate(formData.endDate)
            : null;

        if (!startDateTimestamp || !endDateTimestamp) {
            throw new Error('Start date and end date are required');
        }

        // Create holiday item
        const holidayItem: HolidayItem = {
            id: newHolidayId,
            name: formData.name.trim(),
            startDate: startDateTimestamp,
            endDate: endDateTimestamp,
            createdAt: serverTimestamp() as Timestamp,
        };

        // Reference to the holidays collection for this company
        const holidaysCollectionRef = collection(db, 'companies', companyId, 'holidays');

        // Check if document exists for this branch
        const holidayQuery = query(
            holidaysCollectionRef,
            where('branchId', '==', branchId)
        );

        // Check if document exists
        const holidaysDocs = await getDocs(holidayQuery);
        if (holidaysDocs.size > 0) {
            // Document exists - update the holidays object
            const existingDoc = holidaysDocs.docs[0];
            const existingData = existingDoc.data();
            const existingHolidays = existingData.holidays || {};

            // Update or add the holiday
            const updatedHolidays = {
                ...existingHolidays,
                [newHolidayId]: holidayItem,
            };

            await updateDoc(existingDoc.ref, {
                holidays: updatedHolidays,
                updatedAt: serverTimestamp(),
            });

            // Update Redux store
            if (dispatch) {
                dispatch(updateHolidayInRedux({ branchId, holiday: holidayItem }));
            }
        } else {
            // Document doesn't exist - create new document
            const holidaysDocRef = doc(holidaysCollectionRef);
            const createdAt = Timestamp.now(); // Use client-side timestamp for Redux
            await setDoc(holidaysDocRef, {
                id: holidaysDocRef.id,
                branchId,
                companyId,
                createdAt: serverTimestamp(),
                holidays: {
                    [newHolidayId]: holidayItem,
                },
            });

            // Add to Redux store
            if (dispatch) {
                dispatch(addHolidayInRedux({ branchId, holiday: holidayItem, companyId, createdAt }));
            }
        }
    } catch (error) {
        console.error('Error saving holiday to Firebase:', error);
        throw error;
    }
};
