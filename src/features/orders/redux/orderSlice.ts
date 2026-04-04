import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, doc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { OrdersProps, OrderStatusType, PaymentStatus } from '../data/orderTypes';

const COLLECTION_NAME = 'orders';
const LIMIT_NUMBER = 10;

export interface OrdersState {
    orders: OrdersProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrdersState = {
    orders: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: undefined,
    loading: false,
    error: null,
};

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async ({ params }: { params: { searchQuery: string | null, status: OrderStatusType | null } }, { getState }) => {
        const searchQuery = params?.searchQuery || null;
        const filterAndQueryTerm = searchQuery || null;
        const status = params?.status || null;

        try {
            const state = getState() as RootState & { orders?: OrdersState };
            const ordersState = state.orders || initialState;

            // Reset pagination if search query changed (keep filter behavior)
            const shouldReset = ordersState.currentFilter && ordersState.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : ordersState.lastVisible;

            const ordersCollectionRef = collection(db, COLLECTION_NAME);

            const ordersQuery = query(
                ordersCollectionRef,
                ...(status ? [where('orderStatus.orderStatus', '==', status)] : []),
                ...(searchQuery ? [where('keywords', 'array-contains', searchQuery)] : []),
                orderBy('createdAt', 'desc'),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER),
            );

            const querySnapshot = await getDocs(ordersQuery);

            const newOrders: OrdersProps[] = querySnapshot.docs.map((doc) => {
                const data = doc.data() as Omit<OrdersProps, 'orderId'> & Partial<OrdersProps>;

                return {
                    ...(data as OrdersProps),
                    // Ensure orderId exists even if it wasn't stored in the document body.
                    orderId: (data as OrdersProps).orderId || doc.id,
                };
            });

            return {
                orders: newOrders,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newOrders.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };
        } catch (error) {
            throw new Error('Failed to fetch orders: ' + (error as Error).message);
        }
    }
);

export const changeOrderStatus = createAsyncThunk(
    'orders/changeOrderStatus',
    async (
        {
            orderId,
            newStatus,
            message,
            currentOrderStatus,
        }: {
            orderId: string;
            newStatus: OrderStatusType;
            message?: string;
            currentOrderStatus?: OrdersProps['orderStatus'];
        },
        { rejectWithValue },
    ) => {
        try {
            const now = Timestamp.now();

            const orderStatusUpdate: Partial<OrdersProps['orderStatus']> = {
                orderStatus: newStatus,
                updatedAt: now,
                message: message ?? null,
            };

            // Keep timeline consistent by writing timestamps, even when the user skips steps.
            // Example: pending -> shipped should also backfill acceptedAt and packedAt when missing.
            switch (newStatus) {
                case 'accepted':
                    orderStatusUpdate.acceptedAt = now;
                    break;
                case 'packed':
                    orderStatusUpdate.packedAt = now;
                    if (currentOrderStatus && !currentOrderStatus.acceptedAt) {
                        orderStatusUpdate.acceptedAt = now;
                    }
                    break;
                case 'shipped':
                    orderStatusUpdate.shippedAt = now;
                    if (currentOrderStatus && !currentOrderStatus.acceptedAt) {
                        orderStatusUpdate.acceptedAt = now;
                    }
                    if (currentOrderStatus && !currentOrderStatus.packedAt) {
                        orderStatusUpdate.packedAt = now;
                    }
                    break;
                case 'delivered':
                    orderStatusUpdate.deliveredAt = now;
                    // Backfill any missing prior steps so the timeline stays consistent.
                    if (currentOrderStatus && !currentOrderStatus.shippedAt) {
                        orderStatusUpdate.shippedAt = now;
                    }
                    if (currentOrderStatus && !currentOrderStatus.packedAt) {
                        orderStatusUpdate.packedAt = now;
                    }
                    if (currentOrderStatus && !currentOrderStatus.acceptedAt) {
                        orderStatusUpdate.acceptedAt = now;
                    }
                    break;
                case 'cancelled':
                    orderStatusUpdate.cancelledAt = now;
                    break;
                case 'rejected':
                    orderStatusUpdate.rejectedAt = now;
                    break;
                case 'returned':
                    orderStatusUpdate.returnedAt = now;
                    break;
                case 'replaced':
                    // There is no replacedAt in the type; rely on updatedAt + message.
                    break;
                case 'pending':
                    break;
                default: {
                    const _exhaustive: never = newStatus;
                    return rejectWithValue(`Unhandled status: ${_exhaustive}`);
                }
            }

            await updateDoc(doc(db, COLLECTION_NAME, orderId), {
                'orderStatus.orderStatus': orderStatusUpdate.orderStatus,
                'orderStatus.updatedAt': orderStatusUpdate.updatedAt,
                'orderStatus.message': orderStatusUpdate.message,
                ...(orderStatusUpdate.acceptedAt ? { 'orderStatus.acceptedAt': orderStatusUpdate.acceptedAt } : {}),
                ...(orderStatusUpdate.packedAt ? { 'orderStatus.packedAt': orderStatusUpdate.packedAt } : {}),
                ...(orderStatusUpdate.shippedAt ? { 'orderStatus.shippedAt': orderStatusUpdate.shippedAt } : {}),
                ...(orderStatusUpdate.deliveredAt ? { 'orderStatus.deliveredAt': orderStatusUpdate.deliveredAt } : {}),
                ...(orderStatusUpdate.cancelledAt ? { 'orderStatus.cancelledAt': orderStatusUpdate.cancelledAt } : {}),
                ...(orderStatusUpdate.rejectedAt ? { 'orderStatus.rejectedAt': orderStatusUpdate.rejectedAt } : {}),
                ...(orderStatusUpdate.returnedAt ? { 'orderStatus.returnedAt': orderStatusUpdate.returnedAt } : {}),
            });

            return { orderId, orderStatusUpdate };
        } catch (error) {
            return rejectWithValue(
                (error as Error)?.message ? `Failed to update order status: ${(error as Error).message}` : 'Failed to update order status',
            );
        }
    },
);

