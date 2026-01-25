import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { BrandProps } from '../data/brandTypes';

const COLLECTION_NAME = 'brands';
const LIMIT_NUMBER = 10;

export interface BrandsState {
    brands: BrandProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: BrandsState = {
    brands: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchBrands = createAsyncThunk(
    'brands/fetchBrands',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            const state = getState() as RootState & { brands?: BrandsState };
            const brandsState = state.brands || initialState;
            
            // Reset pagination if search query changed
            const shouldReset = brandsState.currentFilter && brandsState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : brandsState.lastVisible;

            const brandsCollectionRef = collection(db, COLLECTION_NAME);

            const brandsQuery = query(
                brandsCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(brandsQuery);
            const newBrands: BrandProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as BrandProps));

            return {
                brands: newBrands,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newBrands.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch brands: ' + (error as Error).message);
        }
    }
);

const brandsSlice = createSlice({
    name: 'brands',
    initialState,
    reducers: {
        clearBrands: state => {
            state.brands = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addBrand: (state, action) => {
            const { brand } = action.payload as {
                brand: BrandProps;
            };

            // Check if brand already exists
            const existingIndex = state.brands.findIndex(b => b.id === brand.id);
            if (existingIndex === -1) {
                // Add new brand at the beginning (since brands are ordered by createdAt desc)
                state.brands = [brand, ...state.brands];
            }
        },
        updateBrand: (state, action) => {
            const { brand } = action.payload as {
                brand: BrandProps;
            };

            const index = state.brands.findIndex(b => b.id === brand.id);
            if (index !== -1) {
                state.brands[index] = {
                    ...state.brands[index],
                    ...brand,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBrands.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                const { brands, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                // Reset brands if search query changed
                if (shouldReset) {
                    state.brands = [];
                    state.lastVisible = null;
                }
                
                const uniqueBrands = brands.filter(
                    newBrand => !state.brands.some(brand => brand.id === newBrand.id)
                );
                state.brands = [...state.brands, ...uniqueBrands];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch brands';
            })
    },
});

export const { clearBrands, addBrand, updateBrand } = brandsSlice.actions;
export default brandsSlice.reducer;
