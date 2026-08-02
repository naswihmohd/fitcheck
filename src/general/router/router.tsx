import { createBrowserRouter, Navigate } from 'react-router';
import NotFound from './NotFound';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../features/login/presentation/Login';
import Layout from '../../features/layout/presentation/Layout.tsx';
import Dashboard from '../../features/dashboard/presentation/Dashboard.tsx';
import LeadsManagement from '../../features/leadsManagement/presentation/LeadsManagement.tsx';
import FollowUps from '../../features/followUps/presentation/FollowUps.tsx';
import TodayFollowUps from '../../features/followUps/presentation/tabs/TodayFollowUps.tsx';
import TodayLeads from '../../features/followUps/presentation/tabs/TodayLeads.tsx';
import OverdueFollowUps from '../../features/followUps/presentation/tabs/OverdueFollowUps.tsx';
import Groups from '../../features/groups/presentation/Groups.tsx';
import GroupLeads from '../../features/groups/presentation/GroupLeads.tsx';
import TodoPage from '../../features/todo/presentation/TodoPage.tsx';

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "leads", element: <LeadsManagement /> },
      {
        path: "follow-ups",
        element: <FollowUps />,
        children: [
          { index: true, element: <Navigate to="today-follow-ups" replace /> },
          { path: "today-follow-ups", element: <TodayFollowUps /> },
          { path: "today-leads", element: <TodayLeads /> },
          { path: "overdue", element: <OverdueFollowUps /> },
        ],
      },
      { path: "groups", element: <Groups /> },
      { path: "groups/:status", element: <GroupLeads /> },
      { path: "todo", element: <TodoPage /> },
      { path: "todo/:projectId", element: <TodoPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
