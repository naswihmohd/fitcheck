import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { query, collection, where, getDocs, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { db } from '../../../../../firebaseConfig';
import type { HolidayItem, HolidaysProps } from '../../data/holydayTypes';
import type { AppDispatch } from '../../../../../general/redux/store';
import { removeHolidayInRedux } from '../../redux/holydaySlice';
import ConfirmModal from '../../../../../general/components/ConfirmModal';

const COLLECTION_NAME = 'holidays';

const HolydayDeleteButton = ({ holiday, holidayData }: { holiday: HolidayItem, holidayData: HolidaysProps | null }) => {
    const dispatch: AppDispatch = useDispatch();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleDelete = async () => {
        if (!holidayData) {
            console.error('Holiday data is missing');
            return;
        }

        try {
            const { branchId, companyId } = holidayData;
            
            // Query for the holiday doc for this branch
            const holidayCollectionRef = collection(db, 'companies', companyId, COLLECTION_NAME);
            const holidayQuery = query(
              holidayCollectionRef,
              where('branchId', '==', branchId),
            );
            const querySnapshot = await getDocs(holidayQuery);

            if (!querySnapshot.empty) {
              const docRef = querySnapshot.docs[0].ref;
              const docData = querySnapshot.docs[0].data();
              const holidays = docData.holidays || {};
              // Remove the holiday from the holidays map
              delete holidays[holiday.id];
              if (Object.keys(holidays).length === 0) {
                // If no holidays left, delete the entire document
                await deleteDoc(docRef);
              } else {
                // Otherwise, update the document to remove the holiday
                await updateDoc(docRef, {
                  [`holidays.${holiday.id}`]: deleteField()
                });
              }
              
              // Update Redux store
              dispatch(removeHolidayInRedux({ branchId, holidayId: holiday.id }));
              setShowConfirmModal(false);
            } else {
              throw new Error('Holiday document for this branch not found.');
            }
          } catch (error) {
            console.error('Error deleting holiday:', error);
            throw new Error('Failed to delete holiday');
          }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 px-1 py-1 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm"
            >
                <FiTrash2 className="w-4 h-4" />
            </button>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleDelete}
                message={`Are you sure you want to delete "${holiday.name}"?`}
            />
        </>
    )
}

export default HolydayDeleteButton
