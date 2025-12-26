import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

function logout() {
  signOut(auth).then(() => {
    window.location.href = "../auth/login.html";
  }).catch((error) => {
    console.error("Logout error", error);
  });
}

// Attach logout to window so HTML can call it
window.logout = logout;

// Simple auth check - listener will handle redirect if needed, but for faster UX we also check local storage if we were using it, 
// but since we are using Firebase Auth, we must wait for the listener or use the synchronous check (not available in v9 modular SDK easily without persistence wait).
// For this MVP, we will rely on onAuthStateChanged in the specific page scripts, BUT checking here is good for general layout.

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // If we are in the dashboard directory, redirect to login
    if (window.location.pathname.includes("/dashboard/")) {
      window.location.href = "../auth/login.html";
    }
  }
});
