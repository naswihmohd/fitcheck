import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyATy3C1mMQqPxRMcy9TdFsIX42yZWavn4U",
  authDomain: "emplotrackez.firebaseapp.com",
  projectId: "emplotrackez",
  storageBucket: "emplotrackez.firebasestorage.app",
  messagingSenderId: "1083222721604",
  appId: "1:1083222721604:web:bdc437ce29a458a2b52811",
  measurementId: "G-0P5LJSJMEX"
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