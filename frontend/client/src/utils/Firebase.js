import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "hackaton2026-30412.firebaseapp.com",
  projectId: "hackaton2026-30412",
  storageBucket: "hackaton2026-30412.firebasestorage.app",
  messagingSenderId: "1015995839838",
  appId: "1:1015995839838:web:ce27613d549a760e274bcf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
