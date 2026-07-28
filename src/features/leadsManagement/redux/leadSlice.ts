import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { LeadProps } from '../data/leadTypes';

const COLLECTION_NAME = 'leads';
const LIMIT_NUMBER = 10;

export interface LeadsState {
  leads: LeadProps[];
  lastVisible: any | null;
  hasMore: boolean;
  currentFilter?: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  lastVisible: null,
  hasMore: true,
  currentFilter: null,
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async ({ searchQuery }: { searchQuery: string | null }, { getState }) => {
    const filterAndQueryTerm = searchQuery || null;

    try {
      const state = getState() as RootState;
      const leadsData = state.leads;

      const shouldReset = leadsData.currentFilter !== filterAndQueryTerm;
      const lastVisible = shouldReset ? null : leadsData.lastVisible;

      const leadsCollectionRef = collection(db, COLLECTION_NAME);

      const leadsQuery = query(
        leadsCollectionRef,
        ...(searchQuery ? [where('keywords', 'array-contains', searchQuery.toLowerCase())] : []),
        orderBy('createdAt', 'desc'),
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(LIMIT_NUMBER)
      );

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
        filterAndQueryTerm,
        shouldReset,
      };
    } catch (error) {
      throw new Error('Failed to fetch leads: ' + (error as Error).message);
    }
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearLeads: (state) => {
      state.leads = [];
      state.lastVisible = null;
      state.hasMore = true;
      state.currentFilter = null;
      state.loading = false;
      state.error = null;
    },
    addLead: (state, action) => {
      const lead = action.payload as LeadProps;
      const exists = state.leads.some((l) => l.id === lead.id);
      if (!exists) {
        state.leads.unshift(lead);
      }
    },
    updateLead: (state, action) => {
      const lead = action.payload as LeadProps;
      const index = state.leads.findIndex((l) => l.id === lead.id);
      if (index !== -1) {
        state.leads[index] = {
          ...state.leads[index],
          ...lead,
        };
      }
    },
    removeLead: (state, action) => {
      const leadId = action.payload as string;
      state.leads = state.leads.filter((l) => l.id !== leadId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        const { leads, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;

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
        state.currentFilter = filterAndQueryTerm;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      });
  },
});

export const { clearLeads, addLead, updateLead, removeLead } = leadSlice.actions;
export default leadSlice.reducer;
