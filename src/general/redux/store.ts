import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import authReducer from '../../features/login/redux/authSlice';
import shiftReducer from '../../features/attendanceAdmin/shifts/redux/shiftSlice';
import branchHolidaysReducer from '../../features/attendanceAdmin/holyday/redux/holydaySlice';
import branchEmployeesReducer from '../../features/attendanceAdmin/employeeManagement/redux/employeesSlice';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['companyId', 'user', 'companyData', 'branchId'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    branchShifts: shiftReducer,
    branchHolidays: branchHolidaysReducer,
    branchEmployees: branchEmployeesReducer,
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