export const changePaymentStatus = createAsyncThunk(
    'orders/changePaymentStatus',
    async (
        {
            orderId,
        }: {
            orderId: string;
        },
        { rejectWithValue },
    ) => {
        try {
            const now = Timestamp.now();
            const paymentStatusUpdate: Pick<PaymentStatus, 'paymentStatus' | 'paidAt' | 'message' | 'failedAt'> = {
                paymentStatus: 'completed',
                paidAt: now,
                message: null,
                failedAt: null,
            };

            await updateDoc(doc(db, COLLECTION_NAME, orderId), {
                'paymentStatus.paymentStatus': paymentStatusUpdate.paymentStatus,
                'paymentStatus.paidAt': paymentStatusUpdate.paidAt,
                'paymentStatus.message': paymentStatusUpdate.message,
                'paymentStatus.failedAt': paymentStatusUpdate.failedAt,
            });

            return { orderId, paymentStatusUpdate };
        } catch (error) {
            return rejectWithValue(
                (error as Error)?.message
                    ? `Failed to update payment status: ${(error as Error).message}`
                    : 'Failed to update payment status',
            );
        }
    },
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrders: (state) => {
            state.orders = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = undefined;
            state.loading = false;
            state.error = null;
        },
        addOrder: (state, action) => {
            const { order } = action.payload as { order: OrdersProps };

            const existingIndex = state.orders.findIndex((o) => o.orderId === order.orderId);
            if (existingIndex === -1) {
                // createdAt desc ordering
                state.orders = [order, ...state.orders];
            }
        },
        updateOrder: (state, action) => {
            const { order } = action.payload as { order: OrdersProps };

            const index = state.orders.findIndex((o) => o.orderId === order.orderId);
            if (index !== -1) {
                state.orders[index] = {
                    ...state.orders[index],
                    ...order,
                };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;

                const { orders, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;

                // Reset orders if search query changed
                if (shouldReset) {
                    state.orders = [];
                    state.lastVisible = null;
                }

                const uniqueOrders = orders.filter(
                    (newOrder) => !state.orders.some((order) => order.orderId === newOrder.orderId)
                );

                state.orders = [...state.orders, ...uniqueOrders];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch orders';
            });

        builder
            .addCase(changeOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changeOrderStatus.fulfilled, (state, action) => {
                state.loading = false;

                const { orderId, orderStatusUpdate } = action.payload;
                const index = state.orders.findIndex((o) => o.orderId === orderId);
                if (index !== -1) {
                    state.orders[index] = {
                        ...state.orders[index],
                        orderStatus: {
                            ...state.orders[index].orderStatus,
                            ...orderStatusUpdate,
                        },
                    };
                }
            })
            .addCase(changeOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    (action.payload as string) || action.error.message || 'Failed to update order status';
            });

        builder
            .addCase(changePaymentStatus.fulfilled, (state, action) => {
                const { orderId, paymentStatusUpdate } = action.payload;
                const index = state.orders.findIndex((o) => o.orderId === orderId);
                if (index !== -1) {
                    state.orders[index] = {
                        ...state.orders[index],
                        paymentStatus: {
                            ...state.orders[index].paymentStatus,
                            ...paymentStatusUpdate,
                        },
                    };
                }
            })
            .addCase(changePaymentStatus.rejected, (state, action) => {
                state.error =
                    (action.payload as string) || action.error.message || 'Failed to update payment status';
            });
    },
});

export const { clearOrders, addOrder, updateOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
