import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import authReducer from '../../features/login/redux/authSlice';
import dashboardReducer from '../../features/dashboard/redux/dashboardSlice';
import transactionsReducer from '../../features/transactions/redux/transactionSlice';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);


const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    dashboard: dashboardReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store
