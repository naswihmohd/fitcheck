import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import type { RootState } from '../../../../general/redux/store';
import type { CourseProps } from '../data/courseType';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'courses';
const LIMIT_NUMBER = 10;

export interface CoursesState {
    branchCourses: Record<string, {
        courses: CourseProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: CoursesState = {
    branchCourses: {},
    loading: false,
    error: null,
};

export const fetchBranchCourses = createAsyncThunk(
    'branchCourses/fetchBranchCourses',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;

        try {
            const state = getState() as RootState;
            const { branchId } = state.user;

            if (!branchId) {
                throw new Error('Branch ID is required');
            }


            const branchCourses = state.branchCourses.branchCourses
            const branchAllCourse = branchCourses[branchId] || { lastVisible: null, currentFilter: undefined };

            // Reset pagination if sort changed
            const shouldReset = branchAllCourse.currentFilter && branchAllCourse.currentFilter !== searchQuery;
            const lastVisible = shouldReset ? null : branchAllCourse.lastVisible;

            const allCoursesCollectionRef = collection(db, "branches", branchId, COLLECTION_NAME);

            const coursesQuery = query(
                allCoursesCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery)] : []),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(coursesQuery);
            const newCourses: CourseProps[] = querySnapshot.docs.map(doc => doc.data() as CourseProps);

            return {
                id: branchId,
                branchCourses: newCourses,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newCourses.length === LIMIT_NUMBER,
                searchQuery,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch branchCourses: ' + (error as Error).message);
        }
    }
);

const branchCoursesSlice = createSlice({
    name: 'branchCourses',
    initialState,
    reducers: {
        clearBranchCourses: state => {
            state.branchCourses = {};
            state.loading = false;
            state.error = null;
        },
        addCourse: (state, action) => {
            const { branchId, course } = action.payload as {
                branchId: string;
                course: CourseProps;
            };

            if (!state.branchCourses[branchId]) {
                state.branchCourses[branchId] = {
                    courses: [course],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                };
            }

            const exists = state.branchCourses[branchId].courses.some(c => c.id === course.id);
            if (!exists) {
                state.branchCourses[branchId].courses.unshift(course); // add to top
            }
        },
        updateCourse: (state, action) => {
            const { branchId, course } = action.payload as {
                branchId: string;
                course: CourseProps;
            };

            if (!state.branchCourses[branchId]) return;

            const index = state.branchCourses[branchId].courses.findIndex(t => t.id === course.id);
            if (index !== -1) {
                state.branchCourses[branchId].courses[index] = {
                    ...state.branchCourses[branchId].courses[index],
                    ...course,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBranchCourses.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchCourses.fulfilled, (state, action) => {
                state.loading = false;
                const { id, branchCourses, lastVisible, hasMore, searchQuery, shouldReset } = action.payload;
                if (!state.branchCourses[id]) {
                    state.branchCourses[id] = { courses: [], lastVisible: null, hasMore: true, currentFilter: searchQuery };
                }
                // Reset course if sort changed
                if (shouldReset) {
                    state.branchCourses[id].courses = [];
                    state.branchCourses[id].lastVisible = null;
                }
                const uniqueCourses = branchCourses.filter(
                    newCourse => !state.branchCourses[id].courses.some(course => course.id === newCourse.id)
                );
                state.branchCourses[id].courses = [...state.branchCourses[id].courses, ...uniqueCourses as CourseProps[]];

                state.branchCourses[id].lastVisible = lastVisible;

                state.branchCourses[id].hasMore = hasMore;
                state.branchCourses[id].currentFilter = searchQuery;
            })
            .addCase(fetchBranchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branchCourses';
            })
    },
});

export const { clearBranchCourses, addCourse, updateCourse } = branchCoursesSlice.actions;
export default branchCoursesSlice.reducer;

