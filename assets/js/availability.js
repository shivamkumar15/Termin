import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//  Protect admin
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

const form = document.getElementById("availabilityForm");
const serviceSelect = document.getElementById("serviceSelect");

// Load service availability
const loadAvailability = async () => {
  const ref = doc(db, "availability", "services");
  const snap = await getDoc(ref);

  document.querySelectorAll("input[data-day]").forEach(i => i.value = "");

  if (!snap.exists()) return;

  const data = snap.data();
  const serviceData = data[serviceSelect.value];

  if (!serviceData) return;

  Object.keys(serviceData).forEach(day => {
    const input = document.querySelector(`input[data-day="${day}"]`);
    if (input) input.value = serviceData[day].join(", ");
  });
};

serviceSelect.addEventListener("change", loadAvailability);
loadAvailability();

// Save availability
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ref = doc(db, "availability", "services");
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};

  const serviceAvailability = {};

  document.querySelectorAll("input[data-day]").forEach(input => {
    const times = input.value
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    if (times.length) {
      serviceAvailability[input.dataset.day] = times;
    }
  });

  existing[serviceSelect.value] = serviceAvailability;

  await setDoc(ref, existing);

  alert("Service availability saved");
});
