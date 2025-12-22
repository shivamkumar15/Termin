import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//  Protect page
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "/auth/login.html";
});

const form = document.getElementById("holidayForm");
const textarea = document.getElementById("holidayDates");

// Load existing holidays
const loadHolidays = async () => {
  const ref = doc(db, "holidays", "default");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    textarea.value = snap.data().dates.join(", ");
  }
};

loadHolidays();

// Save holidays
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dates = textarea.value
    .split(",")
    .map(d => d.trim())
    .filter(Boolean);

  await setDoc(doc(db, "holidays", "default"), { dates });

  alert(" Holidays saved");
});
