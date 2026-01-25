import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { ProductProps } from '../data/productTypes';

const COLLECTION_NAME = 'products';
const LIMIT_NUMBER = 10;

export interface ProductsState {
    products: ProductProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductsState = {
    products: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            const state = getState() as RootState & { products?: ProductsState };
            const productsState = state.products || initialState;
            
            // Reset pagination if search query changed
            const shouldReset = productsState.currentFilter && productsState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : productsState.lastVisible;

            const productsCollectionRef = collection(db, COLLECTION_NAME);

            const productsQuery = query(
                productsCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(productsQuery);
            const newProducts: ProductProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as ProductProps));

            return {
                products: newProducts,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newProducts.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch products: ' + (error as Error).message);
        }
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearProducts: state => {
            state.products = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addProduct: (state, action) => {
            const { product } = action.payload as {
                product: ProductProps;
            };

            // Check if product already exists
            const existingIndex = state.products.findIndex(p => p.id === product.id);
            if (existingIndex === -1) {
                // Add new product at the beginning (since products are ordered by createdAt desc)
                state.products = [product, ...state.products];
            }
        },
        updateProduct: (state, action) => {
            const { product } = action.payload as {
                product: ProductProps;
            };

            const index = state.products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                state.products[index] = {
                    ...state.products[index],
                    ...product,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchProducts.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                const { products, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                // Reset products if search query changed
                if (shouldReset) {
                    state.products = [];
                    state.lastVisible = null;
                }
                
                const uniqueProducts = products.filter(
                    newProduct => !state.products.some(product => product.id === newProduct.id)
                );
                state.products = [...state.products, ...uniqueProducts];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch products';
            })
    },
});

export const { clearProducts, addProduct, updateProduct } = productsSlice.actions;
export default productsSlice.reducer;
