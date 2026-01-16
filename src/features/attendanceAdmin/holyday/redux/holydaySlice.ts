import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { HolidaysProps, HolidayItem } from '../data/holydayTypes';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'holidays';

export interface BranchHolidaysState {
  branchHolidays: Record<string, HolidaysProps | null>; // store single holiday per branch
  loading: boolean;
  error: string | null;
}

const initialState: BranchHolidaysState = {
  branchHolidays: {},
  loading: false,
  error: null,
};

export const fetchBranchHoliday = createAsyncThunk(
  'holidays/fetchBranchHoliday',
  async ({ branchId }: { branchId: string }, { getState }) => {
    try {
      const state = getState() as RootState;
      const companyId = state.user.companyId;
      if (!companyId) {
        throw new Error('No company ID found in user state.');
      }

      const holidayCollectionRef = collection(db, 'companies', companyId, COLLECTION_NAME);
      const holidayQuery = query(
        holidayCollectionRef,
        where('branchId', '==', branchId),
      );

      const querySnapshot = await getDocs(holidayQuery);
      if (querySnapshot.empty) {
        return { branchId, holiday: null };
      }

      const doc = querySnapshot.docs[0];
      const holidayData = { ...doc.data(), id: doc.id } as HolidaysProps;
      return { branchId, holiday: holidayData };
    } catch (error) {
      throw new Error('Failed to fetch holiday: ' + (error as Error).message);
    }
  }
);

const holydaySlice = createSlice({
  name: 'branchHolidays',
  initialState,
  reducers: {
    updateHolidayInRedux: (state, action) => {
      const { branchId, holiday } = action.payload as { branchId: string, holiday: HolidayItem };
      if (state.branchHolidays[branchId] && state.branchHolidays[branchId]?.holidays) {
        state.branchHolidays[branchId] = {
          ...state.branchHolidays[branchId],
          holidays: {
            ...state.branchHolidays[branchId]!.holidays,
            [holiday.id]: holiday,
          },
        };
      }
    },
    removeHolidayInRedux: (state, action) => {
      const { branchId, holidayId } = action.payload as { branchId: string, holidayId: string };
      if (state.branchHolidays[branchId] && state.branchHolidays[branchId]?.holidays) {
        const updatedHolidays = { ...state.branchHolidays[branchId]!.holidays };
        delete updatedHolidays[holidayId];
        state.branchHolidays[branchId] = {
          ...state.branchHolidays[branchId],
          holidays: updatedHolidays,
        };
      }
    },
    addHolidayInRedux: (state, action) => {
      const { branchId, holiday, companyId, createdAt } = action.payload as { branchId: string, holiday: HolidayItem, companyId?: string, createdAt?: any };
      if (state.branchHolidays[branchId] && state.branchHolidays[branchId]?.holidays) {
        state.branchHolidays[branchId] = {
          ...state.branchHolidays[branchId],
          holidays: {
            ...state.branchHolidays[branchId]!.holidays,
            [holiday.id]: holiday,
          },
        };
      } else if (companyId && createdAt) {
        // If branch doesn't exist yet, create it (require companyId and createdAt)
        state.branchHolidays[branchId] = {
          branchId,
          companyId,
          createdAt,
          id: branchId,
          holidays: {
            [holiday.id]: holiday,
          },
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchHoliday.fulfilled, (state, action) => {
        const { branchId, holiday } = action.payload;
        state.branchHolidays[branchId] = holiday;
        state.loading = false;
      })
      .addCase(fetchBranchHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch holiday';
      });
  },
});

export const { updateHolidayInRedux, removeHolidayInRedux, addHolidayInRedux } = holydaySlice.actions;
export default holydaySlice.reducer;
