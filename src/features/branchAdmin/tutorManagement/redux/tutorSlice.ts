import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc, where, updateDoc } from 'firebase/firestore';
import type { TutorProps } from '../data/tutorTypes';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'tutors';
const LIMIT_NUMBER = 10;

export interface BranchTutorState {
    branchTutors: Record<string, {
        teams: TutorProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    branchTutorsForClientCard: Record<string, {
        teams: TutorProps[];
    }>;
    branchTutorsForClientCardLoading: Record<string, Record<string, boolean>>;
    loading: boolean;
    error: string | null;
}

const initialState: BranchTutorState = {
    branchTutors: {},
    branchTutorsForClientCard: {},
    branchTutorsForClientCardLoading: {},
    loading: false,
    error: null,
};

export const fetchBranchTutors = createAsyncThunk(
    'branchTutors/fetchBranchTutors',
    async (params: { passedBranchId?: string, searchQuery?: string | null }, { getState }) => {
        const searchQuery = params?.searchQuery?.trim().toLowerCase() || null;
        const filterAndQueryTerm = searchQuery;

        try {
            const state = getState() as RootState;
            const { branchId: branchIdFromUser } = state.user;
            const branchId = params?.passedBranchId || branchIdFromUser;

            if (!branchId) {
                throw new Error('Branch ID is required to fetch branch teams');
            }

            const branchTutors = state.branchTutors.branchTutors;
            const branchTutor = branchTutors[branchId] || { lastVisible: null, currentFilter: undefined };

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
                ...(filterAndQueryTerm ? [where("keywords", "array-contains", filterAndQueryTerm)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(teamsQuery);
            const newTeams: TutorProps[] = querySnapshot.docs.map(doc => doc.data() as TutorProps);


            return {
                id: branchId,
                branchTutors: newTeams,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newTeams.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch branchTutors: ' + (error as Error).message);
        }
    }
);

export const fetchBranchTutorForClientCard = createAsyncThunk(
    'branchTutors/fetchBranchTutorForClientCard',
    async ({ executiveId, branchId }: { executiveId: string; branchId: string }, { getState }) => {

        try {
            const state = getState() as RootState;
            if (!branchId) {
                throw new Error('Branch ID is required to fetch branch teams');
            }

            const branchTutors = state.branchTutors.branchTutors[branchId]?.teams || [];
            const teamFromBranchTutors = branchTutors.find((team: TutorProps) => team.id === executiveId) || null;
            if (teamFromBranchTutors) {
                return teamFromBranchTutors;
            }

            const branchTutorsForClientCard = state.branchTutors.branchTutorsForClientCard[branchId]?.teams || [];
            const teamFromBranchTutorsForClientCard = branchTutorsForClientCard.find((team: TutorProps) => team.id === executiveId) || null;
            if (teamFromBranchTutorsForClientCard) {
                return teamFromBranchTutorsForClientCard;
            }

            const teamDocRef = doc(db, "branches", branchId, COLLECTION_NAME, executiveId);
            const teamDoc = await getDoc(teamDocRef);
            const teamData = teamDoc.exists()
                ? ((teamDoc.data() as TutorProps))
                : null;
            return teamData;

        } catch (error) {
            throw new Error('Failed to fetch branchTutorForClientCard: ' + (error as Error).message);
        }
    },
    {
        condition: ({ executiveId, branchId }, { getState }) => {
            const state = getState() as RootState;

            if (!branchId || !executiveId) {
                return false;
            }

            const branchTutors = state.branchTutors.branchTutors[branchId]?.teams || [];
            const branchTutorsForClientCard = state.branchTutors.branchTutorsForClientCard[branchId]?.teams || [];
            const alreadyLoaded = branchTutors.some(team => team.id === executiveId) ||
                branchTutorsForClientCard.some(team => team.id === executiveId);

            const isLoading = state.branchTutors.branchTutorsForClientCardLoading[branchId]?.[executiveId];

            return !alreadyLoaded && !isLoading;
        }
    }
);

export const updateTutorDisabled = createAsyncThunk(
    'branchTutors/updateTutorDisabled',
    async ({ tutorId, branchId, isActive }: { tutorId: string; branchId: string; isActive: boolean },) => {
        if (!branchId) {
            throw new Error('Branch ID is required');
        }

        if (!tutorId) {
            throw new Error('Tutor ID is required');
        }

        try {
            // Update Firestore
            const teamDocRef = doc(db, "branches", branchId, COLLECTION_NAME, tutorId);
            await updateDoc(teamDocRef, {
                isActive: isActive,
            });

            return {
                branchId,
                tutorId,
                isActive,
            };
        } catch (error) {
            throw new Error('Failed to update team disabled status: ' + (error as Error).message);
        }
    }
);

const branchTutorSlice = createSlice({
    name: 'branchTutors',
    initialState,
    reducers: {
        addTutor: (state, action) => {
            const { branchId, tutor } = action.payload as {
                branchId: string;
                tutor: TutorProps;
            };

            if (!state.branchTutors[branchId]) {
                state.branchTutors[branchId] = {
                    teams: [tutor],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                };
            }

            const exists = state.branchTutors[branchId].teams.some(t => t.id === tutor.id);
            if (!exists) {
                state.branchTutors[branchId].teams.unshift(tutor); // add to top
            }
        },
        updateTutor: (state, action) => {
            const { branchId, tutor } = action.payload as {
                branchId: string;
                tutor: TutorProps;
            };

            if (!state.branchTutors[branchId]) return;

            const index = state.branchTutors[branchId].teams.findIndex(t => t.id === tutor.id);
            if (index !== -1) {
                state.branchTutors[branchId].teams[index] = {
                    ...state.branchTutors[branchId].teams[index],
                    ...tutor,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBranchTutors.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchTutors.fulfilled, (state, action) => {
                state.loading = false;
                const { id, branchTutors, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;
                if (!state.branchTutors[id]) {
                    state.branchTutors[id] = { teams: [], lastVisible: null, hasMore: true, currentFilter: filterAndQueryTerm };
                }

                // Reset teams if search changed
                if (shouldReset) {
                    state.branchTutors[id].teams = [];
                    state.branchTutors[id].lastVisible = null;
                }

                const uniqueTeams = branchTutors.filter(
                    newTeam => !state.branchTutors[id].teams.some(team => team.id === newTeam.id)
                );
                state.branchTutors[id].teams = [...state.branchTutors[id].teams, ...uniqueTeams];

                state.branchTutors[id].lastVisible = lastVisible;
                state.branchTutors[id].hasMore = hasMore;
                state.branchTutors[id].currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchBranchTutors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branchTutors';
            })

            // 
            .addCase(fetchBranchTutorForClientCard.pending, (state, action) => {
                const { branchId, executiveId } = action.meta.arg;
                const resolvedBranchId = branchId;
                if (!resolvedBranchId || !executiveId) {
                    return;
                }
                if (!state.branchTutorsForClientCardLoading[resolvedBranchId]) {
                    state.branchTutorsForClientCardLoading[resolvedBranchId] = {};
                }
                state.branchTutorsForClientCardLoading[resolvedBranchId][executiveId] = true;
            })
            .addCase(fetchBranchTutorForClientCard.fulfilled, (state, action) => {
                const teamData = action.payload;
                const resolvedBranchId = teamData?.branchId || action.meta.arg.branchId;
                const executiveId = action.meta.arg.executiveId;
                if (teamData && resolvedBranchId) {
                    if (!state.branchTutorsForClientCard[resolvedBranchId]) {
                        state.branchTutorsForClientCard[resolvedBranchId] = { teams: [] };
                    }
                    const exists = state.branchTutorsForClientCard[resolvedBranchId].teams.some(team => team.id === teamData.id);
                    if (!exists) {
                        state.branchTutorsForClientCard[resolvedBranchId].teams.push(teamData);
                    }
                }
                // clear loading flag even if payload is null
                if (resolvedBranchId && state.branchTutorsForClientCardLoading[resolvedBranchId]) {
                    delete state.branchTutorsForClientCardLoading[resolvedBranchId][executiveId];
                }
            })
            .addCase(fetchBranchTutorForClientCard.rejected, (state, action) => {
                state.loading = false;
                console.error(action.error);
                const resolvedBranchId = action.meta?.arg?.branchId;
                const executiveId = action.meta?.arg?.executiveId;
                if (resolvedBranchId && executiveId && state.branchTutorsForClientCardLoading[resolvedBranchId]) {
                    delete state.branchTutorsForClientCardLoading[resolvedBranchId][executiveId];
                }
            })
            .addCase(updateTutorDisabled.fulfilled, (state, action) => {
                const { branchId, tutorId, isActive } = action.payload;

                // Update in branchTutors
                if (state.branchTutors[branchId]) {
                    const teamIndex = state.branchTutors[branchId].teams.findIndex(team => team.id === tutorId);
                    if (teamIndex !== -1) {
                        state.branchTutors[branchId].teams[teamIndex].isActive = isActive;
                    }
                }

                // Update in branchTutorsForClientCard
                if (state.branchTutorsForClientCard[branchId]) {
                    const clientCardTeamIndex = state.branchTutorsForClientCard[branchId].teams.findIndex(team => team.id === tutorId);
                    if (clientCardTeamIndex !== -1) {
                        state.branchTutorsForClientCard[branchId].teams[clientCardTeamIndex].isActive = isActive;
                    }
                }
            })
            .addCase(updateTutorDisabled.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update team disabled status';
            })
    },
});

export const { addTutor, updateTutor } = branchTutorSlice.actions;
export default branchTutorSlice.reducer;