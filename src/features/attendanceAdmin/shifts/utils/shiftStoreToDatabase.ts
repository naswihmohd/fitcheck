import { doc, setDoc, updateDoc, query, collection, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import type { ShiftFormData } from '../data/shiftTypes';
import { v4 as uuidv4 } from 'uuid';
import { transformFormDataToShift } from './transformFormDataToShift';
import type { AppDispatch } from '../../../../general/redux/store';
import { updateShiftInRedux, addShiftInRedux } from '../redux/shiftSlice';


export const shiftStoreToDatabase = async (
    branchId: string,
    companyId: string,
    formData: ShiftFormData,
    shiftId?: string, // Optional: if provided, update existing shift; otherwise create new
    dispatch?: AppDispatch
): Promise<void> => {
    try {
        // Generate shiftId if not provided (for new shifts)
        const newShiftId = shiftId || uuidv4();

        // Reference to the shifts document for this branch
        const shiftsCollectionRef = collection(db, 'companies', companyId, 'shifts');
        const shiftData = transformFormDataToShift(formData, newShiftId)

        // Check if company document exists
        const shiftQuery = query(
            shiftsCollectionRef,
            where('branchId', '==', branchId)
        );

        // Check if document exists
        const shiftsDocs = await getDocs(shiftQuery);
        if (shiftsDocs.size > 0) {
            // Document exists - update the shifts object
            const existingDoc = shiftsDocs.docs[0];
            const existingData = existingDoc.data();
            const existingShifts = existingData.shifts || {};

            // Update or add the shift
            const updatedShifts = {
                ...existingShifts,
                [newShiftId]: shiftData,
            };

            await updateDoc(existingDoc.ref, {
                shifts: updatedShifts,
                updatedAt: serverTimestamp(),
            });

            // Update Redux store
            if (dispatch) {
                dispatch(updateShiftInRedux({ branchId, shift: shiftData }));
            }
        } else {
            // Document doesn't exist - create new document
            const shiftsDocRef = doc(shiftsCollectionRef);
            const createdAt = Timestamp.now(); // Use client-side timestamp for Redux
            await setDoc(shiftsDocRef, {
                id: shiftsDocRef.id,
                branchId,
                companyId,
                createdAt: serverTimestamp(),
                shifts: {
                    [newShiftId]: shiftData,
                },
            });

            // Add to Redux store
            if (dispatch) {
                dispatch(addShiftInRedux({ branchId, shift: shiftData, companyId, createdAt }));
            }
        }
    } catch (error) {
        console.error('Error saving shift to Firebase:', error);
        throw error;
    }
};
