import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import type { BranchProps } from '../../addBranch/data/branchTypes';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'branches';
const LIMIT_NUMBER = 8;

interface baranchesState {
    branches: BranchProps[];
    loading: boolean;
    error: string | null;
    lastVisible: any | null;
    hasMore: boolean;
    targetLoading: boolean;
    currentFilter?: string | null;
}

const initialState: baranchesState = {
    branches: [],
    loading: false,
    error: null,
    lastVisible: null,
    hasMore: true,
    targetLoading: false,
    currentFilter: null,
};

export const fetchBranches = createAsyncThunk(
    'branches/fetchBranches',
    async (params: { searchQuery?: string | null } = {}, { getState }) => {
        try {
            const state = getState() as { branches: baranchesState };
            const searchQuery = params?.searchQuery || null;

            // Process search query: lowercase and remove all spaces
            const processedSearchQuery = searchQuery
                ? searchQuery.toLowerCase().replace(/\s/g, '')
                : null;

            // Reset pagination if search changed
            const shouldReset = state.branches.currentFilter !== processedSearchQuery;
            const lastVisible = shouldReset ? null : state.branches.lastVisible;

            let branchesQuery;
            const queryConstraints = [
                ...(processedSearchQuery ? [where("keywords", "array-contains", processedSearchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            ];

            branchesQuery = query(
                collection(db, COLLECTION_NAME),
                ...queryConstraints
            );

            const querySnapshot = await getDocs(branchesQuery);
            const newBranches: BranchProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(), id: doc.id,
            })) as BranchProps[];

            return {
                branches: newBranches,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newBranches.length === LIMIT_NUMBER,
                processedSearchQuery,
                shouldReset,
            };
        } catch (error) {
            throw new Error('Failed to fetch branches' + (error as Error).message);
        }
    }
);


const branchesSlice = createSlice({
    name: 'branches',
    initialState,
    reducers: {
        updateBranchData: (state, action) => {
            const updatedBranch = action.payload;
            state.branches = state.branches.map(branch =>
                branch.id === updatedBranch.id ? { ...branch, ...updatedBranch } : branch
            );
        },
        addBranch: (state, action) => {
            const newBranch = action.payload as BranchProps;
            // Check if branch already exists to avoid duplicates
            const branchExists = state.branches.some(branch => branch.id === newBranch.id);
            if (!branchExists) {
                // Add new branch at the beginning since branches are ordered by createdAt desc
                state.branches = [newBranch, ...state.branches];
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBranches.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranches.fulfilled, (state, action) => {
                state.loading = false;

                // Reset branches if search changed
                if (action.payload.shouldReset) {
                    state.branches = [];
                    state.lastVisible = null;
                }

                const uniquebranches = action.payload.branches.filter(
                    newProduct => !state.branches.some(product => product.id === newProduct.id)
                );

                state.branches = [...state.branches, ...uniquebranches];
                state.lastVisible = action.payload.lastVisible;
                state.hasMore = action.payload.hasMore;
                state.currentFilter = action.payload.processedSearchQuery;
            })
            .addCase(fetchBranches.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branches';
            })
    },
});

export const { updateBranchData, addBranch } = branchesSlice.actions;
export default branchesSlice.reducer;