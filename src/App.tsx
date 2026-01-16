import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './general/router/router';
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { AppDispatch, RootState } from './general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setBranchId, setCompanyData, setCompanyId, setUser } from './features/login/redux/authSlice';
import type { UserProps } from './features/login/data/userTypes';
import type { CompanyProps } from './features/login/data/companyTypes';

function App() {

  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { companyId, branchId, companyData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!auth.currentUser?.uid) {
      // dispatch(clearUser());
      return;
    } else if (auth.currentUser) {
      try {
        setLoading(true);
        const fetchUser = async () => {
          if (!auth.currentUser) return;
          const userDocRef = doc(db, "users", auth.currentUser.uid);

          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProps;
            dispatch(setUser(userData));
            dispatch(setCompanyId(userData.companyId));
          }
        }
        fetchUser();
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [auth.currentUser?.uid, dispatch]);


  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);

    // ✅ Real-time Firestore listener
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const userData = snapshot.data() as UserProps;
          dispatch(setUser(userData));
          setCompanyId(userData.companyId);
        } else {
          console.warn("User not found in Firestore");
        }
      },
      (error) => {
        setLoading(false);
        console.error("Error fetching user:", error);
      }
    );

    // ✅ Cleanup listener on unmount
    return () => unsubscribe();

  }, [dispatch]);



  useEffect(() => {
    if (!companyId) return;
    const fetchBranchData = async () => {
      const companyDocRef = doc(db, "companies", companyId);
      const companyDoc = await getDoc(companyDocRef);
      const companyData = companyDoc.data() as CompanyProps;
      dispatch(setCompanyData(companyData));
    }
    fetchBranchData();
  }, [companyId]);

  useEffect(() => {
    if (branchId) return;
    if (!companyData) return;
    // Find the initial branch by checking isInitialBranch boolean
    const branches = companyData.branches;
    const initialBranch = Object.values(branches).find(
      (branch) => branch.isInitialBranch === true
    );
    
    if (initialBranch) {
      dispatch(setBranchId(initialBranch.id));
    }
  }, [companyData, branchId]);

  return (
    <>
      {loading ?
        <div className='flex justify-center items-center h-screen'>Loading...</div> :
        <>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </>
      }
    </>
  );
}

export default App;


