import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './general/router/router';
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { AppDispatch, RootState } from './general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setBranchData, setBranchId, setUser } from './features/login/redux/authSlice';
import type { UserProps } from './features/superAdminBranches/data/userTypes';
import type { BranchProps } from './features/superAdminBranches/data/branchTypes';

function App() {

  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { branchId } = useSelector((state: RootState) => state.user);

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
            if (userData.role === "branchAdmin") {
              dispatch(setBranchId(userData.branchId));
            }
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

          if (userData.role === "branchAdmin") {
            dispatch(setBranchId(userData.branchId));
          }
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
    if (!branchId) return;
    const fetchBranchData = async () => {
      const branchDocRef = doc(db, "branches", branchId);
      const branchDoc = await getDoc(branchDocRef);
      if (branchDoc.exists()) {
        const branchData = branchDoc.data() as BranchProps;
        dispatch(setBranchData(branchData));
      }
    }
    fetchBranchData();

  }, [branchId]);

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


