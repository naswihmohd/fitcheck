import { createBrowserRouter } from 'react-router';
import NotFound from './NotFound';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../features/login/presentation/Login';
import Layout from '../../features/layout/presentation/Layout.tsx';
import Dashboard from '../../features/dashboard/presentation/Dashboard.tsx';
import AddProduct from '../../features/addProduct/presentation/AddProduct.tsx';
import Products from '../../features/products/presentation/Products.tsx';
import AllProducts from '../../features/products/presentation/components/AllProducts.tsx';
import BrandManagement from '../../features/brandManagement/presentation/BrandManagement.tsx';
import VariantManagement from '../../features/variantManagement/presentation/VariantManagement.tsx';
import ColorManagement from '../../features/colorManagement/presentation/ColorManagement.tsx';
import UnitManagement from '../../features/unitManagement/presentation/UnitManagement.tsx';
import Settings from '../../features/settings/presentation/Settings.tsx';
import AccountSettings from '../../features/settings/presentation/components/AccountSettings.tsx';
import SocialMediaSettings from '../../features/settings/presentation/components/SocialMediaSettings.tsx';
import CategoryManagement from '../../features/categoryManagement/presentation/CategoryManagement.tsx';
import FirstCategory from '../../features/firstCategory/presentation/FirstCategory.tsx';
import SecondCategory from '../../features/secondCategory/presentation/SecondCategory.tsx';
import ThirdCategory from '../../features/thirdCategory/presentation/ThirdCategory.tsx';
import FourthCategory from '../../features/fourthCategory/presentation/FourthCategory.tsx';
import Keywords from '../../features/keywords/presentation/Keywords.tsx';
import BannerManagement from '../../features/bannerManagement/presentation/BannerManagement.tsx';
import HeroBanner from '../../features/heroBanner/presentation/HeroBanner.tsx';
import LeadBanner from '../../features/leadBanner/presentation/LeadBanner.tsx';
import OfferBanner from '../../features/offerBanner/presentation/OfferBanner.tsx';
import StoreTheme from '../../features/storeTheme/presentation/StoreTheme.tsx';
import HeroThemes from '../../features/heroThemes/presentation/HeroThemes.tsx';
import Orders from '../../features/orders/presentation/Orders.tsx';
import OrdersTable from '../../features/orders/presentation/components/OrdersTable.tsx';
import Users from '../../features/users/presentation/Users.tsx';
import OrderDetail from '../../features/orderDetail/presentation/OrderDetail.tsx';
import AddNewCoupon from '../../features/coupons/presentation/components/AddNewCoupon.tsx';
import Coupons from '../../features/coupons/presentation/Coupons.tsx';
import Blogs from '../../features/blogs/presentation/Blogs.tsx';
import AddBlog from '../../features/blogs/presentation/AddBlog.tsx';
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'store-theme', element: <StoreTheme />,
        children: [
          { index: true, element: <HeroThemes /> },
          { path: 'lead-banner', element: <LeadBanner /> },
          { path: 'offer-banner', element: <OfferBanner /> },
        ]
      },
      { path: 'users', element: <Users /> },
      { path: 'orders/:orderId', element: <OrderDetail /> },
      {
        path: 'orders', element: <Orders />,
        children: [
          { index: true, element: <OrdersTable status={null} /> },
          { path: 'pending', element: <OrdersTable status="pending" /> },
          { path: 'shipped', element: <OrdersTable status="shipped" /> },
          { path: 'delivered', element: <OrdersTable status="delivered" /> },
          { path: 'cancelled', element: <OrdersTable status="cancelled" /> },
          { path: 'replaced', element: <OrdersTable status="replaced" /> },
          { path: 'rejected', element: <OrdersTable status="rejected" /> },
          { path: 'returned', element: <OrdersTable status="returned" /> },
        ],
      },
      {
        path: 'product-management', element: <Products />,
        children: [
          { index: true, element: <AllProducts /> },
          { path: 'active', element: <div>Active Products</div> },
          { path: 'inactive', element: <div>Inactive Products</div> },
          { path: 'trending', element: <div>Trending Products</div> },
        ],
      },
      { path: 'product-management/add-product', element: <AddProduct /> },
      { path: 'product-management/add-product/:productId', element: <AddProduct /> },
      {
        path: 'variant-management', element: <VariantManagement />, children: [
          { index: true, element: <BrandManagement /> },
          { path: 'color-management', element: <ColorManagement /> },
          { path: 'unit-management', element: <UnitManagement /> },
          { path: 'keyword-management', element: <Keywords /> },
        ]
      },
      {
        path: 'category-management', element: <CategoryManagement />,
        children: [
          { index: true, element: <FirstCategory /> },
          { path: ':firstCategoryId', element: <SecondCategory /> },
          { path: ':firstCategoryId/:secondCategoryId', element: <ThirdCategory /> },
          { path: ':firstCategoryId/:secondCategoryId/:thirdCategoryId', element: <FourthCategory /> },
        ]
      },
      { path: 'coupons', element: <Coupons /> },
      { path: 'coupons/add', element: <AddNewCoupon /> },
      { path: 'coupons/add/:couponId', element: <AddNewCoupon /> },
      {
        path: 'banner-management', element: <BannerManagement />,
        children: [
          { index: true, element: <HeroBanner /> },
          { path: 'lead-banner', element: <LeadBanner /> },
          { path: 'offer-banner', element: <OfferBanner /> },
        ]
      },
      { path: 'notification', element: <div>Notification</div> },
      { path: 'reports-analytics', element: <div>Reports & Analytics</div> },
      { path: 'blogs', element: <Blogs /> },
      { path: 'blogs/add', element: <AddBlog /> },
      { path: 'blogs/add/:blogId', element: <AddBlog /> },
      { path: 'contents', element: <div>Contents</div> },
      { path: 'leads', element: <div>Leads</div> },
      {
        path: 'settings',
        element: <Settings />,
        children: [
          { index: true, element: <AccountSettings /> },
          { path: 'social-media', element: <SocialMediaSettings /> },
          { path: 'privacy-policy', element: <div>Privacy & Policy</div> },
          { path: 'help-support', element: <div>Help & Support</div> },
          { path: 'onboarding', element: <div>On-Boarding Screen</div> },
          { path: 'delivery', element: <div>Delivery Settings</div> },
          { path: 'keyword-settings', element: <div>Keyword Settings</div> },
          { path: 'payment-gateway', element: <div>Payment Gateway</div> },
          { path: 'perfume-filters', element: <div>Perfume Filters</div> },
        ],
      },
    ],
  },
  // {
  //   path: "/attendance",
  //   element: (
  //     <ProtectedRoute allowedRoles={["attendanceAdmin", "admin"]}>
  //       <AttendanceAdminLayout />
  //     </ProtectedRoute>
  //   ),
  //   children: [
  //     { index: true, element: <div>Branch Dashboard</div> },
  //     {
  //       path: 'employee-management', element: <EmployeeManagement />,
  //       children: [
  //         { index: true, element: <AllEmployees /> },
  //         { path: 'active', element: <div>Active Employees</div> },
  //         { path: 'inactive', element: <div>Inactive Employees</div> },
  //       ],
  //     },
  //     { path: 'employee-management/add-new-employee', element: <AddEmployee /> },
  //     { path: 'employee-management/add-new-employee/:employeeId', element: <AddEmployee /> },
  //     {
  //       path: 'employee-management/:employeeId', element: <EmployeeDetails />,
  //       children: [
  //         { index: true, element: <div>Live Attendance</div> },
  //         { path: 'attendance', element: <Attendance /> },
  //         { path: 'salary', element: <div>Salary</div> },
  //         { path: 'employee-info', element: <EmployeeInfo /> },
  //       ],
  //     },
  //     { path: 'shifts', element: <ShiftManagement /> },
  //     { path: 'shifts/details', element: <ShiftDetails /> },
  //     { path: 'holidays', element: <HolydayManagement /> },
  //     { path: 'sales-executive-management', element: <div>Sales Executive Management</div> },
  //     { path: 'fee-management', element: <div>Fee Management</div> },
  //     { path: 'batch-management', element: <div>Batch Management</div> },
  //     { path: 'tutor-management', element: <div>Tutor Management</div> },
  //     { path: 'student-management', element: <div>Student Management</div> },
  //     { path: 'placement-management', element: <div>Placement Management</div> },
  //     { path: 'notice-settings', element: <div>Notice Settings</div> },
  //     { path: 'test-portal', element: <div>Test Portal</div> },
  //     { path: 'appointments', element: <div>Appointments</div> },
  //     {
  //       path: '*',
  //       element: <NotFound />,
  //     },
  //   ],
  // },
  {
    path: '*',
    element: <NotFound />,
  },
]);
