import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { ApplicationProps } from '../data/applicationTypes';

export interface GeneralState {
    applicationData: ApplicationProps | null;
    loading: boolean;
    error: string | null;
}

const initialState: GeneralState = {
    applicationData: null,
    loading: false,
    error: null,
};

export const fetchApplicationData = createAsyncThunk(
    'general/fetchApplicationData',
    async () => {
        try {
            const docRef = doc(db, 'general', 'applicationData');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as ApplicationProps;
            } else {
                // Return empty data structure if document doesn't exist
                return {
                    companyInfo: {
                        companyName: '',
                        email: '',
                        phoneNumber: '',
                        taxNumber: '',
                        country: '',
                        currency: '',
                        address: '',
                    },
                } as ApplicationProps;
            }
        } catch (error) {
            throw new Error('Failed to fetch application data: ' + (error as Error).message);
        }
    }
);

const generalSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        clearApplicationData: state => {
            state.applicationData = null;
            state.loading = false;
            state.error = null;
        },
        updateApplicationData: (state, action: { payload: { applicationData: ApplicationProps } }) => {
            state.applicationData = action.payload.applicationData;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchApplicationData.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplicationData.fulfilled, (state, action) => {
                state.loading = false;
                state.applicationData = action.payload;
                state.error = null;
            })
            .addCase(fetchApplicationData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch application data';
            });
    },
});

export const { clearApplicationData, updateApplicationData } = generalSlice.actions;
export default generalSlice.reducer;
