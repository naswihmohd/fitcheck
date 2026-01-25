import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { ThirdCategoryProps } from '../data/thirdCategoryTypes';

const COLLECTION_NAME = 'thirdCategories';
const LIMIT_NUMBER = 10;

export interface ThirdCategoriesState {
    secondCategoryThirdCategories: Record<string, {
        thirdCategories: ThirdCategoryProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: ThirdCategoriesState = {
    secondCategoryThirdCategories: {},
    loading: false,
    error: null,
};

export const fetchThirdCategories = createAsyncThunk(
    'thirdCategories/fetchThirdCategories',
    async ({ params }: { params: { firstCategoryId: string; secondCategoryId: string; searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const firstCategoryId = params?.firstCategoryId;
        const secondCategoryId = params?.secondCategoryId;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            if (!firstCategoryId) {
                throw new Error('First Category ID is required');
            }
            if (!secondCategoryId) {
                throw new Error('Second Category ID is required');
            }

            const state = getState() as RootState;
            const secondCategoryThirdCategories = state.thirdCategories.secondCategoryThirdCategories;
            const secondCategoryData = secondCategoryThirdCategories[secondCategoryId] || { lastVisible: null, currentFilter: undefined };

            // Reset pagination if search query changed
            const shouldReset = secondCategoryData.currentFilter && secondCategoryData.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : secondCategoryData.lastVisible;

            const thirdCategoriesCollectionRef = collection(db, "firstCategories", firstCategoryId, "secondCategories", secondCategoryId, COLLECTION_NAME);

            const thirdCategoriesQuery = query(
                thirdCategoriesCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("positionAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(thirdCategoriesQuery);
            const newThirdCategories: ThirdCategoryProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                firstCategoryId: firstCategoryId,
                secondCategoryId: secondCategoryId,
            } as ThirdCategoryProps));

            return {
                id: secondCategoryId,
                thirdCategories: newThirdCategories,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newThirdCategories.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch third categories: ' + (error as Error).message);
        }
    }
);

const thirdCategoriesSlice = createSlice({
    name: 'thirdCategories',
    initialState,
    reducers: {
        clearThirdCategories: state => {
            state.secondCategoryThirdCategories = {};
            state.loading = false;
            state.error = null;
        },
        addThirdCategory: (state, action) => {
            const { secondCategoryId, thirdCategory } = action.payload as {
                secondCategoryId: string;
                thirdCategory: ThirdCategoryProps;
            };

            if (!state.secondCategoryThirdCategories[secondCategoryId]) {
                state.secondCategoryThirdCategories[secondCategoryId] = {
                    thirdCategories: [thirdCategory],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                };
            }

            const exists = state.secondCategoryThirdCategories[secondCategoryId].thirdCategories.some(tc => tc.id === thirdCategory.id);
            if (!exists) {
                state.secondCategoryThirdCategories[secondCategoryId].thirdCategories.unshift(thirdCategory); // add to top
            }
        },
        updateThirdCategory: (state, action) => {
            const { secondCategoryId, thirdCategory } = action.payload as {
                secondCategoryId: string;
                thirdCategory: ThirdCategoryProps;
            };

            if (!state.secondCategoryThirdCategories[secondCategoryId]) return;

            const index = state.secondCategoryThirdCategories[secondCategoryId].thirdCategories.findIndex(tc => tc.id === thirdCategory.id);
            if (index !== -1) {
                state.secondCategoryThirdCategories[secondCategoryId].thirdCategories[index] = {
                    ...state.secondCategoryThirdCategories[secondCategoryId].thirdCategories[index],
                    ...thirdCategory,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchThirdCategories.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchThirdCategories.fulfilled, (state, action) => {
                state.loading = false;
                const { id, thirdCategories, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                if (!state.secondCategoryThirdCategories[id]) {
                    state.secondCategoryThirdCategories[id] = { 
                        thirdCategories: [], 
                        lastVisible: null, 
                        hasMore: true, 
                        currentFilter: filterAndQueryTerm 
                    };
                }
                
                // Reset thirdCategories if search query changed
                if (shouldReset) {
                    state.secondCategoryThirdCategories[id].thirdCategories = [];
                    state.secondCategoryThirdCategories[id].lastVisible = null;
                }
                
                const uniqueThirdCategories = thirdCategories.filter(
                    newThirdCategory => !state.secondCategoryThirdCategories[id].thirdCategories.some(thirdCategory => thirdCategory.id === newThirdCategory.id)
                );
                state.secondCategoryThirdCategories[id].thirdCategories = [...state.secondCategoryThirdCategories[id].thirdCategories, ...uniqueThirdCategories];

                state.secondCategoryThirdCategories[id].lastVisible = lastVisible;
                state.secondCategoryThirdCategories[id].hasMore = hasMore;
                state.secondCategoryThirdCategories[id].currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchThirdCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch third categories';
            })
    },
});

export const { clearThirdCategories, addThirdCategory, updateThirdCategory } = thirdCategoriesSlice.actions;
export default thirdCategoriesSlice.reducer;
