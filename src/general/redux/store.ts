import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import authReducer from '../../features/login/redux/authSlice';
import branchesReducer from '../../features/superAdmin/branches/redux/branchesSlice';
import branchUsersReducer from '../../features/superAdmin/branchLoginUsers/redux/branchUsersSlice';
import notificationsReducer from '../../features/superAdmin/superAdminNoticeBoard/redux/notificationSlice';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['branchId', 'user', 'branchData'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    branches: branchesReducer,
    branchUsers: branchUsersReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production', // disable redux devtools in production
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store