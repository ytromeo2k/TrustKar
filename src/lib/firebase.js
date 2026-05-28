import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase project: romeo-escrow (Google Cloud registered name)
 * Public-facing brand: TRUSTKAR
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDraeS2-d6szC_Gt8d-pVXILwywO5kII9Y",
  authDomain: "romeo-escrow.firebaseapp.com",
  projectId: "romeo-escrow",
  storageBucket: "romeo-escrow.firebasestorage.app",
  messagingSenderId: "899058347483",
  appId: "1:899058347483:web:da235c9d0290f601328bfe",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
