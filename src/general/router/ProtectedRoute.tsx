// src/routes/ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../redux/store";

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    // TODO: Replace with actual user authentication/authorization
    // This should retrieve user from auth context, Redux store, or localStorage
    const { user } = useSelector((state: RootState) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <>
            {user.role === "admin" && <Navigate to="/" replace />}
            {user.role === "branchAdmin" && <Navigate to="/branch" replace />}
        </>
    }

    return <>{children}</>;
};

export default ProtectedRoute;
