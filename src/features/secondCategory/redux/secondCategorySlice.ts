import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { SecondCategoryProps } from '../data/secondCategoryTypes';

const COLLECTION_NAME = 'secondCategories';
const LIMIT_NUMBER = 10;

export interface SecondCategoriesState {
    firstCategorySecondCategories: Record<string, {
        secondCategories: SecondCategoryProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: SecondCategoriesState = {
    firstCategorySecondCategories: {},
    loading: false,
    error: null,
};

export const fetchSecondCategories = createAsyncThunk(
    'secondCategories/fetchSecondCategories',
    async ({ params }: { params: { firstCategoryId: string; searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const firstCategoryId = params?.firstCategoryId;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            if (!firstCategoryId) {
                throw new Error('First Category ID is required');
            }

            const state = getState() as RootState;
            const firstCategorySecondCategories = state.secondCategories.firstCategorySecondCategories;
            const firstCategoryData = firstCategorySecondCategories[firstCategoryId] || { lastVisible: null, currentFilter: undefined };

            // Reset pagination if search query changed
            const shouldReset = firstCategoryData.currentFilter && firstCategoryData.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : firstCategoryData.lastVisible;

            const secondCategoriesCollectionRef = collection(db, "firstCategories", firstCategoryId, COLLECTION_NAME);

            const secondCategoriesQuery = query(
                secondCategoriesCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("positionAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(secondCategoriesQuery);
            const newSecondCategories: SecondCategoryProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                firstCategoryId: firstCategoryId,
            } as SecondCategoryProps));

            return {
                id: firstCategoryId,
                secondCategories: newSecondCategories,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newSecondCategories.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch second categories: ' + (error as Error).message);
        }
    }
);

const secondCategoriesSlice = createSlice({
    name: 'secondCategories',
    initialState,
    reducers: {
        clearSecondCategories: state => {
            state.firstCategorySecondCategories = {};
            state.loading = false;
            state.error = null;
        },
        addSecondCategory: (state, action) => {
            const { firstCategoryId, secondCategory } = action.payload as {
                firstCategoryId: string;
                secondCategory: SecondCategoryProps;
            };

            if (!state.firstCategorySecondCategories[firstCategoryId]) {
                state.firstCategorySecondCategories[firstCategoryId] = {
                    secondCategories: [secondCategory],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                };
            }

            const exists = state.firstCategorySecondCategories[firstCategoryId].secondCategories.some(sc => sc.id === secondCategory.id);
            if (!exists) {
                state.firstCategorySecondCategories[firstCategoryId].secondCategories.unshift(secondCategory); // add to top
            }
        },
        updateSecondCategory: (state, action) => {
            const { firstCategoryId, secondCategory } = action.payload as {
                firstCategoryId: string;
                secondCategory: SecondCategoryProps;
            };

            if (!state.firstCategorySecondCategories[firstCategoryId]) return;

            const index = state.firstCategorySecondCategories[firstCategoryId].secondCategories.findIndex(sc => sc.id === secondCategory.id);
            if (index !== -1) {
                state.firstCategorySecondCategories[firstCategoryId].secondCategories[index] = {
                    ...state.firstCategorySecondCategories[firstCategoryId].secondCategories[index],
                    ...secondCategory,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchSecondCategories.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSecondCategories.fulfilled, (state, action) => {
                state.loading = false;
                const { id, secondCategories, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                if (!state.firstCategorySecondCategories[id]) {
                    state.firstCategorySecondCategories[id] = { 
                        secondCategories: [], 
                        lastVisible: null, 
                        hasMore: true, 
                        currentFilter: filterAndQueryTerm 
                    };
                }
                
                // Reset secondCategories if search query changed
                if (shouldReset) {
                    state.firstCategorySecondCategories[id].secondCategories = [];
                    state.firstCategorySecondCategories[id].lastVisible = null;
                }
                
                const uniqueSecondCategories = secondCategories.filter(
                    newSecondCategory => !state.firstCategorySecondCategories[id].secondCategories.some(secondCategory => secondCategory.id === newSecondCategory.id)
                );
                state.firstCategorySecondCategories[id].secondCategories = [...state.firstCategorySecondCategories[id].secondCategories, ...uniqueSecondCategories];

                state.firstCategorySecondCategories[id].lastVisible = lastVisible;
                state.firstCategorySecondCategories[id].hasMore = hasMore;
                state.firstCategorySecondCategories[id].currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchSecondCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch second categories';
            })
    },
});

export const { clearSecondCategories, addSecondCategory, updateSecondCategory } = secondCategoriesSlice.actions;
export default secondCategoriesSlice.reducer;
