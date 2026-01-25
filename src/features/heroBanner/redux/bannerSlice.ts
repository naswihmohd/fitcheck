import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { BannerProps } from '../data/heroBannerTypes';

export interface BannerState {
    bannerData: BannerProps | null;
    loading: boolean;
    error: string | null;
}

const initialState: BannerState = {
    bannerData: null,
    loading: false,
    error: null,
};

export const fetchBannerData = createAsyncThunk(
    'banners/fetchBannerData',
    async () => {
        try {
            const docRef = doc(db, 'general', 'banners');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as BannerProps;
            } else {
                // Return empty data structure if document doesn't exist
                return {
                    heroBanners: {},
                } as BannerProps;
            }
        } catch (error) {
            throw new Error('Failed to fetch banner data: ' + (error as Error).message);
        }
    }
);

const bannerSlice = createSlice({
    name: 'banners',
    initialState,
    reducers: {
        clearBannerData: state => {
            state.bannerData = null;
            state.loading = false;
            state.error = null;
        },
        updateBannerData: (state, action: { payload: { bannerData: BannerProps } }) => {
            state.bannerData = action.payload.bannerData;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBannerData.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBannerData.fulfilled, (state, action) => {
                state.loading = false;
                state.bannerData = action.payload;
                state.error = null;
            })
            .addCase(fetchBannerData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch banner data';
            });
    },
});

export const { clearBannerData, updateBannerData } = bannerSlice.actions;
export default bannerSlice.reducer;
