import { createBrowserRouter } from 'react-router';
import NotFound from './NotFound';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../features/login/presentation/Login';
import Layout from '../../features/layout/presentation/Layout.tsx';
import Dashboard from '../../features/dashboard/presentation/Dashboard.tsx';
import Transactions from '../../features/transactions/presentation/Transactions.tsx';

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
      { path: "transactions", element: <Transactions /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
