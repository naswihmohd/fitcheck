import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { KeywordProps } from '../data/keywordTypes';

const COLLECTION_NAME = 'keywords';
const LIMIT_NUMBER = 10;

export interface KeywordsState {
    keywords: KeywordProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: KeywordsState = {
    keywords: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchKeywords = createAsyncThunk(
    'keywords/fetchKeywords',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        
        try {
            const state = getState() as RootState & { keywords?: KeywordsState };
            const keywordsState = state.keywords || initialState;
            
            // Reset pagination if search query changed
            const shouldReset = keywordsState.currentFilter && keywordsState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : keywordsState.lastVisible;

            const keywordsCollectionRef = collection(db, COLLECTION_NAME);

            const keywordsQuery = query(
                keywordsCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(keywordsQuery);
            const newKeywords: KeywordProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as KeywordProps));

            return {
                keywords: newKeywords,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newKeywords.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch keywords: ' + (error as Error).message);
        }
    }
);

const keywordsSlice = createSlice({
    name: 'keywords',
    initialState,
    reducers: {
        clearKeywords: state => {
            state.keywords = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addKeyword: (state, action) => {
            const { keyword } = action.payload as {
                keyword: KeywordProps;
            };

            // Check if keyword already exists
            const existingIndex = state.keywords.findIndex(k => k.id === keyword.id);
            if (existingIndex === -1) {
                // Add new keyword at the beginning (since keywords are ordered by createdAt desc)
                state.keywords = [keyword, ...state.keywords];
            }
        },
        updateKeyword: (state, action) => {
            const { keyword } = action.payload as {
                keyword: KeywordProps;
            };

            const index = state.keywords.findIndex(k => k.id === keyword.id);
            if (index !== -1) {
                state.keywords[index] = {
                    ...state.keywords[index],
                    ...keyword,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchKeywords.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKeywords.fulfilled, (state, action) => {
                state.loading = false;
                const { keywords, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                
                // Reset keywords if search query changed
                if (shouldReset) {
                    state.keywords = [];
                    state.lastVisible = null;
                }
                
                const uniqueKeywords = keywords.filter(
                    newKeyword => !state.keywords.some(keyword => keyword.id === newKeyword.id)
                );
                state.keywords = [...state.keywords, ...uniqueKeywords];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchKeywords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch keywords';
            })
    },
});

export const { clearKeywords, addKeyword, updateKeyword } = keywordsSlice.actions;
export default keywordsSlice.reducer;
