import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { LeadProps } from '../../leadsManagement/data/leadTypes';
import type { FollowUpFilter } from '../data/followUpTypes';

const COLLECTION_NAME = 'leads';
const LIMIT_NUMBER = 10;

export interface FollowUpsState {
  leads: LeadProps[];
  lastVisible: any | null;
  hasMore: boolean;
  currentFilter: FollowUpFilter | null;
  loading: boolean;
  error: string | null;
}

const initialState: FollowUpsState = {
  leads: [],
  lastVisible: null,
  hasMore: true,
  currentFilter: null,
  loading: false,
  error: null,
};

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
  };
}

export const fetchFollowUps = createAsyncThunk(
  'followUps/fetchFollowUps',
  async ({ filter }: { filter: FollowUpFilter }, { getState }) => {
    try {
      const state = getState() as RootState;
      const followUpsData = state.followUps;

      const shouldReset = followUpsData.currentFilter !== filter;
      const lastVisible = shouldReset ? null : followUpsData.lastVisible;

      const leadsCollectionRef = collection(db, COLLECTION_NAME);
      const { start, end } = getTodayRange();

      let leadsQuery;

      if (filter === 'today_followups') {
        leadsQuery = query(
          leadsCollectionRef,
          where('nextFollowUpDate', '>=', start),
          where('nextFollowUpDate', '<', end),
          orderBy('nextFollowUpDate', 'asc'),
          ...(lastVisible ? [startAfter(lastVisible)] : []),
          limit(LIMIT_NUMBER)
        );
      } else if (filter === 'today_leads') {
        leadsQuery = query(
          leadsCollectionRef,
          where('createdAt', '>=', start),
          where('createdAt', '<', end),
          orderBy('createdAt', 'desc'),
          ...(lastVisible ? [startAfter(lastVisible)] : []),
          limit(LIMIT_NUMBER)
        );
      } else {
        leadsQuery = query(
          leadsCollectionRef,
          where('nextFollowUpDate', '<', start),
          orderBy('nextFollowUpDate', 'desc'),
          ...(lastVisible ? [startAfter(lastVisible)] : []),
          limit(LIMIT_NUMBER)
        );
      }

      const querySnapshot = await getDocs(leadsQuery);
      const newLeads: LeadProps[] = querySnapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
        } as LeadProps;
      });

      return {
        leads: newLeads,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: newLeads.length === LIMIT_NUMBER,
        filter,
        shouldReset,
      };
    } catch (error) {
      throw new Error('Failed to fetch follow-ups: ' + (error as Error).message);
    }
  }
);

const followUpSlice = createSlice({
  name: 'followUps',
  initialState,
  reducers: {
    clearFollowUps: (state) => {
      state.leads = [];
      state.lastVisible = null;
      state.hasMore = true;
      state.currentFilter = null;
      state.loading = false;
      state.error = null;
    },
    updateFollowUp: (state, action) => {
      const lead = action.payload as LeadProps;
      const index = state.leads.findIndex((l) => l.id === lead.id);
      if (index !== -1) {
        state.leads[index] = {
          ...state.leads[index],
          ...lead,
        };
      }
    },
    removeFollowUp: (state, action) => {
      const leadId = action.payload as string;
      state.leads = state.leads.filter((l) => l.id !== leadId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowUps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowUps.fulfilled, (state, action) => {
        state.loading = false;
        const { leads, lastVisible, hasMore, filter, shouldReset } = action.payload;

        if (shouldReset) {
          state.leads = [];
          state.lastVisible = null;
        }

        const uniqueLeads = leads.filter(
          (newLead) => !state.leads.some((lead) => lead.id === newLead.id)
        );
        state.leads = [...state.leads, ...uniqueLeads];

        state.lastVisible = lastVisible;
        state.hasMore = hasMore;
        state.currentFilter = filter;
      })
      .addCase(fetchFollowUps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch follow-ups';
      });
  },
});

export const { clearFollowUps, updateFollowUp, removeFollowUp } = followUpSlice.actions;
export default followUpSlice.reducer;
