import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const errorText = document.getElementById("error");

// LOGIN LOGIC
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "../dashboard/dashboard.html";
    } catch (error) {
      errorText.textContent = error.message;
    }
  });
}

// SIGNUP LOGIC
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Auto login happens, redirect
      window.location.href = "../dashboard/dashboard.html";
    } catch (error) {
      errorText.textContent = error.message;
    }
  });
}
