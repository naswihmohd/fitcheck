import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import type { AppDispatch } from "../../../general/redux/store";
import { setCompanyId, setUser } from "../redux/authSlice";
import type { UserProps } from "../data/userTypes";

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
        dispatch(setCompanyId(userData.companyId));
        // 🧭 Role-based navigation logic
        let path = "/";

        // if (userData.role === "manager") {
        //     dispatch(setBranchId(userData.companyId));

        //     const companyDocRef = doc(db, "companies", userData.companyId);
        //     const companyDoc = await getDoc(companyDocRef);
        //     const companyData = companyDoc.data() as CompanyProps;
        //     dispatch(setCompanyData(companyData));
        //     path = "/attendance";

        // } else if (userData.role === "admin") {
        //     const companyDocRef = doc(db, "companies", userData.companyId);
        //     const companyDoc = await getDoc(companyDocRef);
        //     const companyData = companyDoc.data() as CompanyProps;
        //     dispatch(setCompanyData(companyData));
        //     path = "/";
        // }

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
