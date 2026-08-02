import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import authReducer from '../../features/login/redux/authSlice';
import blogsReducer from '../../features/blogs/redux/blogSlice';
import leadsReducer from '../../features/leadsManagement/redux/leadSlice';
import followUpsReducer from '../../features/followUps/redux/followUpSlice';
import groupsReducer from '../../features/groups/redux/groupSlice';
import dashboardReducer from '../../features/dashboard/redux/dashboardSlice';
import todoReducer from '../../features/todo/redux/todoSlice';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);


const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    blogs: blogsReducer,
    leads: leadsReducer,
    followUps: followUpsReducer,
    groups: groupsReducer,
    dashboard: dashboardReducer,
    todo: todoReducer,
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
