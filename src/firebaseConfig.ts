import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyAV87QJQC_0jFjdnLA8gBeBC4DIOc1s4ns",
  authDomain: "edwin-c3b73.firebaseapp.com",
  projectId: "edwin-c3b73",
  storageBucket: "edwin-c3b73.firebasestorage.app",
  messagingSenderId: "1008026020560",
  appId: "1:1008026020560:web:6c4172a415509768f44cd5"
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