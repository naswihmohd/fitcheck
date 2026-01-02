import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import type { UserProps } from "../../superAdminBranches/data/userTypes";
import type { AppDispatch } from "../../../general/redux/store";
import { setBranchData, setBranchId, setUser } from "../redux/authSlice";
import type { BranchProps } from "../../superAdminBranches/data/branchTypes";

interface AuthResult {
    status: "success" | "error";
    path?: string;
    message: string;
}

export async function verifyAndLoadUser(dispatch: AppDispatch): Promise<AuthResult> {
    try {
        const user = auth.currentUser;
        if (!user) {
            return {
                status: "error",
                message: "User not authenticated",
            };
        }

        // ✅ Use UID for fetching user document, not ID token
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return {
                status: "error",
                message: "User data not found in Firestore",
            };
        }

        const userData = userDoc.data() as UserProps;
        dispatch(setUser(userData));

        // 🧭 Role-based navigation logic
        let path = "/";

        if (userData.role === "branchAdmin") {
            dispatch(setBranchId(userData.branchId));

            const branchDocRef = doc(db, "branches", userData.branchId);
            const branchDoc = await getDoc(branchDocRef);
            const branchData = branchDoc.data() as BranchProps;
            dispatch(setBranchData(branchData));
            path = "/branch";

        } else if (userData.role === "admin") {
            path = "/";
        }

        return {
            status: "success",
            path,
            message: "User authenticated successfully",
        };
    } catch (err) {
        console.error("Post-login error:", err);
        return {
            status: "error",
            message: "Error loading user data",
        };
    }
}
