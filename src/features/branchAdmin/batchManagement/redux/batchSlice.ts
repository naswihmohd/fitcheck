import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import type { RootState } from '../../../../general/redux/store';
import type { BatchProps } from '../data/batchTypes';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'batches';
const LIMIT_NUMBER = 10;

export interface BatchesState {
    courseBatches: Record<string, {
        batches: BatchProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: BatchesState = {
    courseBatches: {},
    loading: false,
    error: null,
};

export const fetchCourseBatches = createAsyncThunk(
    'courseBatches/fetchCourseBatches',
    async ({ params }: { params: { courseId: string; branchId: string; searchQuery: string | null } }, { getState }) => {
        const { courseId, branchId, searchQuery } = params;

        try {
            if (!branchId || !courseId) {
                throw new Error('Branch ID and Course ID are required');
            }

            const state = getState() as RootState;
            const courseBatches = state.branchBatches.courseBatches;
            const courseAllBatches = courseBatches[courseId] || { lastVisible: null, currentFilter: undefined };

            // Reset pagination if sort changed
            const shouldReset = courseAllBatches.currentFilter && courseAllBatches.currentFilter !== searchQuery;
            const lastVisible = shouldReset ? null : courseAllBatches.lastVisible;

            const batchesCollectionRef = collection(db, "branches", branchId, "courses", courseId, COLLECTION_NAME);

            const batchesQuery = query(
                batchesCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(batchesQuery);
            const newBatches: BatchProps[] = querySnapshot.docs.map(doc => doc.data() as BatchProps);

            return {
                courseId,
                batches: newBatches,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newBatches.length === LIMIT_NUMBER,
                searchQuery,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch course batches: ' + (error as Error).message);
        }
    }
);

const branchBatchesSlice = createSlice({
    name: 'branchBatches',
    initialState,
    reducers: {
        clearCourseBatches: state => {
            state.courseBatches = {};
            state.loading = false;
            state.error = null;
        },
        addBatch: (state, action) => {
            const { courseId, batch } = action.payload as {
                courseId: string;
                batch: BatchProps;
            };

            if (!state.courseBatches[courseId]) {
                state.courseBatches[courseId] = {
                    batches: [batch],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                };
            }

            const exists = state.courseBatches[courseId].batches.some(b => b.id === batch.id);
            if (!exists) {
                state.courseBatches[courseId].batches.unshift(batch); // add to top
            }
        },
        updateBatch: (state, action) => {
            const { courseId, batch } = action.payload as {
                courseId: string;
                batch: BatchProps;
            };

            if (!state.courseBatches[courseId]) return;

            const index = state.courseBatches[courseId].batches.findIndex(b => b.id === batch.id);
            if (index !== -1) {
                state.courseBatches[courseId].batches[index] = {
                    ...state.courseBatches[courseId].batches[index],
                    ...batch,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchCourseBatches.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseBatches.fulfilled, (state, action) => {
                state.loading = false;
                const { courseId, batches, lastVisible, hasMore, searchQuery, shouldReset } = action.payload;
                if (!state.courseBatches[courseId]) {
                    state.courseBatches[courseId] = { batches: [], lastVisible: null, hasMore: true, currentFilter: searchQuery };
                }
                // Reset batches if sort changed
                if (shouldReset) {
                    state.courseBatches[courseId].batches = [];
                    state.courseBatches[courseId].lastVisible = null;
                }
                const uniqueBatches = batches.filter(
                    newBatch => !state.courseBatches[courseId].batches.some(batch => batch.id === newBatch.id)
                );
                state.courseBatches[courseId].batches = [...state.courseBatches[courseId].batches, ...uniqueBatches as BatchProps[]];

                state.courseBatches[courseId].lastVisible = lastVisible;

                state.courseBatches[courseId].hasMore = hasMore;
                state.courseBatches[courseId].currentFilter = searchQuery;
            })
            .addCase(fetchCourseBatches.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch course batches';
            })
    },
});

export const { clearCourseBatches, addBatch, updateBatch } = branchBatchesSlice.actions;
export default branchBatchesSlice.reducer;

