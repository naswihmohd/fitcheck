import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { ColorProps } from '../data/colorTypes';

const COLLECTION_NAME = 'colors';
const LIMIT_NUMBER = 10;

export interface ColorsState {
    colors: ColorProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ColorsState = {
    colors: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchColors = createAsyncThunk(
    'colors/fetchColors',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            const state = getState() as RootState & { colors?: ColorsState };
            const colorsState = state.colors || initialState;
            
            // Reset pagination if search query changed
            const shouldReset = colorsState.currentFilter && colorsState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : colorsState.lastVisible;

            const colorsCollectionRef = collection(db, COLLECTION_NAME);

            const colorsQuery = query(
                colorsCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(colorsQuery);
            const newColors: ColorProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as ColorProps));

            return {
                colors: newColors,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newColors.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch colors: ' + (error as Error).message);
        }
    }
);

const colorsSlice = createSlice({
    name: 'colors',
    initialState,
    reducers: {
        clearColors: state => {
            state.colors = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addColor: (state, action) => {
            const { color } = action.payload as {
                color: ColorProps;
            };

            // Check if color already exists
            const existingIndex = state.colors.findIndex(c => c.id === color.id);
            if (existingIndex === -1) {
                // Add new color at the beginning (since colors are ordered by createdAt desc)
                state.colors = [color, ...state.colors];
            }
        },
        updateColor: (state, action) => {
            const { color } = action.payload as {
                color: ColorProps;
            };

            const index = state.colors.findIndex(c => c.id === color.id);
            if (index !== -1) {
                state.colors[index] = {
                    ...state.colors[index],
                    ...color,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchColors.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColors.fulfilled, (state, action) => {
                state.loading = false;
                const { colors, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                // Reset colors if search query changed
                if (shouldReset) {
                    state.colors = [];
                    state.lastVisible = null;
                }
                
                const uniqueColors = colors.filter(
                    newColor => !state.colors.some(color => color.id === newColor.id)
                );
                state.colors = [...state.colors, ...uniqueColors];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchColors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch colors';
            })
    },
});

export const { clearColors, addColor, updateColor } = colorsSlice.actions;
export default colorsSlice.reducer;
