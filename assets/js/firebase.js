// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoG42Ps8GYjd2mHiij9__dkE05fPQUl_s",
  authDomain: "termin-15.firebaseapp.com",
  projectId: "termin-15",
  storageBucket: "termin-15.firebasestorage.app",
  messagingSenderId: "51456459044",
  appId: "1:51456459044:web:01086134a3dab9d041b3b1",
  measurementId: "G-QV5Q9EZKHG"
};

/// Initialize Firebase
//  EXPORT THESE
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);