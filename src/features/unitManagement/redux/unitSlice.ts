import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { UnitProps } from '../data/unitTypes';

const COLLECTION_NAME = 'units';
const LIMIT_NUMBER = 10;

export interface UnitsState {
    units: UnitProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: UnitsState = {
    units: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchUnits = createAsyncThunk(
    'units/fetchUnits',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            const state = getState() as RootState & { units?: UnitsState };
            const unitsState = state.units || initialState;
            
            // Reset pagination if search query changed
            const shouldReset = unitsState.currentFilter && unitsState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : unitsState.lastVisible;

            const unitsCollectionRef = collection(db, COLLECTION_NAME);

            const unitsQuery = query(
                unitsCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(unitsQuery);
            const newUnits: UnitProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as UnitProps));

            return {
                units: newUnits,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newUnits.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch units: ' + (error as Error).message);
        }
    }
);

const unitsSlice = createSlice({
    name: 'units',
    initialState,
    reducers: {
        clearUnits: state => {
            state.units = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addUnit: (state, action) => {
            const { unit } = action.payload as {
                unit: UnitProps;
            };

            // Check if unit already exists
            const existingIndex = state.units.findIndex(u => u.id === unit.id);
            if (existingIndex === -1) {
                // Add new unit at the beginning (since units are ordered by createdAt desc)
                state.units = [unit, ...state.units];
            }
        },
        updateUnit: (state, action) => {
            const { unit } = action.payload as {
                unit: UnitProps;
            };

            const index = state.units.findIndex(u => u.id === unit.id);
            if (index !== -1) {
                state.units[index] = {
                    ...state.units[index],
                    ...unit,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchUnits.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnits.fulfilled, (state, action) => {
                state.loading = false;
                const { units, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                // Reset units if search query changed
                if (shouldReset) {
                    state.units = [];
                    state.lastVisible = null;
                }
                
                const uniqueUnits = units.filter(
                    newUnit => !state.units.some(unit => unit.id === newUnit.id)
                );
                state.units = [...state.units, ...uniqueUnits];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch units';
            })
    },
});

export const { clearUnits, addUnit, updateUnit } = unitsSlice.actions;
export default unitsSlice.reducer;
