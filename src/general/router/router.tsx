import { createBrowserRouter } from 'react-router';
import NotFound from './NotFound';
import SuperAdminLayout from '../../features/superAdmin/superAdminSidebar/presentation/SuperAdminLayout.tsx';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../features/login/presentation/Login';
import SuperAdminDashboard from '../../features/superAdmin/superAdminDashboard/presentation/SuperAdminDashboard.tsx';
import AttendanceAdminLayout from '../../features/attendanceAdmin/attendanceAdminLayout/presentation/AttendanceAdminLayout.tsx';
import ShiftManagement from '../../features/attendanceAdmin/shifts/presentation/ShiftManagement.tsx';
import ShiftDetails from '../../features/attendanceAdmin/shifts/presentation/components/ShiftDetails.tsx';
import HolydayManagement from '../../features/attendanceAdmin/holyday/presentation/HolydayManagement.tsx';
import EmployeeManagement from '../../features/attendanceAdmin/employeeManagement/presentation/EmployeeManagement.tsx';
import AddEmployee from '../../features/attendanceAdmin/employeeManagement/presentation/components/AddEmployee.tsx';
import EmployeeDetails from '../../features/attendanceAdmin/employeeDetails/presentation/EmployeeDetails.tsx';
import AllEmployees from '../../features/attendanceAdmin/employeeManagement/presentation/components/AllEmployees.tsx';
import EmployeeInfo from '../../features/attendanceAdmin/employeeDetails/presentation/components/EmployeeInfo.tsx';
import Attendance from '../../features/attendanceAdmin/attendance/presentation/Attendance.tsx';


export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SuperAdminDashboard />, },
      { path: 'branches', element: <div>Branches</div> },
      { path: 'branches/:branchId', element: <div>Branch Detail</div> },
      { path: 'branches/:branchId/:userId', element: <div>Edit Branch Access</div> },
      { path: 'terms-condition', element: <div>Terms & Conditions</div> },
      { path: 'reports-analytics', element: <div>Reports & Analytics</div> },
      { path: 'fee-collection', element: <div>Fee Collection</div> },
      { path: 'holidays', element: <div>Holidays</div> },
    ],
  },
  {
    path: "/attendance",
    element: (
      <ProtectedRoute allowedRoles={["attendanceAdmin", "admin"]}>
        <AttendanceAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Branch Dashboard</div> },
      {
        path: 'employee-management', element: <EmployeeManagement />,
        children: [
          { index: true, element: <AllEmployees /> },
          { path: 'active', element: <div>Active Employees</div> },
          { path: 'inactive', element: <div>Inactive Employees</div> },
        ],
      },
      { path: 'employee-management/add-new-employee', element: <AddEmployee /> },
      { path: 'employee-management/add-new-employee/:employeeId', element: <AddEmployee /> },
      {
        path: 'employee-management/:employeeId', element: <EmployeeDetails />,
        children: [
          { index: true, element: <div>Live Attendance</div> },
          { path: 'attendance', element: <Attendance /> },
          { path: 'salary', element: <div>Salary</div> },
          { path: 'employee-info', element: <EmployeeInfo /> },
        ],
      },
      { path: 'shifts', element: <ShiftManagement /> },
      { path: 'shifts/details', element: <ShiftDetails /> },
      { path: 'holidays', element: <HolydayManagement /> },
      { path: 'sales-executive-management', element: <div>Sales Executive Management</div> },
      { path: 'fee-management', element: <div>Fee Management</div> },
      { path: 'batch-management', element: <div>Batch Management</div> },
      { path: 'tutor-management', element: <div>Tutor Management</div> },
      { path: 'student-management', element: <div>Student Management</div> },
      { path: 'placement-management', element: <div>Placement Management</div> },
      { path: 'notice-settings', element: <div>Notice Settings</div> },
      { path: 'test-portal', element: <div>Test Portal</div> },
      { path: 'appointments', element: <div>Appointments</div> },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
