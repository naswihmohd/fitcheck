import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';
import type { TutorProps } from '../../tutorManagement/data/tutorTypes';

const COLLECTION_NAME = 'tutors';
const LIMIT_NUMBER = 10;

export interface BranchCourseTutorState {
    branchCourseTutors: Record<string, {
        teams: TutorProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: BranchCourseTutorState = {
    branchCourseTutors: {},
    loading: false,
    error: null,
};

export const fetchBranchCourseTutors = createAsyncThunk(
    'branchCourseTutors/fetchBranchCourseTutors',
    async (params: { passedBranchId?: string, searchQuery?: string | null, courseId?: string }, { getState }) => {
        const searchQuery = params?.searchQuery?.trim().toLowerCase() || null;
        const filterAndQueryTerm = searchQuery;
        const courseId = params?.courseId;

        try {
            const state = getState() as RootState;
            const { branchId: branchIdFromUser } = state.user;
            const branchId = params?.passedBranchId || branchIdFromUser;

            if (!branchId) {
                throw new Error('Branch ID is required to fetch branch teams');
            }

            const branchCourseTutors = state.branchCourseTutors.branchCourseTutors;
            const branchTutor = branchCourseTutors[branchId] || { lastVisible: null, currentFilter: undefined };

            // Normalize both values for comparison (null, undefined, and empty string are treated as equivalent)
            // Convert falsy values (null, undefined, '') to null for consistent comparison
            const normalizedCurrentFilter = branchTutor.currentFilter || null;
            const normalizedFilterAndQueryTerm = filterAndQueryTerm || null;

            // Reset pagination if search changed
            const shouldReset = normalizedCurrentFilter !== normalizedFilterAndQueryTerm;
            const lastVisible = shouldReset ? null : branchTutor.lastVisible;

            const teamsCollectionRef = collection(db, "branches", branchId, COLLECTION_NAME);

            const teamsQuery = query(
                teamsCollectionRef,
                where("courseId", "==", courseId),
                ...(filterAndQueryTerm ? [where("keywords", "array-contains", filterAndQueryTerm)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(teamsQuery);
            const newTeams: TutorProps[] = querySnapshot.docs.map(doc => doc.data() as TutorProps);


            return {
                id: branchId,
                branchCourseTutors: newTeams,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newTeams.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch branchCourseTutors: ' + (error as Error).message);
        }
    }
);


const branchCourseTutorSlice = createSlice({
    name: 'branchCourseTutors',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchBranchCourseTutors.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchCourseTutors.fulfilled, (state, action) => {
                state.loading = false;
                const { id, branchCourseTutors, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                if (!state.branchCourseTutors[id]) {
                    state.branchCourseTutors[id] = { teams: [], lastVisible: null, hasMore: true, currentFilter: filterAndQueryTerm };
                }

                // Reset teams if search changed
                if (shouldReset) {
                    state.branchCourseTutors[id].teams = [];
                    state.branchCourseTutors[id].lastVisible = null;
                }

                const uniqueTeams = branchCourseTutors.filter(
                    newTeam => !state.branchCourseTutors[id].teams.some(team => team.id === newTeam.id)
                );
                state.branchCourseTutors[id].teams = [...state.branchCourseTutors[id].teams, ...uniqueTeams];

                state.branchCourseTutors[id].lastVisible = lastVisible;
                state.branchCourseTutors[id].hasMore = hasMore;
                state.branchCourseTutors[id].currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchBranchCourseTutors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branchCourseTutors';
            })
    },
});

export default branchCourseTutorSlice.reducer;