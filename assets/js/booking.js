// assets/js/booking.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("bookingForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const bookingData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    service: document.getElementById("service").value,
    platform: document.querySelector('input[name="platform"]:checked')?.value,
    createdAt: serverTimestamp()
  };

  await addDoc(collection(db, "bookings"), bookingData);

  alert(" Booking saved to Firestore!");
});
