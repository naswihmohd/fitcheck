import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { LeadProps, LeadStatus } from '../../leadsManagement/data/leadTypes';
import { LEAD_STATUS_OPTIONS } from '../../leadsManagement/data/leadTypes';

const COLLECTION_NAME = 'leads';
const LIMIT_NUMBER = 10;

export type GroupStatusCounts = Record<LeadStatus, number>;

export interface GroupsState {
  leads: LeadProps[];
  lastVisible: any | null;
  hasMore: boolean;
  currentFilter: LeadStatus | null;
  statusCounts: GroupStatusCounts;
  countsLoading: boolean;
  loading: boolean;
  error: string | null;
}

const emptyStatusCounts = (): GroupStatusCounts =>
  LEAD_STATUS_OPTIONS.reduce((acc, option) => {
    acc[option.value] = 0;
    return acc;
  }, {} as GroupStatusCounts);

const initialState: GroupsState = {
  leads: [],
  lastVisible: null,
  hasMore: true,
  currentFilter: null,
  statusCounts: emptyStatusCounts(),
  countsLoading: false,
  loading: false,
  error: null,
};

export const fetchGroupCounts = createAsyncThunk(
  'groups/fetchGroupCounts',
  async () => {
    try {
      const leadsCollectionRef = collection(db, COLLECTION_NAME);

      const results = await Promise.all(
        LEAD_STATUS_OPTIONS.map(async (option) => {
          const statusQuery = query(
            leadsCollectionRef,
            where('status', '==', option.value)
          );
          const snapshot = await getCountFromServer(statusQuery);
          return [option.value, snapshot.data().count] as const;
        })
      );

      return results.reduce((acc, [status, count]) => {
        acc[status] = count;
        return acc;
      }, emptyStatusCounts());
    } catch (error) {
      throw new Error('Failed to fetch group counts: ' + (error as Error).message);
    }
  }
);

export const fetchGroupLeads = createAsyncThunk(
  'groups/fetchGroupLeads',
  async ({ status }: { status: LeadStatus }, { getState }) => {
    try {
      const state = getState() as RootState;
      const groupsData = state.groups;

      const shouldReset = groupsData.currentFilter !== status;
      const lastVisible = shouldReset ? null : groupsData.lastVisible;

      const leadsCollectionRef = collection(db, COLLECTION_NAME);

      const leadsQuery = query(
        leadsCollectionRef,
        where('status', '==', status),
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
        status,
        shouldReset,
      };
    } catch (error) {
      throw new Error('Failed to fetch group leads: ' + (error as Error).message);
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroupLeads: (state) => {
      state.leads = [];
      state.lastVisible = null;
      state.hasMore = true;
      state.currentFilter = null;
      state.loading = false;
      state.error = null;
    },
    updateGroupLead: (state, action) => {
      const lead = action.payload as LeadProps;
      const index = state.leads.findIndex((l) => l.id === lead.id);
      if (index === -1) return;

      if (state.currentFilter && lead.status !== state.currentFilter) {
        state.leads.splice(index, 1);
        return;
      }

      state.leads[index] = {
        ...state.leads[index],
        ...lead,
      };
    },
    removeGroupLead: (state, action) => {
      const leadId = action.payload as string;
      state.leads = state.leads.filter((l) => l.id !== leadId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupCounts.pending, (state) => {
        state.countsLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.statusCounts = action.payload;
      })
      .addCase(fetchGroupCounts.rejected, (state, action) => {
        state.countsLoading = false;
        state.error = action.error.message || 'Failed to fetch group counts';
      })
      .addCase(fetchGroupLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupLeads.fulfilled, (state, action) => {
        state.loading = false;
        const { leads, lastVisible, hasMore, status, shouldReset } = action.payload;

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
        state.currentFilter = status;
      })
      .addCase(fetchGroupLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch group leads';
      });
  },
});

export const { clearGroupLeads, updateGroupLead, removeGroupLead } = groupSlice.actions;
export default groupSlice.reducer;
