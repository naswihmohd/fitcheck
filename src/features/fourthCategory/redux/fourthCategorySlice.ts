import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { FourthCategoryProps } from '../data/fourthCategoryTypes';

const COLLECTION_NAME = 'fourthCategories';
const LIMIT_NUMBER = 10;

export interface FourthCategoriesState {
    thirdCategoryFourthCategories: Record<string, {
        fourthCategories: FourthCategoryProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: FourthCategoriesState = {
    thirdCategoryFourthCategories: {},
    loading: false,
    error: null,
};

export const fetchFourthCategories = createAsyncThunk(
    'fourthCategories/fetchFourthCategories',
    async ({ params }: { params: { firstCategoryId: string; secondCategoryId: string; thirdCategoryId: string; searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const firstCategoryId = params?.firstCategoryId;
        const secondCategoryId = params?.secondCategoryId;
        const thirdCategoryId = params?.thirdCategoryId;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            if (!firstCategoryId) {
                throw new Error('First Category ID is required');
            }
            if (!secondCategoryId) {
                throw new Error('Second Category ID is required');
            }
            if (!thirdCategoryId) {
                throw new Error('Third Category ID is required');
            }

            const state = getState() as RootState;
            const thirdCategoryFourthCategories = state.fourthCategories.thirdCategoryFourthCategories;
            const thirdCategoryData = thirdCategoryFourthCategories[thirdCategoryId] || { lastVisible: null, currentFilter: undefined };

            // Reset pagination if search query changed
            const shouldReset = thirdCategoryData.currentFilter && thirdCategoryData.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : thirdCategoryData.lastVisible;

            const fourthCategoriesCollectionRef = collection(db, "firstCategories", firstCategoryId, "secondCategories", secondCategoryId, "thirdCategories", thirdCategoryId, COLLECTION_NAME);

            const fourthCategoriesQuery = query(
                fourthCategoriesCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("positionAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(fourthCategoriesQuery);
            const newFourthCategories: FourthCategoryProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                firstCategoryId: firstCategoryId,
                secondCategoryId: secondCategoryId,
                thirdCategoryId: thirdCategoryId,
            } as FourthCategoryProps));

            return {
                id: thirdCategoryId,
                fourthCategories: newFourthCategories,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newFourthCategories.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch fourth categories: ' + (error as Error).message);
        }
    }
);

const fourthCategoriesSlice = createSlice({
    name: 'fourthCategories',
    initialState,
    reducers: {
        clearFourthCategories: state => {
            state.thirdCategoryFourthCategories = {};
            state.loading = false;
            state.error = null;
        },
        addFourthCategory: (state, action) => {
            const { thirdCategoryId, fourthCategory } = action.payload as {
                thirdCategoryId: string;
                fourthCategory: FourthCategoryProps;
            };

            if (!state.thirdCategoryFourthCategories[thirdCategoryId]) {
                state.thirdCategoryFourthCategories[thirdCategoryId] = {
                    fourthCategories: [fourthCategory],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                };
            }

            const exists = state.thirdCategoryFourthCategories[thirdCategoryId].fourthCategories.some(fc => fc.id === fourthCategory.id);
            if (!exists) {
                state.thirdCategoryFourthCategories[thirdCategoryId].fourthCategories.unshift(fourthCategory); // add to top
            }
        },
        updateFourthCategory: (state, action) => {
            const { thirdCategoryId, fourthCategory } = action.payload as {
                thirdCategoryId: string;
                fourthCategory: FourthCategoryProps;
            };

            if (!state.thirdCategoryFourthCategories[thirdCategoryId]) return;

            const index = state.thirdCategoryFourthCategories[thirdCategoryId].fourthCategories.findIndex(fc => fc.id === fourthCategory.id);
            if (index !== -1) {
                state.thirdCategoryFourthCategories[thirdCategoryId].fourthCategories[index] = {
                    ...state.thirdCategoryFourthCategories[thirdCategoryId].fourthCategories[index],
                    ...fourthCategory,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchFourthCategories.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFourthCategories.fulfilled, (state, action) => {
                state.loading = false;
                const { id, fourthCategories, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                if (!state.thirdCategoryFourthCategories[id]) {
                    state.thirdCategoryFourthCategories[id] = { 
                        fourthCategories: [], 
                        lastVisible: null, 
                        hasMore: true, 
                        currentFilter: filterAndQueryTerm 
                    };
                }
                
                // Reset fourthCategories if search query changed
                if (shouldReset) {
                    state.thirdCategoryFourthCategories[id].fourthCategories = [];
                    state.thirdCategoryFourthCategories[id].lastVisible = null;
                }
                
                const uniqueFourthCategories = fourthCategories.filter(
                    newFourthCategory => !state.thirdCategoryFourthCategories[id].fourthCategories.some(fourthCategory => fourthCategory.id === newFourthCategory.id)
                );
                state.thirdCategoryFourthCategories[id].fourthCategories = [...state.thirdCategoryFourthCategories[id].fourthCategories, ...uniqueFourthCategories];

                state.thirdCategoryFourthCategories[id].lastVisible = lastVisible;
                state.thirdCategoryFourthCategories[id].hasMore = hasMore;
                state.thirdCategoryFourthCategories[id].currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchFourthCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch fourth categories';
            })
    },
});

export const { clearFourthCategories, addFourthCategory, updateFourthCategory } = fourthCategoriesSlice.actions;
export default fourthCategoriesSlice.reducer;
