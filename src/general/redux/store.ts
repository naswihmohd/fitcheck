import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import authReducer from '../../features/login/redux/authSlice';
import productsReducer from '../../features/products/redux/productSlice';
import brandsReducer from '../../features/brandManagement/redux/brandSlice';
import colorsReducer from '../../features/colorManagement/redux/colorSlice';
import unitsReducer from '../../features/unitManagement/redux/unitSlice';
import generalReducer from '../../features/settings/redux/generalSlice';
import firstCategoriesReducer from '../../features/firstCategory/redux/firstCategorySlice';
import secondCategoriesReducer from '../../features/secondCategory/redux/secondCategorySlice';
import thirdCategoriesReducer from '../../features/thirdCategory/redux/thirdCategorySlice';
import fourthCategoriesReducer from '../../features/fourthCategory/redux/fourthCategorySlice';
import themeReducer from '../../features/categoryManagement/redux/themeSlice';
import keywordsReducer from '../../features/keywords/redux/keywordSlice';
import bannersReducer from '../../features/heroBanner/redux/bannerSlice';
import ordersReducer from '../../features/orders/redux/orderSlice';
import customersReducer from '../../features/users/redux/customerSlice';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['companyId', 'user', 'companyData', 'branchId'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    products: productsReducer,
    brands: brandsReducer,
    colors: colorsReducer,
    units: unitsReducer,
    orders: ordersReducer,
    customers: customersReducer,
    general: generalReducer,
    firstCategories: firstCategoriesReducer,
    secondCategories: secondCategoriesReducer,
    thirdCategories: thirdCategoriesReducer,
    fourthCategories: fourthCategoriesReducer,
    theme: themeReducer,
    keywords: keywordsReducer,
    banners: bannersReducer,
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