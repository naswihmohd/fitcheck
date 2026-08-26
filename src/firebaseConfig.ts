import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyC7vQ8A6s2mFD-BMDRhu6PayXoRSAVRGm4",
  authDomain: "onrevv-accounts.firebaseapp.com",
  projectId: "onrevv-accounts",
  storageBucket: "onrevv-accounts.firebasestorage.app",
  messagingSenderId: "409219477125",
  appId: "1:409219477125:web:ce9d5168c62a2d1a9583ec"
};

// if (process.env.NODE_ENV !== 'production' && typeof window !== "undefined") {
//   console.warn('=========Development Mode=========');
//   //@ts-ignore
//   self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
// }

const app = initializeApp(firebaseConfig);

// export const appCheck =
//   typeof window !== "undefined"
//     ? initializeAppCheck(app, {
//       provider: new ReCaptchaEnterpriseProvider("6LeWnbErAAAAAHa0PfU9z1ZgsvejrYQVwYyOZhBR"),
//       isTokenAutoRefreshEnabled: true
//     })
//     : undefined;

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app);
export const functions = getFunctions(app);