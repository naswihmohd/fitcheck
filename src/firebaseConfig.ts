import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyDhvvxhYtYLhMCzOp9Q98PxTl31elnQYqQ",
  authDomain: "fitchecksurplus.firebaseapp.com",
  projectId: "fitchecksurplus",
  storageBucket: "fitchecksurplus.firebasestorage.app",
  messagingSenderId: "628698026069",
  appId: "1:628698026069:web:c34c52e15463dea40c04dc"
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