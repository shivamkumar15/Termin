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
    platform: document.getElementById("platform").value,
    status: "upcoming",
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "bookings"), bookingData);

    alert("✅ Appointment booked successfully!");
    window.location.href = "confirmation.html";

  } catch (error) {
    console.error("Booking failed:", error);
    alert("❌ Something went wrong. Try again.");
  }
});


function generateMeetingLink(platform) {
  switch (platform) {
    case "Google Meet":
      return "https://meet.google.com/new";
    case "Zoom":
      return "https://zoom.us/j/123456789";
    case "Teams":
      return "https://teams.microsoft.com/l/meetup-join";
    default:
      return "https://your-custom-link.com";
  }
}
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");

dateInput.addEventListener("change", generateSlots);

function generateSlots() {
  timeSelect.innerHTML = "";

  const selectedDate = dateInput.value;
  if (!selectedDate) return;

  const dayName = new Date(selectedDate).toLocaleString("en-US", { weekday: "long" });
  const availability = JSON.parse(localStorage.getItem("termin_availability"));
  const bookings = JSON.parse(localStorage.getItem("termin_bookings")) || [];

  if (!availability || !availability[dayName]?.enabled) {
    timeSelect.innerHTML = `<option>No availability</option>`;
    return;
  }

  const start = availability[dayName].start;
  const end = availability[dayName].end;
  const duration = parseInt(availability.slotDuration);

  const bookedSlots = bookings
    .filter(b => b.date === selectedDate)
    .map(b => b.time);

  let current = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  let hasSlots = false;

  while (current + duration <= endMinutes) {
    const slot = minutesToTime(current);

    if (!bookedSlots.includes(slot)) {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      timeSelect.appendChild(option);
      hasSlots = true;
    }

    current += duration;
  }

  if (!hasSlots) {
    timeSelect.innerHTML = `<option>No slots available</option>`;
  }
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
const booking = {
  date: document.getElementById("date").value,
  time: document.getElementById("time").value,
  service: selectedService,
  platform: selectedPlatform
};

const bookings = JSON.parse(localStorage.getItem("termin_bookings")) || [];
bookings.push(booking);
localStorage.setItem("termin_bookings", JSON.stringify(bookings));

