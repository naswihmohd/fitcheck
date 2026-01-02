import { createBrowserRouter } from 'react-router';
import NotFound from './NotFound';
import SuperAdminLayout from '../../features/superAdmin/superAdminSidebar/presentation/SuperAdminLayout.tsx';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../features/login/presentation/Login';
import BranchAdminLayout from '../../features/branchAdmin/branchAdminLayout/presentation/BranchAdminLayout.tsx';
import SuperAdminDashboard from '../../features/superAdmin/superAdminDashboard/presentation/SuperAdminDashboard.tsx';
import NewAdmission from '../../features/superAdmin/newAdmission/presentation/NewAdmission.tsx';
import AdmissionPendingStudents from '../../features/superAdmin/newAdmission/presentation/components/AdmissionPendingStudents.tsx';
import AdmissionCompletedStudents from '../../features/superAdmin/newAdmission/presentation/components/AdmissionCompletedStudents.tsx';
import Branches from '../../features/superAdmin/branches/presentation/Branches.tsx';


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
      {
        path: 'new-admission', element: <NewAdmission />,
        children: [
          { index: true, element: <AdmissionPendingStudents /> },
          { path: 'completed', element: <AdmissionCompletedStudents /> },
        ]
      },
      { path: 'branches', element: <Branches />, },
      { path: 'notice-board', element: <div>Notice Board</div> },
      { path: 'terms-condition', element: <div>Terms & Condition</div> },
      { path: 'reports-analytics', element: <div>Reports & Analytics</div> },
      { path: 'fee-collection', element: <div>Fee Collection</div> },
      { path: 'holidays', element: <div>Holidays</div> },
    ],
  },
  {
    path: "/branch",
    element: (
      <ProtectedRoute allowedRoles={["branchAdmin", "admin"]}>
        <BranchAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Branch Dashboard</div> },
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
