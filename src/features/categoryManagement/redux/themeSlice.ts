import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { StoreThemeProps } from '../../storeTheme/data/themeTypes';
import type { CategorySettingsProps } from '../data/categoryTypes';

export interface ThemeState {
    storeTheme: StoreThemeProps | null;
    loading: boolean;
    error: string | null;
}

const initialState: ThemeState = {
    storeTheme: null,
    loading: false,
    error: null,
};

export const fetchThemeData = createAsyncThunk(
    'theme/fetchThemeData',
    async () => {
        try {
            const docRef = doc(db, 'general', 'themes');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return data as StoreThemeProps;
            }
            // Return default data structure if document doesn't exist
            return {
                categorySettings: {
                    firstCategoryEnabled: false,
                    secondCategoryEnabled: false,
                    thirdCategoryEnabled: false,
                    fourthCategoryEnabled: false,
                },
                heroTheme: null,
            } as StoreThemeProps;
        } catch (error) {
            throw new Error('Failed to fetch theme data: ' + (error as Error).message);
        }
    }
);

export const updateCategorySettings = createAsyncThunk(
    'theme/updateCategorySettings',
    async (settings: CategorySettingsProps) => {
        try {
            const docRef = doc(db, 'general', 'themes');
            const storeTheme: StoreThemeProps = { categorySettings: settings };
            await setDoc(docRef, storeTheme, { merge: true });
            return storeTheme;
        } catch (error) {
            throw new Error('Failed to update category settings: ' + (error as Error).message);
        }
    }
);

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        clearThemeData: state => {
            state.storeTheme = null;
            state.loading = false;
            state.error = null;
        },
        updateCategorySettingsLocal: (state, action: { payload: CategorySettingsProps }) => {
            state.storeTheme = { ...state.storeTheme, categorySettings: action.payload } as StoreThemeProps;
        },
        updateHeroThemeLocal: (state, action: { payload: StoreThemeProps['heroTheme'] }) => {
            state.storeTheme = { ...state.storeTheme, heroTheme: action.payload } as StoreThemeProps;
        },
        updateProductCardThemeLocal: (state, action: { payload: StoreThemeProps['productCardTheme'] }) => {
            state.storeTheme = { ...state.storeTheme, productCardTheme: action.payload } as StoreThemeProps;
        },
        updateTrendingProductCardThemeLocal: (state, action: { payload: StoreThemeProps['trendingProductCardTheme'] }) => {
            state.storeTheme = { ...state.storeTheme, trendingProductCardTheme: action.payload } as StoreThemeProps;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchThemeData.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchThemeData.fulfilled, (state, action) => {
                state.loading = false;
                state.storeTheme = action.payload;
                state.error = null;
            })
            .addCase(fetchThemeData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch theme data';
            })
            .addCase(updateCategorySettings.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategorySettings.fulfilled, (state, action) => {
                state.loading = false;
                state.storeTheme = action.payload;
                state.error = null;
            })
            .addCase(updateCategorySettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update category settings';
            });
    },
});

export const { clearThemeData,
    updateCategorySettingsLocal,
    updateHeroThemeLocal,
    updateProductCardThemeLocal,
    updateTrendingProductCardThemeLocal,
} = themeSlice.actions;
export default themeSlice.reducer;
