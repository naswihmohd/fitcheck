import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { ShiftsProps, Shift } from '../data/shiftTypes';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'shifts';

export interface BranchShiftsState {
  branchShifts: Record<string, ShiftsProps | null>; // store single shift doc per branch
  loading: boolean;
  error: string | null;
}

const initialState: BranchShiftsState = {
  branchShifts: {},
  loading: false,
  error: null,
};

export const fetchBranchShift = createAsyncThunk(
  'shift/fetchBranchShift',
  async ({ branchId }: { branchId: string }, { getState }) => {
    try {
      const state = getState() as RootState;
      const companyId = state.user.companyId;
      if (!companyId) {
        throw new Error('No company ID found in user state.');
      }
      const shiftCollectionRef = collection(db, 'companies', companyId, COLLECTION_NAME);
      const shiftQuery = query(
        shiftCollectionRef,
        where('branchId', '==', branchId),
      );
      const querySnapshot = await getDocs(shiftQuery);
      if (querySnapshot.empty) {
        return { branchId, shift: null };
      }
      const doc = querySnapshot.docs[0];
      const shiftData = { ...doc.data(), id: doc.id } as ShiftsProps;
      return { branchId, shift: shiftData };
    } catch (error) {
      throw new Error('Failed to fetch shift: ' + (error as Error).message);
    }
  }
);

const shiftSlice = createSlice({
  name: 'branchShifts',
  initialState,
  reducers: {
    updateShiftInRedux: (state, action) => {
      const { branchId, shift } = action.payload as { branchId: string, shift: Shift };
      if (state.branchShifts[branchId] && state.branchShifts[branchId]?.shifts) {
        state.branchShifts[branchId] = {
          ...state.branchShifts[branchId],
          shifts: {
            ...state.branchShifts[branchId]!.shifts,
            [shift.id]: shift,
          },
        };
      }
    },
    removeShiftInRedux: (state, action) => {
      const { branchId, shiftId } = action.payload as { branchId: string, shiftId: string };
      if (state.branchShifts[branchId] && state.branchShifts[branchId]?.shifts) {
        const updatedShifts = { ...state.branchShifts[branchId]!.shifts };
        delete updatedShifts[shiftId];
        state.branchShifts[branchId] = {
          ...state.branchShifts[branchId],
          shifts: updatedShifts,
        };
      }
    },
    addShiftInRedux: (state, action) => {
      const { branchId, shift, companyId, createdAt } = action.payload as { branchId: string, shift: Shift, companyId?: string, createdAt?: any };
      if (state.branchShifts[branchId] && state.branchShifts[branchId]?.shifts) {
        state.branchShifts[branchId] = {
          ...state.branchShifts[branchId],
          shifts: {
            ...state.branchShifts[branchId]!.shifts,
            [shift.id]: shift,
          },
        };
      } else if (companyId && createdAt) {
        // If branch doesn't exist yet, create it (require companyId and createdAt)
        state.branchShifts[branchId] = {
          branchId,
          companyId,
          id: branchId,
          createdAt,
          shifts: {
            [shift.id]: shift,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchShift.fulfilled, (state, action) => {
        const { branchId, shift } = action.payload;
        state.branchShifts[branchId] = shift;
        state.loading = false;
      })
      .addCase(fetchBranchShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shift';
      });
  },
});

export const { updateShiftInRedux, removeShiftInRedux, addShiftInRedux } = shiftSlice.actions;
export default shiftSlice.reducer; 