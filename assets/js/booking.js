import { db } from "./firebase.js";
const SERVICE_ID = "service_r24h8mt";
const CUSTOMER_TEMPLATE = "template_sw3791p";
const ADMIN_TEMPLATE = "template_o5nic9g";


import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");

//  LOAD TIME SLOTS WHEN DATE CHANGES
const serviceSelect = document.getElementById("service");

dateInput.addEventListener("change", async () => {
  const date = dateInput.value;
  timeSelect.innerHTML = "";

  if (!date) return;

  //  Holiday check (existing logic stays)

  const dayName = new Date(date)
    .toLocaleDateString("en-US", { weekday: "long" });

  const service = serviceSelect.value;

  const ref = doc(db, "availability", "services");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    timeSelect.innerHTML = "<option>No availability</option>";
    return;
  }

  const data = snap.data();
  const slots = data?.[service]?.[dayName] || [];

  if (!slots.length) {
    timeSelect.innerHTML = "<option>No slots available</option>";
    return;
  }

  slots.forEach(slot => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    timeSelect.appendChild(option);
  });
});


//  SUBMIT BOOKING
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const date = dateInput.value;
  const time = timeSelect.value;

  if (!date || !time) {
    alert("Please select date and time");
    return;
  }

  //  DOUBLE BOOKING CHECK
  const q = query(
    collection(db, "bookings"),
    where("date", "==", date),
    where("time", "==", time)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    alert("This slot is already booked");
    return;
  }

  //  CREATE BOOKING OBJECT (IMPORTANT)
  const bookingData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    service: document.getElementById("service").value,
    platform: document.querySelector('input[name="platform"]:checked')?.value,
    date,
    time,
    createdAt: serverTimestamp()
  };

  // SAVE TO FIRESTORE
  await addDoc(collection(db, "bookings"), bookingData);

  //  CUSTOMER EMAIL
  await emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE, bookingData);

  //  ADMIN EMAIL
  await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, bookingData);

  alert(" Booking confirmed!");
  form.reset();
  timeSelect.innerHTML = "<option>Select a date first</option>";
});

 