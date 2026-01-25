import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { FirstCategoryProps } from '../data/firstCategoryTypes';

const COLLECTION_NAME = 'firstCategories';
const LIMIT_NUMBER = 10;

export interface FirstCategoriesState {
    firstCategories: FirstCategoryProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: FirstCategoriesState = {
    firstCategories: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchFirstCategories = createAsyncThunk(
    'firstCategories/fetchFirstCategories',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            const state = getState() as RootState & { firstCategories?: FirstCategoriesState };
            const firstCategoriesState = state.firstCategories || initialState;
            
            // Reset pagination if search query changed
            const shouldReset = firstCategoriesState.currentFilter && firstCategoriesState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : firstCategoriesState.lastVisible;

            const firstCategoriesCollectionRef = collection(db, COLLECTION_NAME);

            const firstCategoriesQuery = query(
                firstCategoriesCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("positionAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(firstCategoriesQuery);
            const newFirstCategories: FirstCategoryProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as FirstCategoryProps));

            return {
                firstCategories: newFirstCategories,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newFirstCategories.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch first categories: ' + (error as Error).message);
        }
    }
);

const firstCategoriesSlice = createSlice({
    name: 'firstCategories',
    initialState,
    reducers: {
        clearFirstCategories: state => {
            state.firstCategories = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addFirstCategory: (state, action) => {
            const { firstCategory } = action.payload as {
                firstCategory: FirstCategoryProps;
            };

            // Check if firstCategory already exists
            const existingIndex = state.firstCategories.findIndex(fc => fc.id === firstCategory.id);
            if (existingIndex === -1) {
                // Add new firstCategory at the beginning (since firstCategories are ordered by createdAt desc)
                state.firstCategories = [firstCategory, ...state.firstCategories];
            }
        },
        updateFirstCategory: (state, action) => {
            const { firstCategory } = action.payload as {
                firstCategory: FirstCategoryProps;
            };

            const index = state.firstCategories.findIndex(fc => fc.id === firstCategory.id);
            if (index !== -1) {
                state.firstCategories[index] = {
                    ...state.firstCategories[index],
                    ...firstCategory,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchFirstCategories.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFirstCategories.fulfilled, (state, action) => {
                state.loading = false;
                const { firstCategories, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                // Reset firstCategories if search query changed
                if (shouldReset) {
                    state.firstCategories = [];
                    state.lastVisible = null;
                }
                
                const uniqueFirstCategories = firstCategories.filter(
                    newFirstCategory => !state.firstCategories.some(firstCategory => firstCategory.id === newFirstCategory.id)
                );
                state.firstCategories = [...state.firstCategories, ...uniqueFirstCategories];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchFirstCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch first categories';
            })
    },
});

export const { clearFirstCategories, addFirstCategory, updateFirstCategory } = firstCategoriesSlice.actions;
export default firstCategoriesSlice.reducer;
