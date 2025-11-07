import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnDljRdkuemaM9lYBZy7lt8bsoYPdDk2g",
  authDomain: "xlist-34ba9.firebaseapp.com",
  projectId: "xlist-34ba9",
  storageBucket: "xlist-34ba9.firebasestorage.app",
  messagingSenderId: "274632216273",
  appId: "1:274632216273:web:e78f9fafba5092ca043ff0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;