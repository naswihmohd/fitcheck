import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import type { NotificationProps, NotificationType } from '../data/notificationTypes';
import type { RootState } from '../../../../general/redux/store';
import { db } from '../../../../firebaseConfig';

const COLLECTION_NAME = 'notifications';
const LIMIT_NUMBER = 10;

export interface NotificationsState {
    notifications: Record<NotificationType, {
        notifications: NotificationProps[];
        lastVisible: any | null;
        hasMore: boolean;
    }>;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    notifications: {} as Record<NotificationType, {
        notifications: NotificationProps[];
        lastVisible: any | null;
        hasMore: boolean;
    }>,
    loading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (params: { notificationType: NotificationType }, { getState }) => {
        const { notificationType } = params;

        try {
            const state = getState() as RootState;

            if (!notificationType) {
                throw new Error('Notification type is required');
            }

            const notifications = state.notifications.notifications;
            const notificationData = notifications[notificationType] || { lastVisible: null };

            const lastVisible = notificationData.lastVisible;

            const notificationsCollectionRef = collection(db, COLLECTION_NAME);

            const notificationsQuery = query(
                notificationsCollectionRef,
                where("type", "==", notificationType),
                orderBy("createdAt", "desc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(notificationsQuery);
            const newNotifications: NotificationProps[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as NotificationProps));

            return {
                notificationType,
                notifications: newNotifications,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newNotifications.length === LIMIT_NUMBER,
            };

        } catch (error) {
            throw new Error('Failed to fetch notifications: ' + (error as Error).message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            const { notificationType, notification } = action.payload as {
                notificationType: NotificationType;
                notification: NotificationProps;
            };

            if (!state.notifications[notificationType]) {
                state.notifications[notificationType] = {
                    notifications: [],
                    lastVisible: null,
                    hasMore: true,
                };
            }

            const exists = state.notifications[notificationType].notifications.some(
                n => n.id === notification.id
            );
            if (!exists) {
                state.notifications[notificationType].notifications.unshift(notification); // add to top
            }
        },
        clearNotifications: (state) => {
            state.notifications = {} as Record<NotificationType, {
                notifications: NotificationProps[];
                lastVisible: any | null;
                hasMore: boolean;
            }>;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchNotifications.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                const { notificationType, notifications, lastVisible, hasMore } = action.payload;

                if (!state.notifications[notificationType]) {
                    state.notifications[notificationType] = {
                        notifications: [],
                        lastVisible: null,
                        hasMore: true,
                    };
                }

                const uniqueNotifications = notifications.filter(
                    newNotification => !state.notifications[notificationType].notifications.some(
                        notification => notification.id === newNotification.id
                    )
                );
                state.notifications[notificationType].notifications = [
                    ...state.notifications[notificationType].notifications,
                    ...uniqueNotifications
                ];

                state.notifications[notificationType].lastVisible = lastVisible;
                state.notifications[notificationType].hasMore = hasMore;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch notifications';
            });
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;