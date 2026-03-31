import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { CustomerProps } from '../data/customerType';

const COLLECTION_NAME = 'users';
const LIMIT_NUMBER = 10;

export interface CustomersState {
    customers: CustomerProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: CustomersState = {
    customers: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchCustomers = createAsyncThunk(
    'customers/fetchCustomers',
    async ({ params }: { params: { searchQuery: string | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;

        try {
            const state = getState() as RootState & { customers?: CustomersState };
            const customersState = state.customers || initialState;

            // Reset pagination if search query changed
            const shouldReset = customersState.currentFilter && customersState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : customersState.lastVisible;

            const customersCollectionRef = collection(db, COLLECTION_NAME);

            const customersQuery = query(
                customersCollectionRef,
                where('role', '==', 'user'),
                ...(searchQuery ? [where('keywords', 'array-contains', searchQuery)] : []),
                orderBy('createdAt', 'desc'),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(customersQuery);
            const newCustomers: CustomerProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as CustomerProps));

            return {
                customers: newCustomers,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newCustomers.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };
        } catch (error) {
            throw new Error('Failed to fetch customers: ' + (error as Error).message);
        }
    }
);

export const updateCustomerActiveStatus = createAsyncThunk(
    'customers/updateCustomerActiveStatus',
    async ({ customerId, isActive }: { customerId: string; isActive: boolean }) => {
        try {
            const customerDocRef = doc(db, COLLECTION_NAME, customerId);
            await updateDoc(customerDocRef, { isActive });
            return { customerId, isActive };
        } catch (error) {
            throw new Error('Failed to update customer status: ' + (error as Error).message);
        }
    }
);

const customersSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        clearCustomers: state => {
            state.customers = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addCustomer: (state, action) => {
            const { customer } = action.payload as {
                customer: CustomerProps;
            };

            // Check if customer already exists
            const existingIndex = state.customers.findIndex(c => c.id === customer.id);
            if (existingIndex === -1) {
                // Add new customer at the beginning (ordered by createdAt desc)
                state.customers = [customer, ...state.customers];
            }
        },
        updateCustomer: (state, action) => {
            const { customer } = action.payload as {
                customer: CustomerProps;
            };

            const index = state.customers.findIndex(c => c.id === customer.id);
            if (index !== -1) {
                state.customers[index] = {
                    ...state.customers[index],
                    ...customer,
                };
            }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchCustomers.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                const { customers, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;

                // Reset customers if search query changed
                if (shouldReset) {
                    state.customers = [];
                    state.lastVisible = null;
                }

                const uniqueCustomers = customers.filter(
                    newCustomer => !state.customers.some(customer => customer.id === newCustomer.id)
                );
                state.customers = [...state.customers, ...uniqueCustomers];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch customers';
            })
            .addCase(updateCustomerActiveStatus.pending, state => {
                state.error = null;
            })
            .addCase(updateCustomerActiveStatus.fulfilled, (state, action) => {
                const { customerId, isActive } = action.payload;
                const customer = state.customers.find(c => c.id === customerId);
                if (customer) {
                    customer.isActive = isActive;
                }
            })
            .addCase(updateCustomerActiveStatus.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update customer status';
            });
    },
});

export const { clearCustomers, addCustomer, updateCustomer } = customersSlice.actions;
export default customersSlice.reducer;
