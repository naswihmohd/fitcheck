import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { CouponProps } from '../data/couponTypes';

const COLLECTION_NAME = 'coupons';
const LIMIT_NUMBER = 10;

export interface CouponsState {
    coupons: CouponProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: CouponsState = {
    coupons: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchCoupons = createAsyncThunk(
    'coupons/fetchCoupons',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;

        try {
            const state = getState() as RootState & { coupons?: CouponsState };
            const couponsState = state.coupons || initialState;

            const shouldReset = couponsState.currentFilter && couponsState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : couponsState.lastVisible;

            const couponsCollectionRef = collection(db, COLLECTION_NAME);

            const couponsQuery = query(
                couponsCollectionRef,
                ...(searchQuery ? [where('keywords', 'array-contains', searchQuery)] : []),
                orderBy('createdAt', 'desc'),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(couponsQuery);
            const newCoupons: CouponProps[] = querySnapshot.docs.map(
                doc =>
                    ({
                        ...doc.data(),
                        id: doc.id,
                    }) as CouponProps
            );

            return {
                coupons: newCoupons,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newCoupons.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };
        } catch (error) {
            throw new Error('Failed to fetch coupons: ' + (error as Error).message);
        }
    }
);

const couponsSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        clearCoupons: state => {
            state.coupons = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addCoupon: (state, action) => {
            const { coupon } = action.payload as {
                coupon: CouponProps;
            };

            const existingIndex = state.coupons.findIndex(c => c.id === coupon.id);
            if (existingIndex === -1) {
                state.coupons = [coupon, ...state.coupons];
            }
        },
        updateCoupon: (state, action) => {
            const { coupon } = action.payload as {
                coupon: CouponProps;
            };

            const index = state.coupons.findIndex(c => c.id === coupon.id);
            if (index !== -1) {
                state.coupons[index] = {
                    ...state.coupons[index],
                    ...coupon,
                };
            }
        },
        removeCoupon: (state, action: PayloadAction<string>) => {
            state.coupons = state.coupons.filter(c => c.id !== action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchCoupons.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                state.loading = false;
                const { coupons, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;

                if (shouldReset) {
                    state.coupons = [];
                    state.lastVisible = null;
                }

                const uniqueCoupons = coupons.filter(
                    newCoupon => !state.coupons.some(coupon => coupon.id === newCoupon.id)
                );
                state.coupons = [...state.coupons, ...uniqueCoupons];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch coupons';
            });
    },
});

export const { clearCoupons, addCoupon, updateCoupon, removeCoupon } = couponsSlice.actions;
export default couponsSlice.reducer;
