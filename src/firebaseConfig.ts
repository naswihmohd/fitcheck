import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCBWcqT2WITKBEc0Fj7wxXBfKkQ8pQDM0I",
  authDomain: "shopmateez.firebaseapp.com",
  projectId: "shopmateez",
  storageBucket: "shopmateez.firebasestorage.app",
  messagingSenderId: "454044452589",
  appId: "1:454044452589:web:63e12c6519bf170a1a2ee4"
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