import { db } from "./firebase.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/auth/login.html";
  }
});

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("availabilityForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const availability = {};

  document.querySelectorAll("input[data-day]").forEach(input => {
    const day = input.dataset.day;
    const times = input.value
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    availability[day] = times;
  });

  await setDoc(doc(db, "availability", "default"), availability);

  alert("Availability saved");
});
