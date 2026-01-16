import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc, where, updateDoc } from 'firebase/firestore';
import type { EmployeeProps } from '../data/employeeType';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'employees';
const LIMIT_NUMBER = 10;

export interface BranchEmployeeState {
    branchEmployees: Record<string, {
        teams: EmployeeProps[];
        lastVisible: any | null;
        hasMore: boolean;
        currentFilter?: string | null;
        currentBranchId?: string | null;
        currentStatusFilter?: 'all' | 'active' | 'inactive' | null;
        currentEmploymentTypeFilter?: 'all' | 'fullTime' | 'partTime' | 'intern' | null;
    }>;
    branchEmployeesForClientCard: Record<string, {
        teams: EmployeeProps[];
    }>;
    branchEmployeesForClientCardLoading: Record<string, Record<string, boolean>>;
    loading: boolean;
    error: string | null;
}

const initialState: BranchEmployeeState = {
    branchEmployees: {},
    branchEmployeesForClientCard: {},
    branchEmployeesForClientCardLoading: {},
    loading: false,
    error: null,
};

export const fetchBranchEmployees = createAsyncThunk(
    'branchEmployees/fetchBranchEmployees',
    async (params: { 
        passedCompanyId?: string, 
        passedBranchId?: string,
        searchQuery?: string | null, 
        selectedBranchId?: string | null,
        statusFilter?: 'all' | 'active' | 'inactive' | null,
        employmentTypeFilter?: 'all' | 'fullTime' | 'partTime' | 'intern' | null,
    }, { getState }) => {
        const searchQuery = params?.searchQuery?.trim().toLowerCase() || null;
        const filterAndQueryTerm = searchQuery;
        const selectedBranchId = params?.selectedBranchId || null;
        const statusFilter = params?.statusFilter || 'all';
        const employmentTypeFilter = params?.employmentTypeFilter || 'all';

        try {
            const state = getState() as RootState;
            const { companyId: companyIdFromUser, branchId: branchIdFromUser } = state.user;
            const companyId = params?.passedCompanyId || companyIdFromUser;
            const branchId = params?.passedBranchId || branchIdFromUser;


            if (!companyId) {
                throw new Error('Company ID is required to fetch employees');
            }
            if (!branchId) {
                throw new Error('Branch ID is required to fetch employees');
            }

            const branchEmployees = (state as any).branchEmployees?.branchEmployees || {};
            const branchEmployee = branchEmployees[companyId] || { 
                lastVisible: null, 
                currentFilter: undefined, 
                currentBranchId: undefined,
                currentStatusFilter: undefined,
                currentEmploymentTypeFilter: undefined,
            };

            // Normalize values for comparison
            const normalizedCurrentFilter = branchEmployee.currentFilter || null;
            const normalizedFilterAndQueryTerm = filterAndQueryTerm || null;
            const normalizedCurrentBranchId = branchEmployee.currentBranchId || null;
            const normalizedSelectedBranchId = selectedBranchId || null;
            const normalizedCurrentStatusFilter = branchEmployee.currentStatusFilter || 'all';
            const normalizedCurrentEmploymentTypeFilter = branchEmployee.currentEmploymentTypeFilter || 'all';

            // Reset pagination if any filter changed
            const filterChanged = 
                normalizedCurrentFilter !== normalizedFilterAndQueryTerm || 
                normalizedCurrentBranchId !== normalizedSelectedBranchId ||
                normalizedCurrentStatusFilter !== statusFilter ||
                normalizedCurrentEmploymentTypeFilter !== employmentTypeFilter;
            const shouldReset = filterChanged;
            const lastVisible = shouldReset ? null : branchEmployee.lastVisible;

            const employeesCollectionRef = collection(db, "companies", companyId, COLLECTION_NAME);

            // Build query conditions
            const queryConditions: any[] = [];

            // Filter by status (isActive)
            if (statusFilter === 'active') {
                queryConditions.push(where("isActive", "==", true));
            } else if (statusFilter === 'inactive') {
                queryConditions.push(where("isActive", "==", false));
            }

            // Filter by employmentType
            if (employmentTypeFilter !== 'all') {
                queryConditions.push(where("branchDetails.employmentType", "==", employmentTypeFilter));
            }

            // Search query (keywords array-contains)
            if (filterAndQueryTerm) {
                queryConditions.push(where("keywords", "array-contains", filterAndQueryTerm));
            }

            // Build the query
            const employeesQuery = query(
                employeesCollectionRef,
                ...queryConditions,
                where("branchDetails.branchId", "==", branchId),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(employeesQuery);
            const newEmployees: EmployeeProps[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as EmployeeProps));

            return {
                id: branchId,
                branchEmployees: newEmployees,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newEmployees.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                branchId,
                statusFilter,
                employmentTypeFilter,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch branchEmployees: ' + (error as Error).message);
        }
    }
);

export const fetchBranchEmployeeForClientCard = createAsyncThunk(
    'branchEmployees/fetchBranchEmployeeForClientCard',
    async ({ employeeId, companyId }: { employeeId: string; companyId: string }, { getState }) => {

        try {
            const state = getState() as RootState;
            if (!companyId) {
                throw new Error('Company ID is required to fetch employees');
            }

            const branchEmployeesState = (state as any).branchEmployees;
            const branchEmployees = branchEmployeesState?.branchEmployees?.[companyId]?.teams || [];
            const employeeFromBranchEmployees = branchEmployees.find((employee: EmployeeProps) => employee.id === employeeId) || null;
            if (employeeFromBranchEmployees) {
                return employeeFromBranchEmployees;
            }

            const branchEmployeesForClientCard = branchEmployeesState?.branchEmployeesForClientCard?.[companyId]?.teams || [];
            const employeeFromBranchEmployeesForClientCard = branchEmployeesForClientCard.find((employee: EmployeeProps) => employee.id === employeeId) || null;
            if (employeeFromBranchEmployeesForClientCard) {
                return employeeFromBranchEmployeesForClientCard;
            }

            const employeeDocRef = doc(db, "companies", companyId, COLLECTION_NAME, employeeId);
            const employeeDoc = await getDoc(employeeDocRef);
            const employeeData = employeeDoc.exists()
                ? ({
                    id: employeeDoc.id,
                    ...employeeDoc.data(),
                } as EmployeeProps)
                : null;
            return employeeData;

        } catch (error) {
            throw new Error('Failed to fetch branchEmployeeForClientCard: ' + (error as Error).message);
        }
    },
    {
        condition: ({ employeeId, companyId }, { getState }) => {
            const state = getState() as RootState;

            if (!companyId || !employeeId) {
                return false;
            }

            const branchEmployeesState = (state as any).branchEmployees;
            const branchEmployees = branchEmployeesState?.branchEmployees?.[companyId]?.teams || [];
            const branchEmployeesForClientCard = branchEmployeesState?.branchEmployeesForClientCard?.[companyId]?.teams || [];
            const alreadyLoaded = branchEmployees.some((employee: EmployeeProps) => employee.id === employeeId) ||
                branchEmployeesForClientCard.some((employee: EmployeeProps) => employee.id === employeeId);

            const isLoading = branchEmployeesState?.branchEmployeesForClientCardLoading?.[companyId]?.[employeeId];

            return !alreadyLoaded && !isLoading;
        }
    }
);

export const updateEmployeeDisabled = createAsyncThunk(
    'branchEmployees/updateEmployeeDisabled',
    async ({ employeeId, companyId, isActive }: { employeeId: string; companyId: string; isActive: boolean },) => {
        if (!companyId) {
            throw new Error('Company ID is required');
        }

        if (!employeeId) {
            throw new Error('Employee ID is required');
        }

        try {
            // Update Firestore
            const employeeDocRef = doc(db, "companies", companyId, COLLECTION_NAME, employeeId);
            await updateDoc(employeeDocRef, {
                isActive: isActive,
            });

            return {
                companyId,
                employeeId,
                isActive,
            };
        } catch (error) {
            throw new Error('Failed to update employee disabled status: ' + (error as Error).message);
        }
    }
);

const branchEmployeeSlice = createSlice({
    name: 'branchEmployees',
    initialState,
    reducers: {
        addEmployee: (state, action) => {
            const { branchId, employee } = action.payload as {
                branchId: string;
                employee: EmployeeProps;
            };

            if (!state.branchEmployees[branchId]) {
                state.branchEmployees[branchId] = {
                    teams: [employee],
                    lastVisible: null,
                    hasMore: true,
                    currentFilter: null,
                    currentBranchId: null,
                    currentStatusFilter: 'all',
                    currentEmploymentTypeFilter: 'all',
                };
            }

            const exists = state.branchEmployees[branchId].teams.some(e => e.id === employee.id);
            if (!exists) {
                state.branchEmployees[branchId].teams.unshift(employee); // add to top
            }
        },
        updateEmployee: (state, action) => {
            const { branchId, employee } = action.payload as {
                branchId: string;
                employee: EmployeeProps;
            };

            if (!state.branchEmployees[branchId]) return;

            const index = state.branchEmployees[branchId].teams.findIndex(e => e.id === employee.id);
            if (index !== -1) {
                state.branchEmployees[branchId].teams[index] = {
                    ...state.branchEmployees[branchId].teams[index],
                    ...employee,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBranchEmployees.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                const { 
                    id, 
                    branchEmployees, 
                    lastVisible, 
                    hasMore, 
                    filterAndQueryTerm, 
                    branchId, 
                    statusFilter,
                    employmentTypeFilter,
                    shouldReset 
                } = action.payload;
                if (!state.branchEmployees[id]) {
                    state.branchEmployees[id] = { 
                        teams: [], 
                        lastVisible: null, 
                        hasMore: true, 
                        currentFilter: filterAndQueryTerm, 
                        currentBranchId: branchId,
                        currentStatusFilter: statusFilter,
                        currentEmploymentTypeFilter: employmentTypeFilter,
                    };
                }

                // Reset teams if filter changed
                if (shouldReset) {
                    state.branchEmployees[id].teams = [];
                    state.branchEmployees[id].lastVisible = null;
                }

                const uniqueEmployees = branchEmployees.filter(
                    newEmployee => !state.branchEmployees[id].teams.some(employee => employee.id === newEmployee.id)
                );
                state.branchEmployees[id].teams = [...state.branchEmployees[id].teams, ...uniqueEmployees];

                state.branchEmployees[id].lastVisible = lastVisible;
                state.branchEmployees[id].hasMore = hasMore;
                state.branchEmployees[id].currentFilter = filterAndQueryTerm;
                state.branchEmployees[id].currentBranchId = branchId;
                state.branchEmployees[id].currentStatusFilter = statusFilter;
                state.branchEmployees[id].currentEmploymentTypeFilter = employmentTypeFilter;
            })
            .addCase(fetchBranchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch branchEmployees';
            })

            // 
            .addCase(fetchBranchEmployeeForClientCard.pending, (state, action) => {
                const { companyId, employeeId } = action.meta.arg;
                const resolvedCompanyId = companyId;
                if (!resolvedCompanyId || !employeeId) {
                    return;
                }
                if (!state.branchEmployeesForClientCardLoading[resolvedCompanyId]) {
                    state.branchEmployeesForClientCardLoading[resolvedCompanyId] = {};
                }
                state.branchEmployeesForClientCardLoading[resolvedCompanyId][employeeId] = true;
            })
            .addCase(fetchBranchEmployeeForClientCard.fulfilled, (state, action) => {
                const employeeData = action.payload;
                const resolvedCompanyId = employeeData?.companyId || action.meta.arg.companyId;
                const employeeId = action.meta.arg.employeeId;
                if (employeeData && resolvedCompanyId) {
                    if (!state.branchEmployeesForClientCard[resolvedCompanyId]) {
                        state.branchEmployeesForClientCard[resolvedCompanyId] = { teams: [] };
                    }
                    const exists = state.branchEmployeesForClientCard[resolvedCompanyId].teams.some(employee => employee.id === employeeData.id);
                    if (!exists) {
                        state.branchEmployeesForClientCard[resolvedCompanyId].teams.push(employeeData);
                    }
                }
                // clear loading flag even if payload is null
                if (resolvedCompanyId && state.branchEmployeesForClientCardLoading[resolvedCompanyId]) {
                    delete state.branchEmployeesForClientCardLoading[resolvedCompanyId][employeeId];
                }
            })
            .addCase(fetchBranchEmployeeForClientCard.rejected, (state, action) => {
                state.loading = false;
                console.error(action.error);
                const resolvedCompanyId = action.meta?.arg?.companyId;
                const employeeId = action.meta?.arg?.employeeId;
                if (resolvedCompanyId && employeeId && state.branchEmployeesForClientCardLoading[resolvedCompanyId]) {
                    delete state.branchEmployeesForClientCardLoading[resolvedCompanyId][employeeId];
                }
            })
            .addCase(updateEmployeeDisabled.fulfilled, (state, action) => {
                const { companyId, employeeId, isActive } = action.payload;

                // Update in branchEmployees
                if (state.branchEmployees[companyId]) {
                    const employeeIndex = state.branchEmployees[companyId].teams.findIndex(employee => employee.id === employeeId);
                    if (employeeIndex !== -1) {
                        state.branchEmployees[companyId].teams[employeeIndex].isActive = isActive;
                    }
                }

                // Update in branchEmployeesForClientCard
                if (state.branchEmployeesForClientCard[companyId]) {
                    const clientCardEmployeeIndex = state.branchEmployeesForClientCard[companyId].teams.findIndex(employee => employee.id === employeeId);
                    if (clientCardEmployeeIndex !== -1) {
                        state.branchEmployeesForClientCard[companyId].teams[clientCardEmployeeIndex].isActive = isActive;
                    }
                }
            })
            .addCase(updateEmployeeDisabled.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update employee disabled status';
            })
    },
});

export const { addEmployee, updateEmployee } = branchEmployeeSlice.actions;
export default branchEmployeeSlice.reducer;
