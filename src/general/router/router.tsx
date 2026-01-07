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
import TermsAndConditions from '../../features/superAdmin/termsAndConditions/presentation/TermsAndConditions.tsx';
import TermsAndConditionsForm from '../../features/superAdmin/termsAndConditions/presentation/components/TermsAndConditionsForm.tsx';
import PrivacyAndPolicyForm from '../../features/superAdmin/termsAndConditions/presentation/components/PrivacyAndPolicyForm.tsx';
import BranchDetail from '../../features/superAdmin/branchDetail/presentation/BranchDetail.tsx';
import EditBranchAccessPage from '../../features/superAdmin/branchLoginUsers/presentation/componets/EditBranchAccessPage.tsx';
import SuperAdminNoticeBoard from '../../features/superAdmin/superAdminNoticeBoard/presentation/SuperAdminNoticeBoard.tsx';
import StudentsNotification from '../../features/superAdmin/superAdminNoticeBoard/presentation/components/StudentsNotification.tsx';
import TutorNotification from '../../features/superAdmin/superAdminNoticeBoard/presentation/components/TutorNotification.tsx';
import SaleExecutiveNotification from '../../features/superAdmin/superAdminNoticeBoard/presentation/components/SaleExecutiveNotification.tsx';
import PlacementExecutiveNotification from '../../features/superAdmin/superAdminNoticeBoard/presentation/components/PlacementExecutiveNotification.tsx';
import BranchesNotification from '../../features/superAdmin/superAdminNoticeBoard/presentation/components/BranchesNotification.tsx';
import TutorManagement from '../../features/branchAdmin/tutorManagement/presentation/TutorManagement.tsx';
import Courses from '../../features/branchAdmin/courses/presentation/Courses.tsx';
import BatchManagement from '../../features/branchAdmin/batchManagement/presentation/BatchManagement.tsx';


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
      {
        path: 'notice-board', element: <SuperAdminNoticeBoard />,
        children: [
          { index: true, element: <StudentsNotification /> },
          { path: 'tutor', element: <TutorNotification /> },
          { path: 'sales-executive', element: <SaleExecutiveNotification /> },
          { path: 'placement-executive', element: <PlacementExecutiveNotification /> },
          { path: 'branches', element: <BranchesNotification /> },
        ]
      },
      { path: 'branches', element: <Branches /> },
      { path: 'branches/:branchId', element: <BranchDetail /> },
      { path: 'branches/:branchId/:userId', element: <EditBranchAccessPage /> },
      {
        path: 'terms-condition', element: <TermsAndConditions />, children: [
          { index: true, element: <TermsAndConditionsForm /> },
          { path: 'privacy', element: <PrivacyAndPolicyForm /> },
        ]
      },
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
      { path: 'batch-management', element: <Courses /> },
      { path: 'batch-management/:courseId', element: <BatchManagement /> },
      { path: 'tutor-management', element: <TutorManagement /> },
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
