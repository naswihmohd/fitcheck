import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './general/router/router';
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { AppDispatch } from './general/redux/store';
import { useDispatch } from 'react-redux';
import { clearUser, setUser } from './features/login/redux/authSlice';
import PwaInstallBanner from './features/layout/presentation/components/PwaInstallBanner';
import useAppSeo from './features/layout/presentation/hooks/useAppSeo';
import { isAllowedEmail } from './features/login/constants/allowedEmails';

function App() {
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  useAppSeo();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!isAllowedEmail(firebaseUser.email)) {
          await signOut(auth);
          dispatch(clearUser());
          setLoading(false);
          return;
        }

        dispatch(setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName,
        }));
      } else {
        dispatch(clearUser());
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
      <PwaInstallBanner />
    </>
  );
}

export default App;
