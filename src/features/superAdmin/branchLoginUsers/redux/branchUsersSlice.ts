import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import type { UserProps } from '../../../login/data/userTypes';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'users';
const LIMIT_NUMBER = 10;

export interface AllClientsState {
    branchUsers: Record<string, {
        users: UserProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: AllClientsState = {
    branchUsers: {},
    loading: false,
    error: null,
};


export const fetchBranchUsers = createAsyncThunk(
    'branchUsers/fetchBranchUsers',
    async (params: { branchId: string, searchQuery: string | null }, { getState }) => {
        const { branchId } = params;
        const searchQuery = params?.searchQuery || null;

        try {
            const state = getState() as RootState;

            if (!branchId) {
                throw new Error('Branch ID is required');
            }

            const branchUsers = state.branchUsers.branchUsers;
            const branchUser = branchUsers[branchId] || { lastVisible: null, currentFilter: undefined };

            // Reset pagination if search query changed
            const shouldReset = branchUser.currentFilter !== searchQuery;
            const lastVisible = shouldReset ? null : branchUser.lastVisible;

            const branchUsersCollectionRef = collection(db, COLLECTION_NAME);

            const clientsQuery = query(
                branchUsersCollectionRef,
                where("branchId", "==", branchId),
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );


            const querySnapshot = await getDocs(clientsQuery);
            const newClients: UserProps[] = querySnapshot.docs.map(doc => doc.data() as UserProps);

            return {
                id: branchId,
                branchUsers: newClients,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newClients.length === LIMIT_NUMBER,
                searchQuery,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch branchUsers: ' + (error as Error).message);
        }
    }
);

const branchUserslice = createSlice({
    name: 'branchUsers',
    initialState,
    reducers: {
        addBranchUser: (state, action) => {
            const { branchId, user } = action.payload as {
                branchId: string;
                user: UserProps;
            };

            if (!state.branchUsers[branchId]) {
                state.branchUsers[branchId] = {
                    users: [],
                    lastVisible: null,
                    hasMore: true,
                };
            }

            const exists = state.branchUsers[branchId].users.some(t => t.id === user.id);
            if (!exists) {
                state.branchUsers[branchId].users.unshift(user); // add to top
            }
        },
        updateBranchUser: (state, action) => {
            const { branchId, user } = action.payload as {
                branchId: string;
                user: UserProps;
            };

            if (!state.branchUsers[branchId]) return;

            const index = state.branchUsers[branchId].users.findIndex(t => t.id === user.id);
            if (index !== -1) {
                state.branchUsers[branchId].users[index] = {
                    ...state.branchUsers[branchId].users[index],
                    ...user,
                };
            }
        },
        clearBranchUsers: (state) => {
            state.branchUsers = {};
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBranchUsers.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchUsers.fulfilled, (state, action) => {
                state.loading = false;
                const { id, branchUsers, lastVisible, hasMore, searchQuery, shouldReset } = action.payload;
                if (!state.branchUsers[id]) {
                    state.branchUsers[id] = { users: [], lastVisible: null, hasMore: true, currentFilter: searchQuery };
                }

                // Reset clients if sort changed
                if (shouldReset) {
                    state.branchUsers[id].users = [];
                    state.branchUsers[id].lastVisible = null;
                }

                const uniqueclients = branchUsers.filter(
                    newTeam => !state.branchUsers[id].users.some(team => team.id === newTeam.id)
                );
                state.branchUsers[id].users = [...state.branchUsers[id].users, ...uniqueclients];

                state.branchUsers[id].lastVisible = lastVisible;
                state.branchUsers[id].hasMore = hasMore;
                state.branchUsers[id].currentFilter = searchQuery;
            })
            .addCase(fetchBranchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branchUsers';
            })
    },
});

export const { addBranchUser, updateBranchUser, clearBranchUsers } = branchUserslice.actions;
export default branchUserslice.reducer;

